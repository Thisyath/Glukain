import { PhaseRecord } from '@prisma/client';
import { phaseThresholds, phases, PhaseCode } from '../config/thresholds';
import { prisma } from '../lib/prisma';

export interface ClassificationResult {
  code: PhaseCode;
  label: string;
  reason: string[];
}

export class ClassificationService {
  async classifyPhase(extractionId: string, userId: string): Promise<ClassificationResult> {
    const extraction = await prisma.extractionResult.findFirst({
      where: { id: extractionId, userId },
      include: { document: true },
    });

    if (!extraction) {
      throw Object.assign(new Error('Data ekstraksi tidak ditemukan'), { code: 'NOT_FOUND', status: 404 });
    }

    const result = this.determinePhase(extraction);

    // Save phase record.
    // Satu ekstraksi hanya punya satu fase terakhir (extractionId unique),
    // jadi pakai upsert agar konfirmasi ulang tidak crash dengan P2002.
    const phaseRecord = await prisma.phaseRecord.upsert({
      where: { extractionId },
      update: { phase: result.code, reason: result.reason },
      create: {
        userId,
        extractionId,
        phase: result.code,
        reason: result.reason,
      },
    });

    // Alert Berisiko Tinggi tetap tampil sampai ada pemeriksaan terbaru
    // dengan fase bukan Berisiko Tinggi.
    const activeAlert = await prisma.alert.findFirst({
      where: { userId, phaseRecordId: phaseRecord.id, resolvedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (result.code === 'HIGH_RISK') {
      // Hindari alert & notifikasi ganda saat konfirmasi ulang.
      if (!activeAlert) {
        const alert = await prisma.alert.create({
          data: {
            userId,
            phaseRecordId: phaseRecord.id,
            type: 'HIGH_RISK',
            message: 'Segera hubungi tenaga medis.',
          },
        });

        await prisma.notification.create({
          data: {
            userId,
            type: 'HIGH_RISK_ALERT',
            title: 'Kondisi Berisiko Tinggi',
            body: 'Segera hubungi tenaga medis.',
            refType: 'alert',
            refId: alert.id,
          },
        });
      }
    } else if (activeAlert) {
      // Fase terbaru bukan HIGH_RISK -> tutup alert aktif.
      await prisma.alert.update({
        where: { id: activeAlert.id },
        data: { resolvedAt: new Date() },
      });
    }

    await this.createRecommendation(userId, phaseRecord.id, result.code);

    return result;
  }

  private determinePhase(extraction: any): ClassificationResult {
    const reasons: string[] = [];
    let worstPhase: PhaseCode = 'CONTROLLED';

    const checkPhase = (phase: PhaseCode, reason: string) => {
      const order: PhaseCode[] = ['CONTROLLED', 'NEEDS_ATTENTION', 'HIGH_RISK', 'UNDETERMINED'];
      if (order.indexOf(phase) > order.indexOf(worstPhase)) {
        worstPhase = phase;
      }
      reasons.push(reason);
    };

    // HbA1c
    if (extraction.hba1c !== null && extraction.hba1c !== undefined) {
      const hba1c = Number(extraction.hba1c);
      if (hba1c >= 9.0) {
        checkPhase('HIGH_RISK', `HbA1c ${hba1c}% >= 9.0%`);
      } else if (hba1c >= 7.0) {
        checkPhase('NEEDS_ATTENTION', `HbA1c ${hba1c}% berada pada 7.0-8.9%`);
      } else {
        checkPhase('CONTROLLED', `HbA1c ${hba1c}% < 7.0%`);
      }
    }

    // Fasting glucose
    if (extraction.fastingGlucose !== null && extraction.fastingGlucose !== undefined) {
      if (extraction.fastingGlucose >= phaseThresholds.fastingGlucose.highRisk) {
        checkPhase('HIGH_RISK', `Gula darah puasa ${extraction.fastingGlucose} mg/dL >= 250`);
      }
    }

    // Random glucose
    if (extraction.randomGlucose !== null && extraction.randomGlucose !== undefined) {
      if (extraction.randomGlucose >= phaseThresholds.randomGlucose.highRisk) {
        checkPhase('HIGH_RISK', `Gula darah sewaktu ${extraction.randomGlucose} mg/dL >= 300`);
      }
    }

    // Blood pressure
    if (extraction.systolic !== null && extraction.systolic !== undefined) {
      if (extraction.systolic >= phaseThresholds.bloodPressure.highRiskSystolic) {
        checkPhase('HIGH_RISK', `Sistolik ${extraction.systolic} mmHg >= 180`);
      }
    }
    if (extraction.diastolic !== null && extraction.diastolic !== undefined) {
      if (extraction.diastolic >= phaseThresholds.bloodPressure.highRiskDiastolic) {
        checkPhase('HIGH_RISK', `Diastolik ${extraction.diastolic} mmHg >= 120`);
      }
    }

    // If no data at all
    if (reasons.length === 0) {
      return { code: 'UNDETERMINED', label: phases.UNDETERMINED.label, reason: ['Data tidak cukup'] };
    }

    return {
      code: worstPhase,
      label: phases[worstPhase].label,
      reason: reasons,
    };
  }

  // Satu phaseRecord punya satu rekomendasi; konfirmasi ulang memperbarui
  // teksnya mengikuti rule fase terbaru, bukan menumpuk baris baru.
  private async createRecommendation(userId: string, phaseRecordId: string, phase: PhaseCode): Promise<void> {
    const rule = await prisma.recommendationRule.findUnique({
      where: { phase },
    });

    if (!rule) return;

    const data = {
      dietText: rule.dietText,
      activityText: rule.activityText,
      medicationNote: rule.medicationNote,
    };

    const existing = await prisma.recommendation.findFirst({
      where: { userId, phaseRecordId },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      await prisma.recommendation.update({
        where: { id: existing.id },
        data,
      });
      return;
    }

    await prisma.recommendation.create({
      data: {
        userId,
        phaseRecordId,
        ...data,
      },
    });
  }

  // Get latest phase
  async getLatestPhase(userId: string): Promise<PhaseRecord | null> {
    return prisma.phaseRecord.findFirst({
      where: { userId },
      orderBy: { determinedAt: 'desc' },
    });
  }

  // Get active alert
  async getActiveAlert(userId: string): Promise<any> {
    return prisma.alert.findFirst({
      where: { userId, resolvedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const classificationService = new ClassificationService();
