import rateLimit from 'express-rate-limit';

// General API rate limit
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: { code: 'RATE_LIMITED', message: 'Terlalu banyak permintaan, coba lagi nanti' },
  },
});

// Stricter limit for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    error: { code: 'RATE_LIMITED', message: 'Terlalu banyak percobaan, coba lagi nanti' },
  },
});
