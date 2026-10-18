import { Link } from 'react-router-dom';
import Logo from '../components/assets/Logo';
import { HeartIcon, DocIcon, CalendarIcon, ShieldIcon, ArrowRightIcon } from '../components/assets/illustrations';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* S01: LandingHero */}
      <section className="bg-gradient-to-br from-primary-600 to-violet-600">
        {/* PublicNavigation */}
        <nav className="flex items-center justify-between px-6 lg:px-16 py-6 max-w-[1280px] mx-auto">
          <span className="text-white font-extrabold text-2xl tracking-tight">glukain</span>
          <div className="hidden md:flex items-center gap-8">
            <a href="#manfaat" className="text-white/80 text-base hover:text-white">Manfaat</a>
            <a href="#cara-kerja" className="text-white/80 text-base hover:text-white">Cara kerja</a>
            <a href="#keamanan" className="text-white/80 text-base hover:text-white">Keamanan</a>
          </div>
          <Link
            to="/login"
            className="px-4 py-3 rounded-xl border border-primary-600 text-primary-600 font-semibold text-base bg-white hover:bg-surface-50 transition-colors"
          >
            Masuk
          </Link>
        </nav>

        {/* HeroContent */}
        <div className="px-6 lg:px-16 py-12 lg:py-24 max-w-[1280px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* HeroPromise */}
            <div className="w-full lg:w-[564px] flex flex-col gap-6">
              <p className="text-white/80 text-[13px] font-bold tracking-wide">
                UNTUK PASIEN YANG SUDAH DIDIAGNOSIS
              </p>
              <h1 className="text-white text-[28px] font-bold leading-9">
                Pantau diabetes lebih mudah, mandiri, dan aman
              </h1>
              <p className="text-white/80 text-base leading-6">
                Pahami hasil pemeriksaan, bangun kebiasaan baik, dan jaga rutinitas obat sesuai resep. Semua dalam satu website, tanpa instalasi.
              </p>

              {/* HeroActions */}
              <div className="flex gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white text-primary-600 font-semibold text-base hover:bg-surface-50 transition-colors"
                >
                  <ArrowRightIcon />
                  Daftar
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-3 rounded-xl bg-white text-primary-600 font-semibold text-base hover:bg-surface-50 transition-colors"
                >
                  Masuk
                </Link>
              </div>

              <p className="text-white/60 text-[13px] leading-[18px]">
                Data Anda privat - Glukain tidak menggantikan dokter.
              </p>
            </div>

            {/* LifestylePhotograph */}
            <div className="w-full lg:w-[564px] flex flex-col gap-3">
              <div className="w-full h-[360px] rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
                <div className="text-center text-white/60">
                  <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">Foto ilustrasi</p>
                </div>
              </div>
              <p className="text-white/60 text-[13px] leading-[18px]">
                Langkah kecil, lebih berarti. - Foto ilustrasi
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* S02: LandingBenefits */}
      <section id="manfaat" className="bg-surface-50">
        <div className="px-6 lg:px-16 py-12 max-w-[1280px] mx-auto flex flex-col gap-6">
          <p className="text-primary-600 text-[13px] font-bold tracking-wide">
            LEBIH MEMAHAMI, LEBIH TENANG
          </p>
          <h2 className="text-neutral-900 text-[28px] font-bold leading-9">
            Satu tempat untuk rutinitas sehat Anda
          </h2>

          {/* Benefit cards */}
          <div className="flex flex-col md:flex-row gap-6">
            <BenefitCard
              icon={<DocIcon />}
              title="Foto hasil lab → AI membaca"
              description="Unggah hasil pemeriksaan dokter. Tinjau dan koreksi angka sebelum analisis final."
            />
            <BenefitCard
              icon={<HeartIcon />}
              title="Rekomendasi sesuai kondisi"
              description="Pahami ringkasan kondisi dan panduan umum makan serta aktivitas yang lebih mudah diikuti."
            />
            <BenefitCard
              icon={<CalendarIcon />}
              title="Pengingat obat"
              description="Lihat jadwal sesuai resep dan konfirmasi Sudah Minum. Pengingat hanya di dalam aplikasi."
            />
          </div>

          <p className="text-neutral-500 text-[13px] leading-[18px]">
            Tiga manfaat ditampilkan sebagai kartu statis. Bukan layanan diagnosis atau perubahan obat otomatis.
          </p>
        </div>
      </section>

      {/* S03: LandingNextStep */}
      <section id="cara-kerja" className="bg-white">
        <div className="px-6 lg:px-16 py-12 max-w-[1280px] mx-auto flex flex-col gap-8">
          {/* HowItWorks */}
          <div className="flex flex-col gap-4">
            <h3 className="text-neutral-900 text-[22px] font-semibold leading-[30px]">
              Mulai dari hasil pemeriksaan Anda
            </h3>
            <p className="text-neutral-900 text-base leading-6">
              Daftar & verifikasi email → Unggah dokumen dokter → Periksa angka yang terbaca → Pantau perkembangan dari waktu ke waktu.
            </p>

            {/* PrivacyPromise */}
            <div className="flex items-center gap-3">
              <ShieldIcon />
              <p className="text-neutral-900 text-base leading-6">
                Data medis privat per akun. Anda dapat memperbaiki nilai dan mengelola akun serta data dari Pengaturan.
              </p>
            </div>
          </div>

          {/* ConversionCallout */}
          <div className="bg-surface-50 rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-neutral-900 text-[22px] font-semibold leading-[30px]">
              Langkah pertama, mulai hari ini.
            </h3>
            <p className="text-neutral-900 text-base leading-6">
              Untuk Anda yang sudah didiagnosis diabetes oleh dokter. Tetap ikuti arahan tenaga medis yang menangani Anda.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-4 py-3 rounded-xl bg-primary-600 text-white font-semibold text-base hover:bg-primary-600/90 transition-colors w-fit"
            >
              Daftar
            </Link>
          </div>

          <p className="text-neutral-500 text-[13px] leading-[18px]">
            Glukain tidak menggantikan dokter. Bukan diagnosis atau prediksi diabetes.
          </p>
        </div>
      </section>

      {/* PublicFooter */}
      <footer className="border-t border-neutral-500/10">
        <div className="px-6 lg:px-16 py-6 max-w-[1280px] mx-auto flex items-center justify-between">
          <p className="text-neutral-500 text-[13px]">© 2026 Glukain</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-primary-600 text-[13px]">Kebijakan Privasi</a>
            <Link to="/login" className="text-primary-600 text-[13px]">Masuk</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BenefitCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex-1 bg-white rounded-2xl p-6 shadow-card flex flex-col gap-4">
      <div className="w-8 h-8 text-primary-600">
        {icon}
      </div>
      <h4 className="text-neutral-900 text-lg font-semibold leading-[26px]">{title}</h4>
      <p className="text-neutral-500 text-base leading-6">{description}</p>
    </div>
  );
}
