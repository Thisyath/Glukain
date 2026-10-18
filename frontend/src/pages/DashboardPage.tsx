import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi, DashboardData } from '../api/dashboard';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const result = await dashboardApi.get();
      setData(result);
    } catch (err: any) {
      setError('Gagal memuat dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data?.hasData) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 rounded-full bg-surface-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-neutral-900 mb-2">Belum Ada Data</h2>
        <p className="text-neutral-500 mb-6">Unggah dokumen dokter Anda untuk memulai</p>
        <Link to="/upload" className="btn-primary">Unggah Dokumen</Link>
      </div>
    );
  }

  const phaseColor = (code: string) => {
    switch (code) {
      case 'CONTROLLED': return 'bg-success-100 text-success-600';
      case 'NEEDS_ATTENTION': return 'bg-warning-100 text-neutral-900';
      case 'HIGH_RISK': return 'bg-danger-100 text-danger-600';
      default: return 'bg-neutral-500/10 text-neutral-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {data?.activeAlert && (
        <div className="p-4 rounded-2xl bg-danger-100 border-l-4 border-danger-600">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-danger-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="font-semibold text-danger-600">Kondisi Berisiko Tinggi</h3>
              <p className="text-sm text-danger-600/80">{data.activeAlert.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Phase Card */}
      {data?.latest && (
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${phaseColor(data.latest.phase.code)}`}>
              {data.latest.phase.label}
            </span>
            <span className="text-sm text-neutral-500">
              {data.latest.checkupDate && new Date(data.latest.checkupDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          {data.latest.values && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {data.latest.values.hba1c !== undefined && data.latest.values.hba1c !== null && (
                <MetricCard label="HbA1c" value={`${data.latest.values.hba1c}%`} />
              )}
              {data.latest.values.fastingGlucose !== undefined && data.latest.values.fastingGlucose !== null && (
                <MetricCard label="Gula Puasa" value={`${data.latest.values.fastingGlucose} mg/dL`} />
              )}
              {data.latest.values.systolic !== undefined && data.latest.values.systolic !== null && (
                <MetricCard label="Tensi" value={`${data.latest.values.systolic}/${data.latest.values.diastolic}`} />
              )}
              {data.latest.values.weightKg !== undefined && data.latest.values.weightKg !== null && (
                <MetricCard label="Berat" value={`${data.latest.values.weightKg} kg`} />
              )}
            </div>
          )}

          <div className="mt-4">
            <Link to="/recommendations" className="btn-secondary text-sm">Lihat Rekomendasi</Link>
          </div>
        </div>
      )}

      {/* Today's Medications */}
      {data && data.todayMedications.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-semibold text-neutral-900 mb-3">Obat Hari Ini</h3>
          <div className="space-y-2">
            {data.todayMedications.map((med) => (
              <div key={med.logId} className="flex items-center justify-between p-3 bg-surface-50 rounded-xl">
                <div>
                  <p className="font-medium text-neutral-900">{med.medicationName}</p>
                  <p className="text-sm text-neutral-500">{med.dose}</p>
                </div>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
                  med.status === 'CONFIRMED' ? 'bg-success-100 text-success-600' :
                  med.status === 'MISSED' ? 'bg-warning-100 text-neutral-900' :
                  'bg-neutral-500/10 text-neutral-500'
                }`}>
                  {med.status === 'CONFIRMED' ? 'Sudah Minum' : med.status === 'MISSED' ? 'Belum Dikonfirmasi' : 'Menunggu'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-neutral-500 text-center">
        Hasil ini bukan pengganti saran dokter
      </p>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center p-3 bg-surface-50 rounded-xl">
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      <p className="text-xs text-neutral-500 mt-1">{label}</p>
    </div>
  );
}
