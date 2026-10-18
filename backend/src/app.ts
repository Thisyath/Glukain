import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { apiLimiter } from './middlewares/rateLimit';

// Routes
import authRoutes from './routes/auth.routes';
import documentsRoutes from './routes/documents.routes';
import dashboardRoutes from './routes/dashboard.routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: env.frontendOrigin,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', db: 'up', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/documents', documentsRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1', dashboardRoutes); // /recommendations, /alerts, /history

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Terjadi kesalahan server',
    },
  });
});

export default app;
