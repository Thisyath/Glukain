import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { documentsApi, Document } from '../api/documents';

export default function ProcessingPage() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<Document | null>(null);
  const [step, setStep] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const steps = ['Mengunggah', 'Membaca dokumen', 'Menganalisis kondisi', 'Menyusun rekomendasi'];

  useEffect(() => {
    if (!documentId) return;

    const poll = async () => {
      try {
        const data = await documentsApi.get(documentId);
        setDoc(data);

        if (data.status === 'EXTRACTED' || data.status === 'CONFIRMED') {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimeout(() => navigate(`/confirm/${documentId}`), 500);
        } else if (data.status === 'FAILED' || data.status === 'UNRECOGNIZED') {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch (err) {
        console.error(err);
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [documentId, navigate]);

  useEffect(() => {
    if (!doc) return;
    if (doc.status === 'PROCESSING') {
      setStep((s) => Math.min(s + 1, steps.length - 1));
    }
  }, [doc?.status]);

  if (!doc) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (doc.status === 'FAILED') {
    return (
      <div className="text-center py-12 max-w-md mx-auto">
        <p className="text-primary-600 text-[13px] font-bold mb-2">S-08 - STATUS PROSES</p>
        <h2 className="text-[28px] font-bold text-neutral-900 mb-2">Gagal Diproses</h2>
        <p className="text-neutral-500 mb-4">Dokumen tidak dapat dibaca. Coba unggah ulang dengan foto yang lebih jelas.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate('/upload')} className="btn-primary">Unggah Ulang</button>
          <button onClick={() => navigate('/dashboard')} className="btn-ghost">Kembali</button>
        </div>
      </div>
    );
  }

  if (doc.status === 'UNRECOGNIZED') {
    return (
      <div className="text-center py-12 max-w-md mx-auto">
        <p className="text-primary-600 text-[13px] font-bold mb-2">S-08 - STATUS PROSES</p>
        <h2 className="text-[28px] font-bold text-neutral-900 mb-2">Dokumen Tidak Dikenali</h2>
        <p className="text-neutral-500 mb-4">Tidak ada nilai medis yang terbaca. Pastikan foto hasil pemeriksaan yang jelas.</p>
        <button onClick={() => navigate('/upload')} className="btn-primary">Unggah Ulang</button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto text-center py-8">
      <p className="text-primary-600 text-[13px] font-bold mb-2">S-08 - STATUS PROSES</p>
      <h2 className="text-[28px] font-bold text-neutral-900 mb-6">Memproses Dokumen</h2>

      <div className="w-20 h-20 rounded-full bg-primary-600/10 flex items-center justify-center mx-auto mb-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <div className="space-y-3">
        {steps.map((label, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              i < step ? 'bg-success-100' : i === step ? 'bg-primary-600/10' : 'bg-surface-50'
            }`}>
              {i < step ? (
                <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : i === step ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
              ) : (
                <div className="w-2 h-2 rounded-full bg-neutral-500/30"></div>
              )}
            </div>
            <span className={`text-sm font-medium ${i <= step ? 'text-neutral-900' : 'text-neutral-500'}`}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-neutral-500 mt-6">
        Biasanya selesai dalam 10 detik. Anda bisa tutup halaman ini.
      </p>
    </div>
  );
}
