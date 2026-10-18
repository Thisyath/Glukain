import { Router, Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { authJwt } from '../middlewares/authJwt';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', authJwt, async (req: Request, res: Response) => {
  try {
    const data = await dashboardService.getDashboard(req.user!.id);
    res.json({ data });
  } catch (error: any) {
    res.status(error.status || 500).json({
      error: { code: error.code || 'INTERNAL_ERROR', message: error.message },
    });
  }
});

router.get('/recommendations/latest', authJwt, async (req: Request, res: Response) => {
  try {
    const data = await dashboardService.getLatestRecommendation(req.user!.id);
    if (!data) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Belum ada rekomendasi' },
      });
    }
    res.json({ data });
  } catch (error: any) {
    res.status(error.status || 500).json({
      error: { code: error.code || 'INTERNAL_ERROR', message: error.message },
    });
  }
});

router.get('/alerts/active', authJwt, async (req: Request, res: Response) => {
  try {
    const data = await prisma.alert.findFirst({
      where: { userId: req.user!.id, resolvedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: data || null });
  } catch (error: any) {
    res.status(error.status || 500).json({
      error: { code: error.code || 'INTERNAL_ERROR', message: error.message },
    });
  }
});

router.get('/history', authJwt, async (req: Request, res: Response) => {
  try {
    const range = (req.query.range as string) || '3m';
    const data = await dashboardService.getHistory(req.user!.id, range);
    res.json({ data });
  } catch (error: any) {
    res.status(error.status || 500).json({
      error: { code: error.code || 'INTERNAL_ERROR', message: error.message },
    });
  }
});

export default router;
