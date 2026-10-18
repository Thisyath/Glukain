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

/** Nilai hasil ekstraksi dari server — field yang tidak terbaca bernilai null. */
export type ExtractionValueRecord = {
  [K in keyof ExtractionValues]: number | null;
};

export interface ExtractionResultPayload {
  id: string;
  values: ExtractionValueRecord;
  confidence: Record<string, number> | null;
  isConfirmed: boolean;
  confirmedAt?: string | null;
  createdAt?: string;
}

export interface Document {
  id: string;
  status: 'PROCESSING' | 'EXTRACTED' | 'CONFIRMED' | 'FAILED' | 'UNRECOGNIZED';
  uploadedAt: string;
  checkupDate?: string | null;
  originalName: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
  errorMessage?: string | null;
  /** Hasil ekstraksi; null bila belum/selesai gagal. */
  extraction?: ExtractionResultPayload | null;
}

/** Jenis pratinjau dokumen sumber yang dikirim ke layar konfirmasi. */
export interface DocumentFilePreview {
  url: string;
  mimeType: string;
  isImage: boolean;
  /** URL object harus dibersihkan pemanggil saat tidak dipakai lagi. */
  revoke: () => void;
}

export const documentsApi = {
  upload: async (file: File, checkupDate?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (checkupDate) formData.append('checkupDate', checkupDate);

    const { data: response } = await api.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // List documents — item berbentuk sama dengan detail, tanpa nested `extraction`
  list: async (page: number = 1, limit: number = 10): Promise<Document[]> => {
    const { data: response } = await api.get('/documents', { params: { page, limit } });
    return response.data;
  },

  // Get document with extraction
  get: async (id: string): Promise<Document> => {
    const { data: response } = await api.get(`/documents/${id}`);
    return response.data;
  },

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

  // Berkas dokumen milik pengguna sebagai object URL (pratinjau sumber).
  // Endpoint mengirim header Authorization, jadi berkas diambil sebagai blob,
  // bukan lewat <img src> langsung.
  filePreview: async (id: string): Promise<DocumentFilePreview> => {
    const { data, headers } = await api.get(`/documents/${id}/file`, {
      responseType: 'blob',
    });
    const mimeType = (headers['content-type'] as string) || data.type || 'application/octet-stream';
    const url = URL.createObjectURL(data);
    return {
      url,
      mimeType,
      isImage: mimeType.startsWith('image/'),
      revoke: () => URL.revokeObjectURL(url),
    };
  },
};
