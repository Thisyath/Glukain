import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { documentsApi, Document } from '../api/documents';
import InfoAlert from '../components/InfoAlert';
import PageHeading from '../components/PageHeading';
import Button from '../components/Button';
import { Icon } from '../components/icons';
import { fileTypeLabel, formatBytes, formatDateTime } from '../lib/format';

const STEPS = [
  { title: 'Mengunggah', description: 'Selesai' },
  { title: 'Membaca dokumen', description: 'Sedang berlangsung…' },
  { title: 'Menyiapkan analisis', description: 'Setelah nilai Anda dikonfirmasi' },
  { title: 'Menyusun rekomendasi', description: 'Setelah nilai Anda dikonfirmasi' },
];

export default function ProcessingPage() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<Document | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!documentId) return;

    const poll = async () => {
      try {
        const data = await documentsApi.get(documentId);
        setDoc(data);

        // Ekstraksi selesai → lanjut ke layar konfirmasi.
        if (data.status === 'EXTRACTED' || data.status === 'CONFIRMED') {
          stopPolling();
          setTimeout(() => navigate(`/confirm/${documentId}`), 400);
        } else if (data.status === 'FAILED' || data.status === 'UNRECOGNIZED') {
          stopPolling();
        }
      } catch (err) {
        console.error(err);
      }
    };

    void poll();
    intervalRef.current = setInterval(poll, 2000);

    return stopPolling;
  }, [documentId, navigate, stopPolling]);

  const handleRetry = async () => {
    if (!documentId) return;
    setIsRetrying(true);
    try {
      await documentsApi.retry(documentId);
      setDoc((current) => (current ? { ...current, status: 'PROCESSING' } : current));
      // Pastikan tidak ada interval ganda, lalu jalankan polling lagi.
      stopPolling();
      intervalRef.current = setInterval(async () => {
        const data = await documentsApi.get(documentId);
        setDoc(data);
        if (data.status === 'EXTRACTED' || data.status === 'CONFIRMED') {
          stopPolling();
          setTimeout(() => navigate(`/confirm/${documentId}`), 400);
        } else if (data.status === 'FAILED' || data.status === 'UNRECOGNIZED') {
          stopPolling();
        }
      }, 2000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsRetrying(false);
    }
  };

  if (!doc) {
    return (
      <>
        <PageHeading
          title="Dokumen sedang dibaca"
          subtitle="Kami sedang mengekstrak angka, belum menentukan fase kondisi Anda."
        />
        <div className="grid place-items-center py-20">
          <Icon name="loader-circle" size={32} className="animate-spin text-primary-600" />
        </div>
      </>
    );
  }

  const isFailed = doc.status === 'FAILED';
  const isUnrecognized = doc.status === 'UNRECOGNIZED';

  if (isFailed || isUnrecognized) {
    return (
      <>
        <PageHeading
          title={isFailed ? 'Dokumen gagal dibaca' : 'Dokumen tidak dikenali'}
          subtitle={
            isFailed
              ? 'Terjadi kendala saat membaca dokumen. Anda dapat mencoba lagi atau mengunggah ulang.'
              : 'Tidak ada nilai medis yang terbaca dari dokumen ini. Coba foto yang lebih jelas.'
          }
        />

        <section className="card space-y-4">
          <div className="flex items-center gap-4 border-b border-neutral-500/10 pb-4">
            <span
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-control ${
                isFailed ? 'bg-danger-100 text-danger-600' : 'bg-warning-100 text-neutral-900'
              }`}
            >
              <Icon name={isFailed ? 'triangle-alert' : 'focus'} size={24} />
            </span>
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="truncate text-base font-semibold text-neutral-900">
                {doc.originalName}
              </p>
              <p className="text-[13px] text-neutral-500">
                {fileTypeLabel(doc.mimeType)} • {formatBytes(doc.sizeBytes)} •{' '}
                {formatDateTime(doc.uploadedAt)}
              </p>
            </div>
          </div>

          <p className="text-base text-neutral-900">
            {isFailed
              ? doc.errorMessage || 'Ekstraksi gagal. Pastikan berkas tidak rusak lalu coba lagi.'
              : 'Pastikan seluruh halaman terlihat, tidak buram, dan nama pemeriksaan beserta satuannya tidak terpotong.'}
          </p>

          <Button icon="refresh-cw" onClick={handleRetry} loading={isRetrying}>
            Coba lagi
          </Button>
          <Button variant="ghost" onClick={() => navigate('/upload')}>
            Unggah ulang
          </Button>
        </section>

        <InfoAlert title="Konfirmasi Anda selalu lebih dahulu">
          Kami tidak pernah menganalisis fase kondisi Anda tanpa persetujuan Anda di layar
          Konfirmasi Hasil Ekstraksi.
        </InfoAlert>
      </>
    );
  }

  return (
    <>
      <PageHeading
        title="Dokumen sedang dibaca"
        subtitle="Kami sedang mengekstrak angka, belum menentukan fase kondisi Anda."
      />

      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">Menyiapkan hasil untuk Anda</h2>

        <div className="flex items-center gap-4 border-y border-neutral-500/10 py-2">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-control bg-surface-50 text-neutral-500">
            <Icon name="file-text" size={24} />
          </span>
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="truncate text-base font-semibold text-neutral-900">{doc.originalName}</p>
            <p className="text-[13px] text-neutral-500">
              {formatBytes(doc.sizeBytes)} • Diunggah {formatDateTime(doc.uploadedAt)}
            </p>
          </div>
          <Icon name="chevron-right" size={20} className="shrink-0 text-neutral-500" />
        </div>

        <div className="flex items-center gap-4 rounded-control bg-surface-50 p-4">
          <Icon name="loader-circle" size={32} className="shrink-0 animate-spin text-primary-600" />
          <div className="space-y-0.5">
            <p className="text-base font-semibold text-neutral-900">Membaca angka pada dokumen…</p>
            <p className="text-[13px] text-neutral-500">
              Target proses kurang dari 10 detik; waktu dapat bervariasi.
            </p>
          </div>
        </div>

        <ol className="space-y-6 pt-2">
          {STEPS.map((step, index) => {
            const isDone = index === 0;
            const isActive = index === 1;

            return (
              <li key={step.title} className="flex items-center gap-4">
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-pill text-base font-bold ${
                    isDone || isActive
                      ? 'bg-primary-600 text-white'
                      : 'bg-surface-50 text-neutral-500'
                  }`}
                >
                  {isDone ? (
                    <Icon name="check" size={20} />
                  ) : isActive ? (
                    <Icon name="loader-circle" size={20} className="animate-spin" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="space-y-0.5">
                  <span className="block text-base font-semibold text-neutral-900">
                    {step.title}
                  </span>
                  <span className="block text-[13px] text-neutral-500">{step.description}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <InfoAlert title="Konfirmasi Anda selalu lebih dahulu">
        Setelah pembacaan selesai, Anda akan memeriksa angka di layar Konfirmasi Hasil Ekstraksi.
        Menganalisis kondisi dan menyusun rekomendasi final dilakukan hanya setelah Simpan &amp;
        Analisis.
      </InfoAlert>

      <Button variant="secondary" onClick={() => navigate('/dashboard')}>
        Kembali ke beranda
      </Button>

      <p className="text-[13px] text-neutral-500">
        Ini visualisasi proses statis. Status siap tinjau akan muncul di Pusat Notifikasi.
      </p>
    </>
  );
}
