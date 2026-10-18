import { Link } from 'react-router-dom';
import { Icon, type IconName } from '../components/icons';
import BrandMark from '../components/assets/BrandMark';

const BENEFITS: Array<{ icon: IconName; title: string; description: string }> = [
  {
    icon: 'file-check-2',
    title: 'Foto hasil lab → AI membaca',
    description:
      'Unggah hasil pemeriksaan dokter. Tinjau dan koreksi angka sebelum analisis final.',
  },
  {
    icon: 'heart-pulse',
    title: 'Rekomendasi sesuai kondisi',
    description:
      'Pahami ringkasan kondisi dan panduan umum makan serta aktivitas yang lebih mudah diikuti.',
  },
  {
    icon: 'pill',
    title: 'Pengingat obat',
    description:
      'Lihat jadwal sesuai resep dan konfirmasi Sudah Minum. Pengingat hanya di dalam aplikasi.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* LandingHero */}
      <section className="bg-gradient-to-br from-primary-600 to-violet-600">
        <nav className="mx-auto flex h-[88px] max-w-[1280px] items-center justify-between gap-6 px-6 lg:px-16">
          <Link to="/" className="text-2xl font-extrabold tracking-tight text-white">
            glukain
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#manfaat" className="text-base text-white/90 hover:text-white">
              Manfaat
            </a>
            <a href="#cara-kerja" className="text-base text-white/90 hover:text-white">
              Cara kerja
            </a>
            <a href="#keamanan" className="text-base text-white/90 hover:text-white">
              Keamanan
            </a>
          </div>

          <Link
            to="/login"
            className="inline-flex min-h-[48px] items-center justify-center rounded-control border border-primary-600 bg-white px-4 py-3 text-base font-semibold text-primary-600 transition-colors hover:bg-primary-600/5"
          >
            Masuk
          </Link>
        </nav>

        <div className="mx-auto max-w-[1280px] px-6 py-16 lg:px-16">
          <div className="grid items-start gap-6 lg:grid-cols-2">
            {/* HeroPromise */}
            <div className="space-y-6">
              <p className="text-[13px] font-bold uppercase tracking-wide text-white">
                Untuk pasien yang sudah didiagnosis
              </p>
              <h1 className="text-[28px] font-bold leading-9 text-white lg:text-4xl lg:leading-tight">
                Pantau diabetes lebih mudah, mandiri, dan aman
              </h1>
              <p className="text-base leading-6 text-white/90">
                Pahami hasil pemeriksaan, bangun kebiasaan baik, dan jaga rutinitas obat sesuai
                resep. Semua dalam satu website, tanpa instalasi.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-control border border-primary-600 bg-white px-4 py-3 text-base font-semibold text-primary-600 transition-colors hover:bg-primary-600/5"
                >
                  <Icon name="arrow-right" size={20} className="shrink-0" />
                  Daftar
                </Link>
                <Link
                  to="/login"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-control border border-primary-600 bg-white px-4 py-3 text-base font-semibold text-primary-600 transition-colors hover:bg-primary-600/5"
                >
                  Masuk
                </Link>
              </div>

              <p className="text-[13px] text-white/80">
                Data Anda privat • Glukain tidak menggantikan dokter.
              </p>
            </div>

            {/* LifestylePhotograph — blok ilustrasi, bukan foto asli */}
            <div className="space-y-3">
              <div className="flex h-[300px] items-center justify-center rounded-card bg-white/10 lg:h-[360px]">
                <div className="flex flex-col items-center gap-4 text-white/90">
                  <BrandMark variant="light" size={56} />
                  <p className="text-base font-semibold">Satu tempat untuk rutinitas sehat</p>
                </div>
              </div>
              <p className="text-[13px] text-white/80">
                Langkah kecil, lebih berarti. • Ilustrasi, bukan foto
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LandingBenefits */}
      <section id="manfaat" className="bg-surface-50">
        <div className="mx-auto max-w-[1280px] space-y-6 px-6 py-16 lg:px-16">
          <p className="text-[13px] font-bold uppercase tracking-wide text-primary-600">
            Lebih memahami, lebih tenang
          </p>
          <h2 className="text-[28px] font-bold leading-9 text-neutral-900">
            Satu tempat untuk rutinitas sehat Anda
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {BENEFITS.map((benefit) => (
              <article key={benefit.title} className="card space-y-4">
                <Icon name={benefit.icon} size={32} className="text-primary-600" />
                <h3 className="text-lg font-semibold text-neutral-900">{benefit.title}</h3>
                <p className="text-base leading-6 text-neutral-500">{benefit.description}</p>
              </article>
            ))}
          </div>

          <p className="text-[13px] text-neutral-500">
            Tiga manfaat ditampilkan sebagai kartu statis. Bukan layanan diagnosis atau perubahan
            obat otomatis.
          </p>
        </div>
      </section>

      {/* LandingNextStep */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1280px] space-y-8 px-6 py-16 lg:px-16">
          <div id="cara-kerja" className="space-y-4">
            <h2 className="text-[22px] font-semibold leading-8 text-neutral-900">
              Mulai dari hasil pemeriksaan Anda
            </h2>
            <p className="text-base leading-6 text-neutral-900">
              Daftar &amp; verifikasi email → Unggah dokumen dokter → Periksa angka yang terbaca →
              Pantau perkembangan dari waktu ke waktu.
            </p>
            <div id="keamanan" className="flex items-start gap-3">
              <Icon name="shield-check" size={24} className="mt-0.5 shrink-0 text-primary-600" />
              <p className="text-base leading-6 text-neutral-900">
                Data medis privat per akun. Anda dapat memperbaiki nilai dan mengelola akun serta
                data dari Pengaturan.
              </p>
            </div>
          </div>

          <div className="space-y-4 rounded-card bg-surface-50 p-6">
            <h3 className="text-[22px] font-semibold leading-8 text-neutral-900">
              Langkah pertama, mulai hari ini.
            </h3>
            <p className="text-base leading-6 text-neutral-900">
              Untuk Anda yang sudah didiagnosis diabetes oleh dokter. Tetap ikuti arahan tenaga
              medis yang menangani Anda.
            </p>
            <Link
              to="/register"
              className="inline-flex min-h-[48px] items-center justify-center rounded-control bg-primary-600 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-600/90"
            >
              Daftar
            </Link>
          </div>

          <p className="text-[13px] text-neutral-500">
            Glukain tidak menggantikan dokter. Bukan diagnosis atau prediksi diabetes.
          </p>

          <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-500/10 pt-6">
            <p className="text-[13px] text-neutral-500">© 2026 Glukain</p>
            <p className="text-[13px] text-primary-600">
              Kebijakan Privasi ·{' '}
              <Link to="/login" className="hover:underline">
                Masuk
              </Link>
            </p>
          </footer>
        </div>
      </section>
    </div>
  );
}
