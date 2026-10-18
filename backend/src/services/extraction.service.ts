import { PrismaClient, DocumentStatus } from '@prisma/client';
import { validationRanges } from '../config/thresholds';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for extraction values
export const extractionValuesSchema = z.object({
  hba1c: z.number().min(validationRanges.hba1c.min).max(validationRanges.hba1c.max).optional(),
  fastingGlucose: z.number().int().min(validationRanges.fastingGlucose.min).max(validationRanges.fastingGlucose.max).optional(),
  randomGlucose: z.number().int().min(validationRanges.randomGlucose.min).max(validationRanges.randomGlucose.max).optional(),
  totalCholesterol: z.number().int().min(validationRanges.totalCholesterol.min).max(validationRanges.totalCholesterol.max).optional(),
  ldl: z.number().int().min(validationRanges.ldl.min).max(validationRanges.ldl.max).optional(),
  hdl: z.number().int().min(validationRanges.hdl.min).max(validationRanges.hdl.max).optional(),
  triglyceride: z.number().int().min(validationRanges.triglyceride.min).max(validationRanges.triglyceride.max).optional(),
  systolic: z.number().int().min(validationRanges.systolic.min).max(validationRanges.systolic.max).optional(),
  diastolic: z.number().int().min(validationRanges.diastolic.min).max(validationRanges.diastolic.max).optional(),
  weightKg: z.number().min(validationRanges.weightKg.min).max(validationRanges.weightKg.max).optional(),
}).refine(data => {
  // At least one value must be present
  return Object.values(data).some(v => v !== undefined);
}, { message: 'Minimal satu nilai medis harus diisi' });

export class ExtractionService {
  // UC-04: Upload document
  async uploadDocument(userId: string, file: Express.Multer.File, checkupDate?: Date): Promise<{ id: string; status: DocumentStatus }> {
    // Check daily quota (BR-09)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const uploadCount = await prisma.medicalDocument.count({
      where: { userId, uploadedAt: { gte: today } },
    });
    if (uploadCount >= 10) {
      throw Object.assign(new Error('Batas unggah harian tercapai (10/hari)'), { code: 'DAILY_QUOTA_EXCEEDED', status: 429 });
    }

    const doc = await prisma.medicalDocument.create({
      data: {
        userId,
        filePath: file.path,
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        status: 'PROCESSING',
        checkupDate: checkupDate || null,
      },
    });

    // Start async extraction
    this.extractData(doc.id, userId, file.path).catch(console.error);

    return { id: doc.id, status: 'PROCESSING' };
  }

  // UC-05: Extract medical data from document
  async extractData(documentId: string, userId: string, filePath: string): Promise<void> {
    try {
      // In production: call AI API (Gemini/OCR.space)
      // For now, simulate extraction with mock data
      const mockExtraction = await this.simulateExtraction(filePath);

      if (!mockExtraction || Object.keys(mockExtraction.values).length === 0) {
        await prisma.medicalDocument.update({
          where: { id: documentId },
          data: { status: 'UNRECOGNIZED' },
        });
        return;
      }

      await prisma.extractionResult.create({
        data: {
          documentId,
          userId,
          ...mockExtraction.values,
          confidence: mockExtraction.confidence,
          isConfirmed: false,
        },
      });

      await prisma.medicalDocument.update({
        where: { id: documentId },
        data: { status: 'EXTRACTED' },
      });
    } catch (error) {
      await prisma.medicalDocument.update({
        where: { id: documentId },
        data: { status: 'FAILED', errorMessage: 'Ekstraksi gagal' },
      });
    }
  }

  // UC-20: Confirm/correct extraction results
  async confirmExtraction(documentId: string, userId: string, values: any, checkupDate?: Date): Promise<void> {
    const extraction = await prisma.extractionResult.findFirst({
      where: { documentId, userId },
    });

    if (!extraction) {
      throw Object.assign(new Error('Hasil ekstraksi tidak ditemukan'), { code: 'NOT_FOUND', status: 404 });
    }

    const validated = extractionValuesSchema.parse(values);

    await prisma.$transaction([
      prisma.extractionResult.update({
        where: { id: extraction.id },
        data: {
          ...validated,
          isConfirmed: true,
          confirmedAt: new Date(),
        },
      }),
      prisma.medicalDocument.update({
        where: { id: documentId },
        data: { status: 'CONFIRMED', checkupDate: checkupDate || extraction.createdAt },
      }),
    ]);
  }

  // Get document with extraction result
  async getDocument(documentId: string, userId: string): Promise<any> {
    const doc = await prisma.medicalDocument.findFirst({
      where: { id: documentId, userId },
      include: { extractionResult: true },
    });

    if (!doc) {
      throw Object.assign(new Error('Dokumen tidak ditemukan'), { code: 'NOT_FOUND', status: 404 });
    }

    return doc;
  }

  // List documents
  async listDocuments(userId: string, page: number = 1, limit: number = 10): Promise<any[]> {
    const docs = await prisma.medicalDocument.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return docs;
  }

  // Retry extraction
  async retryExtraction(documentId: string, userId: string): Promise<void> {
    const doc = await prisma.medicalDocument.findFirst({
      where: { id: documentId, userId },
    });

    if (!doc) {
      throw Object.assign(new Error('Dokumen tidak ditemukan'), { code: 'NOT_FOUND', status: 404 });
    }

    await prisma.medicalDocument.update({
      where: { id: documentId },
      data: { status: 'PROCESSING', errorMessage: null },
    });

    this.extractData(documentId, userId, doc.filePath).catch(console.error);
  }

  // Simulate AI extraction (replace with real AI API call)
  private async simulateExtraction(filePath: string): Promise<{ values: any, confidence: any } | null> {
    // In production, this would call Gemini API or OCR.space
    // For prototype, return mock data
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing time

    return {
      values: {
        hba1c: 8.2,
        fastingGlucose: 156,
        randomGlucose: null,
        totalCholesterol: 210,
        ldl: 130,
        hdl: 42,
        triglyceride: 180,
        systolic: 135,
        diastolic: 85,
        weightKg: 72.5,
      },
      confidence: {
        hba1c: 0.97,
        fastingGlucose: 0.88,
        systolic: 0.55,
        diastolic: 0.72,
      },
    };
  }
}

export const extractionService = new ExtractionService();
