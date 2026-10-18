import { PrismaClient, Phase, PhaseRecord, ExtractionResult } from '@prisma/client';
import { phaseThresholds, phases, PhaseCode } from '../config/thresholds';

const prisma = new PrismaClient();

export interface ClassificationResult {
  code: PhaseCode;
  label: string;
  reason: string[];
}

export class ClassificationService {
  // UC-06: Classify condition phase
  async classifyPhase(extractionId: string, userId: string): Promise<ClassificationResult> {
    const extraction = await prisma.extractionResult.findFirst({
      where: { id: extractionId, userId },
      include: { document: true },
    });

    if (!extraction) {
      throw Object.assign(new Error('Data ekstraksi tidak ditemukan'), { code: 'NOT_FOUND', status: 404 });
    }

    if (!extraction) {
      throw Object.assign(new Error('Data ekstraksi tidak ditemukan'), { code: 'NOT_FOUND', status: 404 });
    }

    const result = this.determinePhase(extraction);

    // Save phase record
    await prisma.phaseRecord.create({
      data: {
        userId,
        extractionId,
        phase: result.code,
        reason: result.reason,
      },
    });

    // If HIGH_RISK, create alert (UC-10)
    if (result.code === 'HIGH_RISK') {
      await prisma.alert.create({
        data: {
          userId,
          phaseRecordId: extractionId,
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
          refId: extractionId,
        },
      });
    }

    // Create recommendation (UC-07)
    await this.createRecommendation(userId, extractionId, result.code);

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

  // UC-07: Create recommendation based on phase
  private async createRecommendation(userId: string, phaseRecordId: string, phase: PhaseCode): Promise<void> {
    const rule = await prisma.recommendationRule.findUnique({
      where: { phase },
    });

    if (!rule) return;

    await prisma.recommendation.create({
      data: {
        userId,
        phaseRecordId,
        dietText: rule.dietText,
        activityText: rule.activityText,
        medicationNote: rule.medicationNote,
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
