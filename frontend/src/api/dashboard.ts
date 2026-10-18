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

export const dashboardApi = {
  // UC-08: Get dashboard
  get: async (): Promise<DashboardData> => {
    const { data: response } = await api.get('/dashboard');
    return response.data;
  },

  // UC-09: Latest recommendation
  getLatestRecommendation: async () => {
    const { data: response } = await api.get('/recommendations/latest');
    return response.data;
  },

  // UC-10: Active alert
  getActiveAlert: async () => {
    const { data: response } = await api.get('/alerts/active');
    return response.data;
  },

  // UC-15: History
  getHistory: async (range: string = '3m') => {
    const { data: response } = await api.get('/history', { params: { range } });
    return response.data;
  },
};
