import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { validate } from '../middlewares/validate';
import { authLimiter } from '../middlewares/rateLimit';
import { authJwt } from '../middlewares/authJwt';

const router = Router();

// Schemas
const registerSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(100),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter').regex(/[a-zA-Z]/, 'Password wajib mengandung huruf').regex(/[0-9]/, 'Password wajib mengandung angka'),
  confirmPassword: z.string(),
  consent: z.literal(true),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Konfirmasi password tidak sama',
  path: ['confirmPassword'],
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password wajib diisi'),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token wajib diisi'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8, 'Password minimal 8 karakter').regex(/[a-zA-Z]/).regex(/[0-9]/),
});

// UC-01: Register
router.post('/register', authLimiter, validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { name, email, password, consent } = req.body;
    const result = await authService.register(name, email, password, consent);
    res.status(201).json({ data: { message: result.message } });
  } catch (error: any) {
    res.status(error.status || 500).json({
      error: { code: error.code || 'INTERNAL_ERROR', message: error.message },
    });
  }
});

// UC-18: Verify Email
router.post('/verify-email', validate(verifyEmailSchema), async (req: Request, res: Response) => {
  try {
    await authService.verifyEmail(req.body.token);
    res.json({ data: { message: 'Email berhasil diverifikasi' } });
  } catch (error: any) {
    res.status(error.status || 500).json({
      error: { code: error.code || 'INTERNAL_ERROR', message: error.message },
    });
  }
});

// UC-02: Login
router.post('/login', authLimiter, validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(
      email,
      password,
      req.ip,
      req.headers['user-agent']
    );

    // Set refresh token cookie
    res.cookie('refresh_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/v1/auth',
    });

    res.json({ data: result });
  } catch (error: any) {
    res.status(error.status || 500).json({
      error: { code: error.code || 'INTERNAL_ERROR', message: error.message },
    });
  }
});

// UC-22: Refresh Token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Token tidak ditemukan' },
      });
    }

    const result = await authService.refreshToken(refreshToken, req.ip, req.headers['user-agent']);
    res.json({ data: result });
  } catch (error: any) {
    res.status(error.status || 500).json({
      error: { code: error.code || 'INTERNAL_ERROR', message: error.message },
    });
  }
});

// UC-03: Logout
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    res.clearCookie('refresh_token', { path: '/api/v1/auth' });
    res.status(204).send();
  } catch (error: any) {
    res.status(error.status || 500).json({
      error: { code: error.code || 'INTERNAL_ERROR', message: error.message },
    });
  }
});

// UC-19: Forgot Password
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), async (req: Request, res: Response) => {
  try {
    const result = await authService.forgotPassword(req.body.email);
    res.json({ data: result });
  } catch (error: any) {
    res.status(error.status || 500).json({
      error: { code: error.code || 'INTERNAL_ERROR', message: error.message },
    });
  }
});

// UC-19: Reset Password
router.post('/reset-password', validate(resetPasswordSchema), async (req: Request, res: Response) => {
  try {
    await authService.resetPassword(req.body.token, req.body.newPassword);
    res.json({ data: { message: 'Password berhasil diubah' } });
  } catch (error: any) {
    res.status(error.status || 500).json({
      error: { code: error.code || 'INTERNAL_ERROR', message: error.message },
    });
  }
});

export default router;
