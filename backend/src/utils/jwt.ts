import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { env } from '../config/env';

export interface AccessTokenPayload {
  sub: string;
  iat: number;
  exp: number;
  jti: string;
}

export function generateAccessToken(userId: string): string {
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign(
    { sub: userId, iat: now, exp: now + env.jwt.accessTTL, jti: randomUUID() },
    env.jwt.accessSecret
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwt.accessSecret) as AccessTokenPayload;
}

export function generateRefreshToken(): string {
  return randomUUID() + randomUUID().replace(/-/g, '');
}

export function hashToken(token: string): string {
  // SHA-256 hash for DB storage
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(token).digest('hex');
}
