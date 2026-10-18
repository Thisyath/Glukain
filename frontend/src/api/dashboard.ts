import api from './client';

export interface DashboardData {
  hasData: boolean;
  latest?: {
    phase: {
      code: string;
      label: string;
    };
    checkupDate?: string;
    values?: {
      hba1c?: number;
      fastingGlucose?: number;
      systolic?: number;
      diastolic?: number;
      weightKg?: number;
    };
  };
  charts: {
    glucose: Array<{ date: string; value: number }>;
    bloodPressure: Array<{ date: string; systolic: number; diastolic: number }>;
    weight: Array<{ date: string; value: number }>;
  };
  activeAlert?: {
    id: string;
    message: string;
    type: string;
  } | null;
  todayMedications: Array<{
    logId: string;
    medicationName: string;
    dose: string;
    scheduledFor: string;
    status: string;
  }>;
}

export interface LatestRecommendation {
  phase?: string;
  diet: string;
  activity: string;
  medicationNote?: string | null;
  createdAt: string;
}

export const dashboardApi = {
  get: async (): Promise<DashboardData> => {
    const { data: response } = await api.get('/dashboard');
    return response.data;
  },

  getLatestRecommendation: async (): Promise<LatestRecommendation | null> => {
    const { data: response } = await api.get('/recommendations/latest');
    return response.data;
  },

  getActiveAlert: async () => {
    const { data: response } = await api.get('/alerts/active');
    return response.data;
  },

  getHistory: async (range: string = '3m') => {
    const { data: response } = await api.get('/history', { params: { range } });
    return response.data;
  },
};
