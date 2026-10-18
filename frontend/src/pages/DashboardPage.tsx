import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { authApi } from '../api/auth';
import { dashboardApi, DashboardData, LatestRecommendation } from '../api/dashboard';
import { documentsApi, Document } from '../api/documents';
import PageHeading from '../components/PageHeading';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import InfoAlert from '../components/InfoAlert';
import { Icon, type IconName } from '../components/icons';

type PhaseCode = 'CONTROLLED' | 'NEEDS_ATTENTION' | 'HIGH_RISK' | 'UNDETERMINED';

const PHASE_STYLES: Record<
  PhaseCode,
  { gradient: string; icon: IconName; message: string }
> = {
  CONTROLLED: {
    gradient: 'from-success-600 to-emerald-500',
    icon: 'circle-check',
    message: 'Pertahankan pola makan dan aktivitas Anda.',
  },
  NEEDS_ATTENTION: {
    gradient: 'from-warning-500 to-amber-500',
    icon: 'clock-3',
    message: 'Tetap konsisten, kondisi Anda sedang dipantau.',
  },
  HIGH_RISK: {
    gradient: 'from-danger-600 to-rose-500',
    icon: 'triangle-alert',
    message: 'Segera konsultasikan dengan tenaga medis.',
  },
  UNDETERMINED: {
    gradient: 'from-neutral-500 to-slate-500',
    icon: 'info',
    message: 'Lengkapi data untuk melihat fase kondisi Anda.',
  },
};

function phaseStyle(code?: string) {
  return PHASE_STYLES[(code as PhaseCode) ?? 'UNDETERMINED'] ?? PHASE_STYLES.UNDETERMINED;
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 19) return 'Selamat sore';
  return 'Selamat malam';
}

