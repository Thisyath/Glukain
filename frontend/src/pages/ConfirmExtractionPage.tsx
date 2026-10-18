import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { documentsApi, Document } from '../api/documents';

export default function ConfirmExtractionPage() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<Document | null>(null);
  const [values, setValues] = useState({
    hba1c: '',
    fastingGlucose: '',
    randomGlucose: '',
    totalCholesterol: '',
    ldl: '',
    hdl: '',
    triglyceride: '',
    systolic: '',
    diastolic: '',
    weightKg: '',
  });
  const [checkupDate, setCheckupDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!documentId) return;

    const fetchDoc = async () => {
      try {
        const data = await documentsApi.get(documentId);
        setDoc(data);

        if (data.extractionResult?.values) {
          const v = data.extractionResult.values;
          setValues({
            hba1c: v.hba1c?.toString() || '',
            fastingGlucose: v.fastingGlucose?.toString() || '',
            randomGlucose: v.randomGlucose?.toString() || '',
            totalCholesterol: v.totalCholesterol?.toString() || '',
            ldl: v.ldl?.toString() || '',
            hdl: v.hdl?.toString() || '',
            triglyceride: v.triglyceride?.toString() || '',
            systolic: v.systolic?.toString() || '',
            diastolic: v.diastolic?.toString() || '',
            weightKg: v.weightKg?.toString() || '',
          });
        }
        if (data.checkupDate) setCheckupDate(data.checkupDate);
      } catch (err: any) {
        setError('Gagal memuat dokumen');
      }
    };

    fetchDoc();
  }, [documentId]);

  const handleConfirm = async () => {
    if (!documentId) return;

    setIsLoading(true);
    setError('');

    try {
      const numericValues: any = {};
      Object.entries(values).forEach(([key, val]) => {
        if (val !== '') numericValues[key] = parseFloat(val);
      });

      const response = await documentsApi.confirmExtraction(documentId, numericValues, checkupDate || undefined);
      setResult(response);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Gagal menyimpan, coba lagi');
    } finally {
      setIsLoading(false);
    }
  };

  if (!doc) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Show result after confirmation
  if (result) {
    return (
      <div className="max-w-md mx-auto text-center py-8">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          result.phase.code === 'HIGH_RISK' ? 'bg-danger-100' :
          result.phase.code === 'NEEDS_ATTENTION' ? 'bg-warning-100' :
          result.phase.code === 'CONTROLLED' ? 'bg-success-100' : 'bg-surface-50'
        }`}>
          {result.phase.code === 'HIGH_RISK' ? (
            <svg className="w-8 h-8 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        <h2 className="text-2xl font-bold text-neutral-900 mb-2">{result.phase.label}</h2>

        {result.alert && (
          <div className="p-4 rounded-card bg-danger-100 text-danger-600 mb-4">
            <p className="font-semibold">{result.alert.message}</p>
          </div>
        )}

        <div className="card text-left mb-4">
          <h3 className="font-semibold text-neutral-900 mb-2">Alasan:</h3>
          <ul className="text-sm text-neutral-500 space-y-1">
            {result.phase.reason.map((r: string, i: number) => (
              <li key={i}>- {r}</li>
            ))}
          </ul>
        </div>

        {result.recommendation && (
          <div className="card text-left mb-4">
            <h3 className="font-semibold text-neutral-900 mb-2">Rekomendasi:</h3>
            <div className="space-y-2 text-sm text-neutral-500">
              <p><span className="font-medium text-neutral-900">Diet:</span> {result.recommendation.diet}</p>
              <p><span className="font-medium text-neutral-900">Aktivitas:</span> {result.recommendation.activity}</p>
            </div>
          </div>
        )}

        <p className="text-xs text-neutral-500 mb-4">{result.disclaimer}</p>

        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          Lihat Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-neutral-900 mb-2">Konfirmasi Hasil</h1>
      <p className="text-neutral-500 mb-6">Periksa dan koreksi nilai bila diperlukan</p>

      {error && (
        <div className="p-3 rounded-input bg-danger-100 text-danger-600 text-sm mb-4">{error}</div>
      )}

      {/* Checkup Date */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-neutral-900 mb-1">Tanggal Pemeriksaan</label>
        <input
          type="date"
          value={checkupDate}
          onChange={(e) => setCheckupDate(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Values Form */}
      <div className="card space-y-4">
        <ValueField label="HbA1c (%)" value={values.hba1c} onChange={(v) => setValues({ ...values, hba1c: v })} confidence={doc.extractionResult?.confidence?.hba1c} />
        <ValueField label="Gula Darah Puasa (mg/dL)" value={values.fastingGlucose} onChange={(v) => setValues({ ...values, fastingGlucose: v })} confidence={doc.extractionResult?.confidence?.fastingGlucose} />
        <ValueField label="Gula Darah Sewaktu (mg/dL)" value={values.randomGlucose} onChange={(v) => setValues({ ...values, randomGlucose: v })} />
        <ValueField label="Kolesterol Total (mg/dL)" value={values.totalCholesterol} onChange={(v) => setValues({ ...values, totalCholesterol: v })} />
        <ValueField label="LDL (mg/dL)" value={values.ldl} onChange={(v) => setValues({ ...values, ldl: v })} />
        <ValueField label="HDL (mg/dL)" value={values.hdl} onChange={(v) => setValues({ ...values, hdl: v })} />
        <ValueField label="Trigliserida (mg/dL)" value={values.triglyceride} onChange={(v) => setValues({ ...values, triglyceride: v })} />
        <ValueField label="Sistolik (mmHg)" value={values.systolic} onChange={(v) => setValues({ ...values, systolic: v })} confidence={doc.extractionResult?.confidence?.systolic} />
        <ValueField label="Diastolik (mmHg)" value={values.diastolic} onChange={(v) => setValues({ ...values, diastolic: v })} />
        <ValueField label="Berat Badan (kg)" value={values.weightKg} onChange={(v) => setValues({ ...values, weightKg: v })} />
      </div>

      <button onClick={handleConfirm} disabled={isLoading} className="btn-primary w-full mt-6">
        {isLoading ? 'Menganalisis...' : 'Simpan & Analisis'}
      </button>

      <p className="text-xs text-neutral-500 text-center mt-4">
        Nilai boleh dikosongkan jika tidak tersedia
      </p>
    </div>
  );
}

function ValueField({ label, value, onChange, confidence }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  confidence?: number;
}) {
  const isLowConfidence = confidence !== undefined && confidence < 0.7;

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-900 mb-1">
        {label}
        {isLowConfidence && (
          <span className="ml-2 text-warning-500 text-xs">Mohon periksa</span>
        )}
      </label>
      <input
        type="number"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input-field ${isLowConfidence ? 'border-warning-500 bg-warning-100/30' : ''}`}
        placeholder="—"
      />
    </div>
  );
}
