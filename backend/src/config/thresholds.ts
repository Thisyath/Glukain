/**
 * Ambang batas klasifikasi fase & aturan makanan.
 * Semua ambang batas di file konfigurasi, bukan hardcode.
 * Nilai bawah adalah usulan awal — wajib divalidasi dengan sumber medis/dosen.
 */

export const phaseThresholds = {
  hba1c: {
    controlled: 7.0,       // < 7.0 => CONTROLLED
    needsAttention: 8.9,   // 7.0 – 8.9 => NEEDS_ATTENTION
    // >= 9.0 => HIGH_RISK
  },
  fastingGlucose: {
    highRisk: 250,         // >= 250 mg/dL => HIGH_RISK
  },
  randomGlucose: {
    highRisk: 300,         // >= 300 mg/dL => HIGH_RISK
  },
  bloodPressure: {
    highRiskSystolic: 180, // >= 180 mmHg => HIGH_RISK
    highRiskDiastolic: 120,// >= 120 mmHg => HIGH_RISK
  },
};

export const foodRules = {
  sugar: {
    riskyThreshold: 15,    // gram per porsi
  },
  carbs: {
    riskyThreshold: 45,    // gram per porsi
  },
};

export const validationRanges = {
  hba1c: { min: 3, max: 20 },
  fastingGlucose: { min: 20, max: 800 },
  randomGlucose: { min: 20, max: 800 },
  totalCholesterol: { min: 50, max: 600 },
  ldl: { min: 20, max: 400 },
  hdl: { min: 10, max: 150 },
  triglyceride: { min: 30, max: 1000 },
  systolic: { min: 60, max: 260 },
  diastolic: { min: 30, max: 160 },
  weightKg: { min: 20, max: 300 },
};

export const rateLimits = {
  login: { maxAttempts: 5, windowMinutes: 15 },
  upload: { maxPerDay: 10 },
  foodAnalysis: { maxPerDay: 10 },
  chat: { maxPerDay: 30 },
};

export const phases = {
  CONTROLLED: { label: 'Terkontrol Baik', color: '#16A34A', bgColor: '#DCFCE7' },
  NEEDS_ATTENTION: { label: 'Perlu Perhatian', color: '#F5B301', bgColor: '#FEF3C7' },
  HIGH_RISK: { label: 'Berisiko Tinggi', color: '#DC2626', bgColor: '#FEE2E2' },
  UNDETERMINED: { label: 'Belum Dapat Ditentukan', color: '#64748B', bgColor: '#F1F5F9' },
} as const;

export type PhaseCode = keyof typeof phases;
