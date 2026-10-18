import api from './client';

export interface ExtractionValues {
  hba1c?: number;
  fastingGlucose?: number;
  randomGlucose?: number;
  totalCholesterol?: number;
  ldl?: number;
  hdl?: number;
  triglyceride?: number;
  systolic?: number;
  diastolic?: number;
  weightKg?: number;
}

export interface Document {
  id: string;
  status: 'PROCESSING' | 'EXTRACTED' | 'CONFIRMED' | 'FAILED' | 'UNRECOGNIZED';
  uploadedAt: string;
  checkupDate?: string;
  originalName: string;
  extractionResult?: {
    values: ExtractionValues;
    confidence: Record<string, number>;
    isConfirmed: boolean;
  };
}

export const documentsApi = {
  // UC-04: Upload document
  upload: async (file: File, checkupDate?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (checkupDate) formData.append('checkupDate', checkupDate);

    const { data: response } = await api.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // List documents
  list: async (page: number = 1, limit: number = 10) => {
    const { data: response } = await api.get('/documents', { params: { page, limit } });
    return response.data;
  },

  // Get document with extraction
  get: async (id: string): Promise<Document> => {
    const { data: response } = await api.get(`/documents/${id}`);
    return response.data;
  },

  // UC-20: Confirm extraction
  confirmExtraction: async (id: string, values: ExtractionValues, checkupDate?: string) => {
    const { data: response } = await api.put(`/documents/${id}/extraction`, {
      values,
      checkupDate,
    });
    return response.data;
  },

  // Retry extraction
  retry: async (id: string) => {
    const { data: response } = await api.post(`/documents/${id}/retry`);
    return response.data;
  },
};
