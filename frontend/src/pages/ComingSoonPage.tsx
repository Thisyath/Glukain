import { Link, useLocation } from 'react-router-dom';
import PageHeading from '../components/PageHeading';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import { Icon } from '../components/icons';

interface ComingSoonMeta {
  title: string;
  subtitle: string;
}

const META: Record<string, ComingSoonMeta> = {
  '/history': {
    title: 'Riwayat pemeriksaan',
    subtitle: 'Tren fase dan nilai dari waktu ke waktu.',
  },
  '/medications': {
    title: 'Pengingat obat',
    subtitle: 'Jadwal dan konfirmasi minum obat harian.',
  },
  '/food': {
    title: 'Cek makanan',
    subtitle: 'Perkiraan risiko gula dan karbohidrat dari makanan.',
  },
  '/chat': {
    title: 'Chatbot edukasi',
    subtitle: 'Tanya jawab seputar diabetes dan gaya hidup.',
  },
  '/profile': {
    title: 'Profil & pengaturan',
    subtitle: 'Kelola data akun dan preferensi Anda.',
  },
  '/recommendations': {
    title: 'Rekomendasi Anda',
    subtitle: 'Rekomendasi fase terbaru berdasarkan nilai yang Anda konfirmasi.',
  },
};

const FALLBACK: ComingSoonMeta = {
  title: 'Segera hadir',
  subtitle: 'Halaman ini belum tersedia.',
};

export default function ComingSoonPage() {
  const { pathname } = useLocation();
  const meta = META[pathname] ?? FALLBACK;

  return (
    <div className="space-y-6">
      <PageHeading
        title={meta.title}
        subtitle={meta.subtitle}
      />

      <section className="rounded-card bg-white p-8 text-center shadow-card">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-control bg-surface-50 text-primary-600">
          <Icon name="clock-3" size={28} />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-neutral-900">Fitur segera hadir</h2>
        <p className="mx-auto mt-2 max-w-md text-base leading-6 text-neutral-500">
          Menu ini sudah tersedia di navigasi sesuai desain, tetapi belum tersambung ke backend.
          Data akan muncul setelah endpoint terkait selesai dibuat.
        </p>
        <Link to="/dashboard" className="btn-secondary mt-6 inline-flex items-center justify-center">
          Kembali ke beranda
        </Link>
      </section>

      <MedicalDisclaimer>
        Glukain tidak menggantikan dokter. Hasil ini mendukung pemantauan, bukan diagnosis atau
        prediksi diabetes.
      </MedicalDisclaimer>
    </div>
  );
}
