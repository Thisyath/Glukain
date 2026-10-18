import { PrismaClient } from '@prisma/client';
import { phases, PhaseCode } from '../config/thresholds';

const prisma = new PrismaClient();

export class DashboardService {
  // UC-08: Get dashboard data
  async getDashboard(userId: string): Promise<any> {
    const latestPhase = await prisma.phaseRecord.findFirst({
      where: { userId },
      orderBy: { determinedAt: 'desc' },
      include: { extraction: { include: { document: true } } },
    });

    const activeAlert = await prisma.alert.findFirst({
      where: { userId, resolvedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    // Get chart data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const phaseRecords = await prisma.phaseRecord.findMany({
      where: { userId, determinedAt: { gte: sixMonthsAgo } },
      orderBy: { determinedAt: 'asc' },
      include: { extraction: { include: { document: true } } },
    });

    const charts = {
      glucose: phaseRecords
        .filter((r: any) => r.extraction?.fastingGlucose)
        .map((r: any) => ({
          date: r.determinedAt,
          value: r.extraction.fastingGlucose,
        })),
      bloodPressure: phaseRecords
        .filter((r: any) => r.extraction?.systolic && r.extraction?.diastolic)
        .map((r: any) => ({
          date: r.determinedAt,
          systolic: r.extraction.systolic,
          diastolic: r.extraction.diastolic,
        })),
      weight: phaseRecords
        .filter((r: any) => r.extraction?.weightKg)
        .map((r: any) => ({
          date: r.determinedAt,
          value: Number(r.extraction.weightKg),
        })),
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayMedications = await prisma.medicationLog.findMany({
      where: {
        userId,
        scheduledFor: { gte: today },
      },
      include: { schedule: { include: { medication: true } } },
      orderBy: { scheduledFor: 'asc' },
    });

    return {
      hasData: !!latestPhase,
      latest: latestPhase
        ? {
            phase: {
              code: latestPhase.phase,
              label: phases[latestPhase.phase as PhaseCode]?.label || latestPhase.phase,
            },
            checkupDate: latestPhase.extraction?.document?.checkupDate,
            values: latestPhase.extraction
              ? {
                  hba1c: latestPhase.extraction.hba1c,
                  fastingGlucose: latestPhase.extraction.fastingGlucose,
                  systolic: latestPhase.extraction.systolic,
                  diastolic: latestPhase.extraction.diastolic,
                  weightKg: latestPhase.extraction.weightKg,
                }
              : null,
          }
        : null,
      charts,
      activeAlert: activeAlert
        ? {
            id: activeAlert.id,
            message: activeAlert.message,
            type: activeAlert.type,
          }
        : null,
      todayMedications: todayMedications.map((log: any) => ({
        logId: log.id,
        medicationName: log.schedule.medication.name,
        dose: log.schedule.medication.dose,
        scheduledFor: log.scheduledFor,
        status: log.status,
      })),
    };
  }

  // UC-09: Get latest recommendation
  async getLatestRecommendation(userId: string): Promise<any> {
    const rec = await prisma.recommendation.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { phaseRecord: true },
    });

    if (!rec) return null;

    return {
      phase: rec.phaseRecord?.phase,
      diet: rec.dietText,
      activity: rec.activityText,
      medicationNote: rec.medicationNote,
      createdAt: rec.createdAt,
    };
  }

  // UC-15: Get history
  async getHistory(userId: string, range: string = '3m'): Promise<any> {
    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case '6m': startDate.setMonth(now.getMonth() - 6); break;
      case '1y': startDate.setFullYear(now.getFullYear() - 1); break;
      case 'all': startDate = new Date(0); break;
      default: startDate.setMonth(now.getMonth() - 3);
    }

    const records = await prisma.phaseRecord.findMany({
      where: { userId, determinedAt: { gte: startDate } },
      orderBy: { determinedAt: 'desc' },
      include: { extraction: { include: { document: true } } },
    });

    const enough = records.length >= 2;

    return {
      enough,
      hba1cTrend: records
        .filter((r: any) => r.extraction?.hba1c)
        .map((r: any) => ({ date: r.determinedAt, value: Number(r.extraction.hba1c) })),
      phaseTrend: records.map((r: any) => ({
        date: r.determinedAt,
        phase: r.phase,
        label: phases[r.phase as PhaseCode]?.label || r.phase,
      })),
      checkups: records.map((r: any) => ({
        documentId: r.extraction?.documentId,
        date: r.extraction?.document?.checkupDate || r.determinedAt,
        phase: r.phase,
        label: phases[r.phase as PhaseCode]?.label || r.phase,
      })),
    };
  }
}

export const dashboardService = new DashboardService();
