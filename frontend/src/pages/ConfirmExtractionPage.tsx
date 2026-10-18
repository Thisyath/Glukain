import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  documentsApi,
  Document,
  DocumentFilePreview,
  ExtractionValues,
} from '../api/documents';
import InfoAlert from '../components/InfoAlert';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import PageHeading from '../components/PageHeading';
import Button from '../components/Button';
import { Icon, type IconName } from '../components/icons';
import {
  fileTypeLabel,
  formatBytes,
  formatDate,
  formatNumber,
  toDateInputValue,
  todayDateInputValue,
} from '../lib/format';

type FieldKey = keyof ExtractionValues;
type FormState = Record<FieldKey, string>;

interface ConfirmResult {
  phase: { code: string; label: string; reason: string[] };
  recommendation: { diet: string; activity: string; medicationNote?: string | null } | null;
  alert: { message: string } | null;
  disclaimer: string;
}

const EMPTY_FORM: FormState = {
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
};

interface FieldMeta {
  key: FieldKey;
  label: string;
  /** Nilai bulat (schema backend memakai .int()). */
  integer?: boolean;
  optional?: boolean;
  /** Catatan kecil di bawah kolom. */
  help?: string;
}

/** Susunan kolom: tiap baris berisi 1 atau 2 kolom. */
const FIELD_ROWS: FieldMeta[][] = [
  [
    { key: 'hba1c', label: 'HbA1c (%)' },
    { key: 'fastingGlucose', label: 'Gula darah puasa (mg/dL)', integer: true },
  ],
  [{ key: 'randomGlucose', label: 'Gula darah sewaktu (mg/dL)', integer: true }],
  [{ key: 'totalCholesterol', label: 'Kolesterol total (mg/dL)', integer: true }],
  [
    { key: 'ldl', label: 'LDL (mg/dL)', integer: true },
    { key: 'hdl', label: 'HDL (mg/dL)', integer: true },
  ],
  [{ key: 'triglyceride', label: 'Trigliserida (mg/dL)', integer: true }],
  [
    { key: 'systolic', label: 'Tensi sistolik (mmHg)', integer: true },
    { key: 'diastolic', label: 'Tensi diastolik (mmHg)', integer: true },
  ],
  [
    {
      key: 'weightKg',
      label: 'Berat badan (kg) — opsional',
      optional: true,
      help: 'Dari input Anda, bukan hasil asumsi AI.',
    },
  ],
];

const PHASE_BADGE: Record<string, { className: string; icon: IconName }> = {
  CONTROLLED: { className: 'bg-success-100 text-success-600', icon: 'circle-check' },
  NEEDS_ATTENTION: { className: 'bg-warning-100 text-neutral-900', icon: 'clock-3' },
  HIGH_RISK: { className: 'bg-danger-100 text-danger-600', icon: 'triangle-alert' },
  UNDETERMINED: { className: 'bg-surface-50 text-neutral-500', icon: 'info' },
};

const PHASE_HEADLINE: Record<string, string> = {
  CONTROLLED: 'Kondisi Anda terkontrol baik.',
  NEEDS_ATTENTION: 'Perlu perhatian, dengan langkah yang terarah.',
  HIGH_RISK: 'Perlu perhatian segera bersama dokter.',
  UNDETERMINED: 'Data belum cukup untuk menentukan fase.',
};

