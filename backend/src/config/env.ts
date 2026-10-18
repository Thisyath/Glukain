import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-secret-key-32chars-minimum-required',
    accessTTL: parseInt(process.env.JWT_ACCESS_TTL || '900'),
    refreshTTLDays: parseInt(process.env.REFRESH_TTL_DAYS || '7'),
  },
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  // OPSIONAL — belum dipakai. Selama kosong, ekstraksi dokumen memakai mode mock
  // (lihat extraction.service.ts). Isi saat API AI sudah tersedia.
  ai: {
    apiKey: process.env.AI_API_KEY || '',
    model: process.env.AI_MODEL || 'gemini-1.5-flash',
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
  },
  midtrans: {
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  },
};
