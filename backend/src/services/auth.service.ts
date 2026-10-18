import { User, EmailToken } from '@prisma/client';
import argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { env } from '../config/env';
import { generateAccessToken, generateRefreshToken, hashToken } from '../utils/jwt';
import { addDays, addMinutes, isExpired } from '../utils/time';
import { prisma } from '../lib/prisma';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    name: string;
    email: string;
    isPremium: boolean;
  };
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async register(name: string, email: string, password: string, consent: boolean): Promise<{ userId: string; message: string }> {
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      throw Object.assign(new Error('Email sudah terdaftar'), { code: 'EMAIL_EXISTS', status: 409 });
    }

    const passwordHash = await argon2.hash(password);
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        consentAt: consent ? new Date() : null,
      },
    });

    // Create verification token
    const verificationToken = await this.createEmailToken(user.id, 'VERIFY', 15);

    // In production: send email. For dev: log to console
    console.log(`[DEV] Verification link: ${env.frontendOrigin}/verify-email?token=${verificationToken}`);

    return { userId: user.id, message: 'Cek email Anda untuk verifikasi' };
  }

  async verifyEmail(token: string): Promise<void> {
    const tokenHash = hashToken(token);
    const emailToken = await prisma.emailToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!emailToken || emailToken.usedAt || emailToken.type !== 'VERIFY') {
      throw Object.assign(new Error('Token tidak valid atau sudah digunakan'), { code: 'INVALID_TOKEN', status: 400 });
    }

    if (isExpired(emailToken.expiresAt)) {
      throw Object.assign(new Error('Token kedaluwarsa'), { code: 'TOKEN_EXPIRED', status: 400 });
    }

    await prisma.$transaction([
      prisma.emailToken.update({
        where: { id: emailToken.id },
        data: { usedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: emailToken.userId },
        data: { emailVerifiedAt: new Date() },
      }),
    ]);
  }

  async login(email: string, password: string, ip?: string, userAgent?: string): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // Generic error - don't reveal if email exists
    if (!user) {
      throw Object.assign(new Error('Email atau password salah'), { code: 'INVALID_CREDENTIALS', status: 401 });
    }

    // Check lockout
    if (user.lockedUntil && !isExpired(user.lockedUntil)) {
      throw Object.assign(new Error('Terlalu banyak percobaan, coba lagi dalam 15 menit'), { code: 'ACCOUNT_LOCKED', status: 423 });
    }

    // Verify password
    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      const failedCount = user.failedLoginCount + 1;
      const lockedUntil = failedCount >= 5 ? addMinutes(new Date(), 15) : null;
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginCount: failedCount, lockedUntil },
      });
      throw Object.assign(new Error('Email atau password salah'), { code: 'INVALID_CREDENTIALS', status: 401 });
    }

    // Check email verified
    if (!user.emailVerifiedAt) {
      throw Object.assign(new Error('Email belum diverifikasi'), { code: 'EMAIL_NOT_VERIFIED', status: 403 });
    }

    // Reset failed count on success
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken();
    const refreshTTLDays = env.jwt.refreshTTLDays;

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        familyId: randomBytes(16).toString('hex'),
        tokenHash: hashToken(refreshToken),
        expiresAt: addDays(new Date(), refreshTTLDays),
        userAgent,
        ip,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: { userId: user.id, action: 'LOGIN', ip, meta: { userAgent } },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: env.jwt.accessTTL,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isPremium: false, // TODO: check subscription
      },
    };
  }

  async refreshToken(refreshToken: string, ip?: string, userAgent?: string): Promise<TokenResponse> {
    const tokenHash = hashToken(refreshToken);
    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored || stored.revokedAt) {
      throw Object.assign(new Error('Token tidak valid'), { code: 'UNAUTHORIZED', status: 401 });
    }

    if (isExpired(stored.expiresAt)) {
      throw Object.assign(new Error('Token kedaluwarsa'), { code: 'TOKEN_EXPIRED', status: 401 });
    }

    // Rotate: revoke old, create new
    const newRefreshToken = generateRefreshToken();
    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAt: new Date() },
      }),
      prisma.refreshToken.create({
        data: {
          userId: stored.userId,
          familyId: stored.familyId,
          tokenHash: hashToken(newRefreshToken),
          expiresAt: addDays(new Date(), env.jwt.refreshTTLDays),
          userAgent,
          ip,
        },
      }),
    ]);

    const accessToken = generateAccessToken(stored.userId);
    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashToken(refreshToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    // Always return neutral - anti user enumeration
    if (!user) {
      return { message: 'Jika email terdaftar, tautan dikirim' };
    }

    const resetToken = await this.createEmailToken(user.id, 'RESET', 30);

    // In production: send email via SMTP (nodemailer). For dev: log to console,
    // karena SMTP_USER/SMTP_PASS masih kosong sehingga tautan tidak bisa dikirim.
    console.log(`[DEV] Reset link: ${env.frontendOrigin}/reset-password?token=${resetToken}`);

    return { message: 'Jika email terdaftar, tautan dikirim' };
  }

  // Respons selalu netral — anti user enumeration
  async resendVerification(email: string): Promise<{ message: string }> {
    const neutral = { message: 'Jika email terdaftar dan belum terverifikasi, tautan telah dikirim' };

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || user.emailVerifiedAt) {
      return neutral;
    }

    const verificationToken = await this.createEmailToken(user.id, 'VERIFY', 15);
    console.log(`[DEV] Verification link: ${env.frontendOrigin}/verify-email?token=${verificationToken}`);

    return neutral;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = hashToken(token);
    const emailToken = await prisma.emailToken.findUnique({
      where: { tokenHash },
    });

    if (!emailToken || emailToken.usedAt || emailToken.type !== 'RESET') {
      throw Object.assign(new Error('Token tidak valid'), { code: 'INVALID_TOKEN', status: 400 });
    }

    if (isExpired(emailToken.expiresAt)) {
      throw Object.assign(new Error('Token kedaluwarsa'), { code: 'TOKEN_EXPIRED', status: 400 });
    }

    const passwordHash = await argon2.hash(newPassword);

    await prisma.$transaction([
      prisma.emailToken.update({
        where: { id: emailToken.id },
        data: { usedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: emailToken.userId },
        data: { passwordHash },
      }),
      // Revoke all refresh tokens
      prisma.refreshToken.updateMany({
        where: { userId: emailToken.userId },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  private async createEmailToken(userId: string, type: 'VERIFY' | 'RESET', expiryMinutes: number): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);

    await prisma.emailToken.create({
      data: {
        userId,
        type,
        tokenHash,
        expiresAt: addMinutes(new Date(), expiryMinutes),
      },
    });

    return token;
  }

  // getLastToken is no longer needed - createEmailToken returns the token directly
}

export const authService = new AuthService();
