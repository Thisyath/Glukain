import { DocumentStatus } from '@prisma/client';
import { validationRanges } from '../config/thresholds';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';

// Beri tahu sekali saat start bahwa ekstraksi berjalan tanpa API key AI.
if (env.nodeEnv !== 'production' && !env.ai.apiKey) {
  console.log(
    '[DEV] Ekstraksi memakai MOCK (AI_API_KEY kosong). Hasil contoh untuk semua dokumen: HbA1c 8,2% / gula darah puasa 156 mg/dL.'
  );
}

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
  async uploadDocument(userId: string, file: Express.Multer.File, checkupDate?: Date): Promise<{ id: string; status: DocumentStatus }> {
    // Check daily quota
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

  async extractData(documentId: string, userId: string, filePath: string): Promise<void> {
    try {
      // MODE MOCK: tidak memanggil API AI apa pun. Nilai contoh dari
      // simulateExtraction() dipakai sampai AI_API_KEY tersedia.
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

    return this.toDocumentDto(doc);
  }

  // Get dokumen mentah untuk keperluan internal (mis. menyajikan berkas)
  async getDocumentFile(
    documentId: string,
    userId: string
  ): Promise<{ filePath: string; mimeType: string; originalName: string }> {
    const doc = await prisma.medicalDocument.findFirst({
      where: { id: documentId, userId },
    });

    if (!doc) {
      throw Object.assign(new Error('Dokumen tidak ditemukan'), { code: 'NOT_FOUND', status: 404 });
    }

    return { filePath: doc.filePath, mimeType: doc.mimeType, originalName: doc.originalName };
  }

  /**
   * Field-level dokumen yang dipakai bersama oleh endpoint daftar dan detail.
   * Eksplisit agar bentuk respons API tidak ikut berubah saat kolom Prisma berubah.
   */
  private toDocumentBase(doc: any) {
    return {
      id: doc.id,
      status: doc.status,
      originalName: doc.originalName,
      mimeType: doc.mimeType,
      sizeBytes: doc.sizeBytes,
      errorMessage: doc.errorMessage,
      checkupDate: doc.checkupDate,
      uploadedAt: doc.uploadedAt,
    };
  }

  /**
   * Bentuk respons dokumen + hasil ekstraksi agar konsisten dengan kontrak API
   * (PRD §10.4): nilai medis dibungkus di `extraction.values`, bukan field datar
   * hasil Prisma. Decimal dikonversi ke number agar tidak jadi string di JSON.
   */
  private toDocumentDto(doc: any) {
    const ex = doc.extractionResult;

    return {
      ...this.toDocumentBase(doc),
      extraction: ex
        ? {
            id: ex.id,
            values: {
              hba1c: ex.hba1c !== null && ex.hba1c !== undefined ? Number(ex.hba1c) : null,
              fastingGlucose: ex.fastingGlucose,
              randomGlucose: ex.randomGlucose,
              totalCholesterol: ex.totalCholesterol,
              ldl: ex.ldl,
              hdl: ex.hdl,
              triglyceride: ex.triglyceride,
              systolic: ex.systolic,
              diastolic: ex.diastolic,
              weightKg: ex.weightKg !== null && ex.weightKg !== undefined ? Number(ex.weightKg) : null,
            },
            confidence: ex.confidence,
            isConfirmed: ex.isConfirmed,
            confirmedAt: ex.confirmedAt,
            createdAt: ex.createdAt,
          }
        : null,
    };
  }

  // List documents — bentuk konsisten dengan detail, tanpa nested extraction
  async listDocuments(userId: string, page: number = 1, limit: number = 10): Promise<any[]> {
    const docs = await prisma.medicalDocument.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return docs.map((doc) => this.toDocumentBase(doc));
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

  /**
   * Simulasi ekstraksi (MODE MOCK).
   *
   * Aplikasi sengaja berjalan tanpa API key AI. Apa pun dokumen yang diunggah,
   * hasilnya selalu sama: HbA1c 8,2% dan gula darah puasa 156 mg/dL, ditambah
   * beberapa nilai lain agar layar konfirmasi dan klasifikasi fase tetap
   * bisa diuji.
   *
   * Untuk memakai AI sungguhan di progress berikutnya: isi `AI_API_KEY`
   * (lihat `config/env.ts`) lalu ganti isi method ini dengan panggilan API
   * (Gemini free tier / OCR.space — PRD §7) yang mengembalikan bentuk
   * `{ values, confidence }` yang sama.
   */
  private async simulateExtraction(filePath: string): Promise<{ values: any; confidence: any } | null> {
    await new Promise((resolve) => setTimeout(resolve, 3000)); // tiru durasi proses

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
