import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { extractionService, extractionValuesSchema } from '../services/extraction.service';
import { classificationService } from '../services/classification.service';
import { authJwt } from '../middlewares/authJwt';
import { validate } from '../middlewares/validate';

const router = Router();
const prisma = new PrismaClient();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format tidak didukung, gunakan JPG/PNG/PDF'));
    }
  },
});

// UC-04: Upload document
router.post('/', authJwt, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'File wajib diunggah' },
      });
    }

    const checkupDate = req.body.checkupDate ? new Date(req.body.checkupDate) : undefined;
    const result = await extractionService.uploadDocument(req.user!.id, req.file, checkupDate);
    res.status(202).json({ data: result });
  } catch (error: any) {
    res.status(error.status || 500).json({
      error: { code: error.code || 'INTERNAL_ERROR', message: error.message },
    });
  }
});

// List documents
router.get('/', authJwt, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const docs = await extractionService.listDocuments(req.user!.id, page, limit);
    res.json({ data: docs });
  } catch (error: any) {
    res.status(error.status || 500).json({
      error: { code: error.code || 'INTERNAL_ERROR', message: error.message },
    });
  }
});

// Get document with extraction result
router.get('/:id', authJwt, async (req: Request, res: Response) => {
  try {
    const doc = await extractionService.getDocument(req.params.id, req.user!.id);
    res.json({ data: doc });
  } catch (error: any) {
    res.status(error.status || 500).json({
      error: { code: error.code || 'INTERNAL_ERROR', message: error.message },
    });
  }
});

// UC-20: Confirm/correct extraction
router.put('/:id/extraction', authJwt, validate(z.object({
  checkupDate: z.string().optional(),
  values: extractionValuesSchema,
})), async (req: Request, res: Response) => {
  try {
    const { values, checkupDate } = req.body;
    await extractionService.confirmExtraction(req.params.id, req.user!.id, values, checkupDate ? new Date(checkupDate) : undefined);

    // Get extraction ID for classification
    const doc = await extractionService.getDocument(req.params.id, req.user!.id);
    const extractionId = doc.extractionResult?.id;

    if (extractionId) {
      // UC-06: Classify phase
      const classification = await classificationService.classifyPhase(extractionId, req.user!.id);

      // Get recommendation
      const rec = await prisma.recommendation.findFirst({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        data: {
          phase: {
            code: classification.code,
            label: classification.label,
            reason: classification.reason,
          },
          recommendation: rec
            ? { diet: rec.dietText, activity: rec.activityText, medicationNote: rec.medicationNote }
            : null,
          alert: classification.code === 'HIGH_RISK' ? { message: 'Segera hubungi tenaga medis.' } : null,
          disclaimer: 'Hasil ini bukan pengganti saran dokter.',
        },
      });
    }
  } catch (error: any) {
    res.status(error.status || 500).json({
      error: { code: error.code || 'INTERNAL_ERROR', message: error.message },
    });
  }
});

// Retry extraction
router.post('/:id/retry', authJwt, async (req: Request, res: Response) => {
  try {
    await extractionService.retryExtraction(req.params.id, req.user!.id);
    res.status(202).json({ data: { message: 'Ekstraksi dimulai ulang' } });
  } catch (error: any) {
    res.status(error.status || 500).json({
      error: { code: error.code || 'INTERNAL_ERROR', message: error.message },
    });
  }
});

export default router;