export default function ConfirmExtractionPage() {
  const { documentId } = useParams();
  const navigate = useNavigate();

  const [doc, setDoc] = useState<Document | null>(null);
  const [values, setValues] = useState<FormState>(EMPTY_FORM);
  const [checkupDate, setCheckupDate] = useState('');
  const [filePreview, setFilePreview] = useState<DocumentFilePreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ConfirmResult | null>(null);

  const previewRef = useRef<DocumentFilePreview | null>(null);

  // Muat dokumen + nilai hasil ekstraksi.
  useEffect(() => {
    if (!documentId) return;

    const fetchDocument = async () => {
      try {
        const data = await documentsApi.get(documentId);
        setDoc(data);

        const extracted = data.extraction?.values;
        if (extracted) {
          setValues(
            Object.fromEntries(
              Object.entries(EMPTY_FORM).map(([key]) => [
                key,
                extracted[key as FieldKey] !== null && extracted[key as FieldKey] !== undefined
                  ? String(extracted[key as FieldKey])
                  : '',
              ])
            ) as FormState
          );
        }

        setCheckupDate(
          data.checkupDate ? toDateInputValue(data.checkupDate) : todayDateInputValue()
        );
      } catch {
        setError('Gagal memuat dokumen.');
      }
    };

    void fetchDocument();
  }, [documentId]);

  // Pratinjau dokumen sumber (berkas milik pengguna, diambil sebagai blob).
  useEffect(() => {
    if (!documentId) return;
    let cancelled = false;

    void documentsApi
      .filePreview(documentId)
      .then((preview) => {
        if (cancelled) {
          preview.revoke();
          return;
        }
        previewRef.current = preview;
        setFilePreview(preview);
      })
      .catch(() => setFilePreview(null));

    return () => {
      cancelled = true;
      previewRef.current?.revoke();
      previewRef.current = null;
    };
  }, [documentId]);

  const openSource = () => {
    if (filePreview?.url) window.open(filePreview.url, '_blank', 'noopener');
  };

  const updateValue = (key: FieldKey, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleConfirm = async () => {
    if (!documentId) return;

    const numericValues: ExtractionValues = {};
    (Object.keys(values) as FieldKey[]).forEach((key) => {
      const raw = values[key].trim();
      if (raw === '') return;
      const parsed = Number(raw.replace(',', '.'));
      if (!Number.isNaN(parsed)) numericValues[key] = parsed;
    });

    if (Object.keys(numericValues).length === 0) {
      setError('Isi minimal satu nilai medis sebelum menyimpan.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await documentsApi.confirmExtraction(
        documentId,
        numericValues,
        checkupDate || undefined
      );
      setResult(response as ConfirmResult);
      window.scrollTo({ top: 0 });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Gagal menyimpan, coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const confidence = doc?.extraction?.confidence ?? {};
  const confidenceOf = (key: FieldKey): number | undefined => {
    const value = (confidence as Record<string, number>)[key];
    return typeof value === 'number' ? value : undefined;
  };
  const isLowConfidence = (key: FieldKey): boolean => {
    const score = confidenceOf(key);
    return values[key].trim() !== '' && score !== undefined && score < 0.7;
  };

  if (!doc) {
    return (
      <>
        <PageHeading
          title="Konfirmasi hasil ekstraksi"
          subtitle="Bandingkan nilai dengan dokumen asli. Perbaiki jika ada yang tidak sesuai sebelum analisis."
        />
        <div className="grid place-items-center py-20">
          <Icon name="loader-circle" size={32} className="animate-spin text-primary-600" />
        </div>
      </>
    );
  }

  // ---------- Hasil analisis ----------
  if (result) {
    const badge = PHASE_BADGE[result.phase.code] ?? PHASE_BADGE.UNDETERMINED;
    const hba1c = values.hba1c ? Number(values.hba1c.replace(',', '.')) : null;
    const fasting = values.fastingGlucose ? Number(values.fastingGlucose.replace(',', '.')) : null;

    return (
      <>
        <PageHeading
          title="Hasil analisis Anda"
          subtitle={`${formatDate(checkupDate)} • Nilai telah Anda tinjau dan simpan`}
        />

        <p className="text-[13px] text-neutral-500">
          Ambang fase usulan, menunggu validasi klinis.
        </p>

        {result.alert && (
          <div role="alert" className="rounded-control bg-danger-100 p-4 text-sm text-danger-600">
            {result.alert.message}
          </div>
        )}

        <section className="card space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            Pemeriksaan berhasil dianalisis
          </h2>

          <div className="flex items-center gap-3">
            <Icon name="circle-check" size={32} className="shrink-0 text-success-600" />
            <p className="text-base font-semibold text-neutral-900">
              Nilai dikonfirmasi. Analisis selesai.
            </p>
          </div>

          <span
            className={`inline-flex items-center gap-2 rounded-pill px-3 py-2 text-[13px] font-semibold ${badge.className}`}
          >
            <Icon name={badge.icon} size={18} className="shrink-0" />
            {result.phase.label}
          </span>

          <p className="text-[22px] font-semibold leading-8 text-neutral-900">
            {PHASE_HEADLINE[result.phase.code] ?? result.phase.label}
          </p>

          <p className="text-base leading-6 text-neutral-500">
            Gunakan hasil ini untuk memantau rutinitas dan bahan diskusi dengan dokter. Fase
            mengikuti aturan usulan, bukan diagnosis.
          </p>

          {result.phase.reason.length > 0 && (
            <div className="space-y-2 border-t border-neutral-500/10 pt-4">
              <p className="text-[13px] font-bold uppercase tracking-wide text-primary-600">
                Alasan
              </p>
              <ul className="list-disc space-y-1 pl-5 text-base text-neutral-900">
                {result.phase.reason.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <div className="grid gap-6 sm:grid-cols-2">
          <MetricCard
            label="HbA1c"
            value={formatNumber(hba1c)}
            unit="%"
            caption={`${formatDate(checkupDate)} • Data terkonfirmasi`}
          />
          <MetricCard
            label="Gula darah puasa"
            value={formatNumber(fasting)}
            unit="mg/dL"
            caption="Nilai yang Anda konfirmasi"
          />
        </div>

        {result.recommendation && (
          <section className="card space-y-4">
            <h2 className="text-lg font-semibold text-neutral-900">Rekomendasi awal</h2>
            <dl className="space-y-3 text-base">
              <div className="space-y-1">
                <dt className="font-semibold text-neutral-900">Diet</dt>
                <dd className="text-neutral-500">{result.recommendation.diet}</dd>
              </div>
              <div className="space-y-1">
                <dt className="font-semibold text-neutral-900">Aktivitas</dt>
                <dd className="text-neutral-500">{result.recommendation.activity}</dd>
              </div>
              {result.recommendation.medicationNote && (
                <div className="space-y-1">
                  <dt className="font-semibold text-neutral-900">Catatan obat</dt>
                  <dd className="text-neutral-500">{result.recommendation.medicationNote}</dd>
                </div>
              )}
            </dl>
          </section>
        )}

        <MedicalDisclaimer>
          Glukain tidak menggantikan dokter. Hasil ini mendukung pemantauan, bukan diagnosis atau
          prediksi diabetes.
        </MedicalDisclaimer>

        <Button icon="arrow-right" onClick={() => navigate('/dashboard')}>
          Lihat Rekomendasi
        </Button>
        <Button variant="ghost" onClick={() => navigate('/upload')}>
          Unggah dokumen lain
        </Button>
      </>
    );
  }

  // ---------- Konfirmasi & koreksi ----------
  const canOpenSource = Boolean(filePreview?.url);

  return (
    <>
      <PageHeading
        title="Konfirmasi hasil ekstraksi"
        subtitle="Bandingkan nilai dengan dokumen asli. Perbaiki jika ada yang tidak sesuai sebelum analisis."
      />

      <p className="text-[13px] text-neutral-500">
        Ambang fase usulan, menunggu validasi klinis.
      </p>

      <InfoAlert title="Belum ada klasifikasi final">
        Ini hasil bacaan dokumen, bukan hasil analisis. Nilai kosong boleh dibiarkan; bila tidak
        cukup data, fase menjadi Belum Dapat Ditentukan.
      </InfoAlert>

      {error && (
        <div role="alert" className="rounded-control bg-danger-100 p-4 text-sm text-danger-600">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,648px)]">
        {/* Kolom kiri: dokumen sumber */}
        <section className="card space-y-4 self-start">
          <h2 className="text-lg font-semibold text-neutral-900">Dokumen sumber</h2>

          <div className="flex items-center justify-between">
            <p className="text-[13px] text-neutral-500">Halaman 1 / 1</p>
            <button
              type="button"
              onClick={openSource}
              disabled={!canOpenSource}
              title="Buka sumber"
              aria-label="Buka sumber"
              className="text-neutral-500 transition-colors hover:text-primary-600 disabled:opacity-40"
            >
              <Icon name="zoom-in" size={20} />
            </button>
          </div>

          {filePreview ? (
            filePreview.isImage ? (
              <img
                src={filePreview.url}
                alt={`Dokumen sumber: ${doc.originalName}`}
                className="w-full rounded-md border border-neutral-500/40 object-contain"
                style={{ maxHeight: 638 }}
              />
            ) : (
              <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-md border border-neutral-500/40 p-6 text-center">
                <Icon name="file-text" size={48} className="text-neutral-500" />
                <div className="space-y-1">
                  <p className="text-base font-semibold text-neutral-900">{doc.originalName}</p>
                  <p className="text-[13px] text-neutral-500">
                    {fileTypeLabel(filePreview.mimeType)} • {formatBytes(doc.sizeBytes)}
                  </p>
                </div>
                <p className="text-[13px] text-neutral-500">
                  Pratinjau {fileTypeLabel(filePreview.mimeType)} tidak tampil di layar ini. Gunakan
                  tombol di bawah untuk membukanya.
                </p>
              </div>
            )
          ) : (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-md border border-neutral-500/40 p-6 text-center">
              <Icon name="file-text" size={32} className="text-neutral-500" />
              <p className="text-[13px] text-neutral-500">Memuat berkas dokumen…</p>
            </div>
          )}

          <p className="text-[13px] text-neutral-500">
            Pratinjau ini menampilkan berkas yang Anda unggah.
          </p>

          <Button variant="secondary" icon="maximize-2" onClick={openSource} disabled={!canOpenSource}>
            Buka sumber lebih besar
          </Button>
        </section>

        {/* Kolom kanan: nilai yang dapat diedit */}
        <div className="space-y-6">
          <section className="card space-y-4">
            <p className="text-[13px] font-bold uppercase tracking-wide text-primary-600">
              Dapat diedit
            </p>
            <h2 className="text-lg font-semibold text-neutral-900">Nilai hasil pemeriksaan</h2>

            <div className="space-y-2">
              <label
                htmlFor="checkupDate"
                className="block text-base font-semibold text-neutral-900"
              >
                Tanggal pemeriksaan
              </label>
              <div className="flex min-h-[48px] items-center gap-2 rounded-control border border-neutral-500/50 bg-white px-4 focus-within:border-primary-600 focus-within:ring-2 focus-within:ring-primary-600/40">
                <input
                  id="checkupDate"
                  type="date"
                  value={checkupDate}
                  onChange={(event) => setCheckupDate(event.target.value)}
                  className="h-full w-full bg-transparent py-3 text-base text-neutral-900 outline-none"
                />
                <Icon name="chevron-down" size={20} className="shrink-0 text-neutral-500" />
              </div>
            </div>

            {FIELD_ROWS.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className={row.length === 2 ? 'grid gap-6 sm:grid-cols-2' : 'grid grid-cols-1'}
              >
                {row.map((field) =>
                  isLowConfidence(field.key) ? (
                    <div
                      key={field.key}
                      className="space-y-3 rounded-control bg-warning-100 p-4 sm:col-span-2"
                    >
                      <div className="flex items-center gap-2">
                        <Icon
                          name="triangle-alert"
                          size={20}
                          className="shrink-0 text-neutral-900"
                        />
                        <p className="text-base font-semibold text-neutral-900">Mohon periksa</p>
                      </div>
                      <ValueInput
                        meta={field}
                        value={values[field.key]}
                        onChange={(value) => updateValue(field.key, value)}
                      />
                      <p className="text-[13px] leading-5 text-neutral-900">
                        Keyakinan OCR rendah. Cocokkan dengan baris yang ditandai pada dokumen
                        sumber.
                      </p>
                    </div>
                  ) : (
                    <ValueInput
                      key={field.key}
                      meta={field}
                      value={values[field.key]}
                      onChange={(value) => updateValue(field.key, value)}
                      hint={
                        values[field.key].trim() !== ''
                          ? 'Terbaca dengan keyakinan tinggi'
                          : undefined
                      }
                    />
                  )
                )}
              </div>
            ))}
          </section>

          <InfoAlert title="Pastikan angka dan satuan sesuai">
            Dengan menyimpan, Anda menyatakan telah meninjau nilai. Hasil fase berikutnya tidak
            menggantikan evaluasi dokter.
          </InfoAlert>

          <Button icon="check" onClick={handleConfirm} loading={isLoading}>
            Simpan &amp; Analisis
          </Button>
          <Button variant="ghost" onClick={() => navigate('/upload')}>
            Kembali ke dokumen
          </Button>
        </div>
      </div>
    </>
  );
}

function ValueInput({
  meta,
  value,
  onChange,
  hint,
}: {
  meta: FieldMeta;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={`value-${meta.key}`}
        className="block text-base font-semibold text-neutral-900"
      >
        {meta.label}
      </label>
      <input
        id={`value-${meta.key}`}
        type="number"
        inputMode="decimal"
        step={meta.integer ? 1 : 'any'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Belum terbaca — opsional"
        className="min-h-[48px] w-full rounded-control border border-neutral-500/50 bg-white px-4 py-3 text-base text-neutral-900 outline-none placeholder:text-neutral-500/60 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/40"
      />
      {hint && <p className="text-[13px] leading-5 text-neutral-500">{hint}</p>}
      {meta.help && <p className="text-[13px] leading-5 text-neutral-500">{meta.help}</p>}
    </div>
  );
}

function MetricCard({
  label,
  value,
  unit,
  caption,
}: {
  label: string;
  value: string;
  unit: string;
  caption: string;
}) {
  return (
    <section className="card space-y-4">
      <div className="flex items-center gap-2">
        <Icon name="activity" size={20} className="shrink-0 text-neutral-500" />
        <p className="text-base text-neutral-500">{label}</p>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-[36px] font-bold leading-[43px] text-neutral-900">{value}</span>
        <span className="text-base text-neutral-500">{unit}</span>
      </div>
      <p className="text-[13px] text-primary-600">{caption}</p>
    </section>
  );
}