function formatLongDate(value?: string | null): string {
  if (!value) return 'Tanggal belum tersedia';
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(value?: string | null): string {
  if (!value) return '';
  return new Date(value).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

const MEDICATION_STATUS: Record<string, { label: string; className: string; icon: IconName }> = {
  CONFIRMED: { label: 'Terkonfirmasi', className: 'badge-success', icon: 'circle-check' },
  MISSED: { label: 'Terlewat', className: 'badge-warning', icon: 'clock-3' },
  PENDING: { label: 'Menunggu', className: 'badge-neutral', icon: 'clock-3' },
};

export default function DashboardPage() {
  const user = authApi.getCurrentUser();

  const [data, setData] = useState<DashboardData | null>(null);
  const [lastDocument, setLastDocument] = useState<Document | null>(null);
  const [recommendation, setRecommendation] = useState<LatestRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError('');

      const [dashResult, docsResult, recResult] = await Promise.allSettled([
        dashboardApi.get(),
        documentsApi.list(1, 1),
        dashboardApi.getLatestRecommendation(),
      ]);

      if (!active) return;

      if (dashResult.status === 'fulfilled') {
        setData(dashResult.value);
      } else {
        setError('Gagal memuat dashboard. Coba lagi sebentar lagi.');
      }

      setLastDocument(docsResult.status === 'fulfilled' ? docsResult.value[0] ?? null : null);
      setRecommendation(recResult.status === 'fulfilled' ? recResult.value : null);
      setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const firstName = user?.name?.trim().split(/\s+/)[0] ?? 'Sahabat';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <PageHeading
          title={`${greeting()}, ${firstName}`}
        />
        <InfoAlert title="Dashboard tidak dapat dimuat">{error}</InfoAlert>
        <button type="button" className="btn-primary" onClick={() => setReloadKey((k) => k + 1)}>
          Coba lagi
        </button>
      </div>
    );
  }

  if (!data.hasData || !data.latest) {
    return <DashboardEmpty firstName={firstName} />;
  }

  const style = phaseStyle(data.latest.phase.code);
  const values = data.latest.values;
  const glucoseSeries = data.charts.glucose;
  const chartData = glucoseSeries.map((point) => ({
    date: new Date(point.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    value: point.value,
    rawDate: point.date,
  }));
  const maxGlucose = Math.max(300, ...glucoseSeries.map((p) => p.value));
  const glucoseDelta =
    glucoseSeries.length >= 2
      ? glucoseSeries[glucoseSeries.length - 1].value - glucoseSeries[glucoseSeries.length - 2].value
      : null;

  return (
    <div className="space-y-6">
      <PageHeading
        title={`${greeting()}, ${firstName}`}
        subtitle="Mari jaga rutinitas kesehatan, satu langkah setiap hari."
      />

      <p className="text-[13px] text-neutral-500">
        Data demo • Ambang fase usulan, menunggu validasi klinis.
      </p>

      {data.activeAlert && (
        <div className="flex items-start gap-3 rounded-control border-l-4 border-danger-600 bg-danger-100 p-4">
          <Icon name="triangle-alert" size={20} className="mt-0.5 shrink-0 text-danger-600" />
          <div>
            <p className="text-base font-semibold text-danger-600">Perlu perhatian medis</p>
            <p className="text-sm text-danger-600/80">{data.activeAlert.message}</p>
          </div>
        </div>
      )}

      {/* CurrentPhaseCard */}
      <section
        className={`space-y-4 rounded-card bg-gradient-to-br ${style.gradient} p-6 text-white shadow-card`}
      >
        <div className="flex items-center justify-between">
          <p className="text-[13px] uppercase tracking-wide text-white/80">Fase pemeriksaan Anda</p>
          <Icon name="heart-pulse" size={24} />
        </div>

        <span className="inline-flex items-center gap-2 rounded-pill bg-white/20 px-3 py-2 text-[13px] font-semibold">
          <Icon name={style.icon} size={18} />
          {data.latest.phase.label}
        </span>

        <div className="space-y-1">
          <p className="text-[22px] font-semibold leading-8">{style.message}</p>
          <p className="text-base text-white/80">
            {formatLongDate(data.latest.checkupDate)} • Berdasarkan nilai yang sudah Anda konfirmasi
          </p>
        </div>

        <Link
          to="/recommendations"
          className="inline-flex items-center gap-2 rounded-control border border-white/40 bg-white px-4 py-3 text-base font-semibold text-primary-600"
        >
          <Icon name="arrow-right" size={20} />
          Lihat Rekomendasi
        </Link>
      </section>

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <MetricCard
          icon="droplet"
          label="HbA1c"
          value={values?.hba1c != null ? String(values.hba1c) : '—'}
          unit="%"
          caption="Nilai terkonfirmasi terbaru"
        />
        <MetricCard
          icon="activity"
          label="Gula darah puasa"
          value={values?.fastingGlucose != null ? String(values.fastingGlucose) : '—'}
          unit="mg/dL"
          caption={deltaCaption(glucoseDelta, 'mg/dL')}
        />
        <MetricCard
          icon="heart-pulse"
          label="Tekanan darah"
          value={
            values?.systolic != null && values?.diastolic != null
              ? `${values.systolic}/${values.diastolic}`
              : '—'
          }
          unit="mmHg"
          caption={formatLongDate(data.latest.checkupDate)}
        />
        <MetricCard
          icon="scale"
          label="Berat badan"
          value={values?.weightKg != null ? String(values.weightKg) : '—'}
          unit="kg"
          caption="Input opsional dari profil"
        />
      </div>

      {/* Medications */}
      <section className="rounded-card bg-white p-6 shadow-card">
        <p className="text-[13px] font-bold uppercase tracking-wide text-primary-600">
          {new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
        <h2 className="mt-1 text-[18px] font-semibold text-neutral-900">Obat hari ini</h2>

        {data.todayMedications.length === 0 ? (
          <p className="mt-4 text-base text-neutral-500">
            Belum ada jadwal obat untuk hari ini.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {data.todayMedications.map((med) => {
              const status = MEDICATION_STATUS[med.status] ?? MEDICATION_STATUS.PENDING;
              return (
                <div
                  key={med.logId}
                  className="flex items-center gap-4 border-b border-neutral-500/10 pb-3 last:border-none last:pb-0"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-control bg-surface-50 text-primary-600">
                    <Icon name="pill" size={22} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-neutral-900">
                      {med.medicationName}
                    </p>
                    <p className="text-[13px] text-neutral-500">
                      {formatTime(med.scheduledFor)} • {med.dose}
                    </p>
                  </div>
                  <span className={`${status.className} shrink-0`}>
                    <Icon name={status.icon} size={16} />
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-4 text-[13px] leading-5 text-neutral-500">
          Konfirmasi obat dan pengingat in-app belum aktif pada versi ini.
        </p>
      </section>

      {/* Chart */}
      <section className="rounded-card bg-white p-6 shadow-card">
        <p className="text-[13px] font-bold uppercase tracking-wide text-primary-600">
          {data.charts.glucose.length} kontrol terkonfirmasi
        </p>
        <h2 className="mt-1 text-[18px] font-semibold text-neutral-900">
          Perjalanan gula darah Anda
        </h2>

        {chartData.length === 0 ? (
          <p className="mt-4 text-base text-neutral-500">
            Grafik akan muncul setelah ada minimal satu hasil terkonfirmasi.
          </p>
        ) : (
          <>
            <p className="mt-4 text-[13px] text-neutral-500">Gula darah puasa (mg/dL) • 6 bulan</p>
            <div className="mt-2 h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <ReferenceArea y1={0} y2={160} fill="#DCFCE7" fillOpacity={0.5} />
                  <ReferenceArea y1={160} y2={250} fill="#FEF3C7" fillOpacity={0.6} />
                  <ReferenceArea y1={250} y2={maxGlucose} fill="#FEE2E2" fillOpacity={0.6} />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748B' }} tickLine={false} />
                  <YAxis
                    domain={[0, maxGlucose]}
                    tick={{ fontSize: 12, fill: '#64748B' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value} mg/dL`, 'Gula darah puasa']}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#4338CA"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#4338CA' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-[13px] text-neutral-500">
              Zona warna = usulan ambang, belum divalidasi klinis. Grafik demo.
            </p>
          </>
        )}

        <Link
          to="/history"
          className="mt-4 inline-flex items-center gap-2 text-base font-semibold text-primary-600"
        >
          Lihat riwayat lengkap
        </Link>
      </section>

      {/* Recommendation + last document */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-card bg-white p-6 shadow-card">
          <h2 className="text-[18px] font-semibold text-neutral-900">Langkah baik hari ini</h2>

          {recommendation ? (
            <ul className="mt-4 space-y-3">
              {recommendation.diet && <RecommendationRow icon="sparkles" text={recommendation.diet} />}
              {recommendation.activity && (
                <RecommendationRow icon="activity" text={recommendation.activity} />
              )}
              {recommendation.medicationNote && (
                <RecommendationRow icon="pill" text={recommendation.medicationNote} />
              )}
            </ul>
          ) : (
            <p className="mt-4 text-base text-neutral-500">
              Rekomendasi akan muncul setelah Anda menyimpan hasil analisis.
            </p>
          )}

          <Link
            to="/recommendations"
            className="btn-secondary mt-6 inline-flex items-center justify-center"
          >
            Buka rekomendasi
          </Link>
        </section>

        <section className="rounded-card bg-white p-6 shadow-card">
          <h2 className="text-[18px] font-semibold text-neutral-900">Dokumen terakhir</h2>

          {lastDocument ? (
            <Link to="/history" className="mt-4 flex items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-control bg-surface-50 text-primary-600">
                <Icon name="file-text" size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-neutral-900">
                  {lastDocument.originalName}
                </p>
                <p className="text-[13px] text-neutral-500">
                  {formatLongDate(lastDocument.checkupDate ?? lastDocument.uploadedAt)} •{' '}
                  {documentStatusLabel(lastDocument.status)}
                </p>
              </div>
              <Icon name="chevron-right" size={20} className="text-neutral-500" />
            </Link>
          ) : (
            <p className="mt-4 text-base text-neutral-500">Belum ada dokumen yang diunggah.</p>
          )}

          <Link
            to="/upload"
            className="btn-secondary mt-6 inline-flex items-center justify-center gap-2"
          >
            <Icon name="upload" size={20} />
            Unggah pemeriksaan baru
          </Link>
        </section>
      </div>

      <MedicalDisclaimer>
        Glukain tidak menggantikan dokter. Hasil ini mendukung pemantauan, bukan diagnosis atau
        prediksi diabetes.
      </MedicalDisclaimer>
    </div>
  );
}

function deltaCaption(delta: number | null, unit: string): string {
  if (delta === null) return 'Nilai terkonfirmasi terbaru';
  if (delta === 0) return `Stabil dari pemeriksaan sebelumnya`;
  const arrow = delta < 0 ? '↓' : '↑';
  return `${arrow} ${Math.abs(delta)} ${unit} dari pemeriksaan sebelumnya`;
}

function documentStatusLabel(status: Document['status']): string {
  switch (status) {
    case 'CONFIRMED':
      return 'Terkonfirmasi';
    case 'EXTRACTED':
      return 'Siap ditinjau';
    case 'PROCESSING':
      return 'Sedang dibaca';
    case 'UNRECOGNIZED':
      return 'Tidak terbaca';
    default:
      return 'Gagal dibaca';
  }
}

function MetricCard({
  icon,
  label,
  value,
  unit,
  caption,
}: {
  icon: IconName;
  label: string;
  value: string;
  unit: string;
  caption: string;
}) {
  return (
    <div className="rounded-card bg-white p-6 shadow-card">
      <div className="flex items-center gap-2 text-neutral-500">
        <Icon name={icon} size={20} />
        <span className="text-base">{label}</span>
      </div>
      <p className="mt-4 flex items-baseline gap-2">
        <span className="text-4xl font-bold leading-none text-neutral-900">{value}</span>
        {value !== '—' && <span className="text-base text-neutral-500">{unit}</span>}
      </p>
      <p className="mt-3 text-[13px] text-primary-600">{caption}</p>
    </div>
  );
}

function RecommendationRow({ icon, text }: { icon: IconName; text: string }) {
  return (
    <li className="flex items-start gap-4">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-control bg-surface-50 text-primary-600">
        <Icon name={icon} size={22} />
      </span>
      <p className="pt-2 text-base leading-6 text-neutral-900">{text}</p>
    </li>
  );
}

function DashboardEmpty({ firstName }: { firstName: string }) {
  const steps = [
    '1 / Unggah hasil pemeriksaan',
    '2 / Periksa angka yang terbaca',
    '3 / Pantau kondisi Anda',
  ];

  return (
    <div className="space-y-6">
      <PageHeading
        title={`${greeting()}, ${firstName}`}
        subtitle="Mari mulai perjalanan pemantauan kesehatan Anda."
      />

      <section className="rounded-card bg-white p-6 shadow-card">
        <div className="flex flex-col items-center gap-6 px-2 py-4 text-center">
          <span className="grid h-24 w-24 place-items-center rounded-32 bg-surface-50 text-primary-600">
            <Icon name="file-text" size={44} />
          </span>
          <div className="space-y-2">
            <h2 className="text-[22px] font-semibold leading-8 text-neutral-900">
              Belum ada data, silakan unggah dokumen dokter
            </h2>
            <p className="text-base leading-6 text-neutral-500">
              Siapkan foto atau PDF hasil pemeriksaan. Anda akan diminta memeriksa angka sebelum
              analisis.
            </p>
          </div>
          <Link
            to="/upload"
            className="btn-primary inline-flex w-full items-center justify-center gap-2"
          >
            <Icon name="upload" size={20} />
            Unggah
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {steps.map((step) => (
          <div key={step} className="rounded-card bg-white p-6 shadow-card">
            <p className="text-base font-bold text-primary-600">{step}</p>
          </div>
        ))}
      </div>

      <p className="text-[13px] text-neutral-500">
        Belum ada fase atau metrik sampai dokumen dikonfirmasi. Data kosong tidak berarti kondisi
        sehat.
      </p>

      <MedicalDisclaimer>
        Glukain tidak menggantikan dokter. Bukan diagnosis atau prediksi diabetes.
      </MedicalDisclaimer>
    </div>
  );
}
