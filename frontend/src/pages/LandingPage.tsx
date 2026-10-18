import { Link } from 'react-router-dom';
import Logo from '../components/assets/Logo';
import { HeartIcon, DocIcon, CalendarIcon, ShieldIcon } from '../components/assets/illustrations';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Hero Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-violet-600 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute bottom-40 left-10 w-32 h-32 rounded-full bg-white/5" />

        <Logo light />

        <div className="relative z-10">
          <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-6 max-w-md">
            Pantau diabetes lebih mudah, mandiri, dan aman
          </h1>
          <p className="text-white/70 text-lg mb-10 max-w-md">
            Unggah foto hasil pemeriksaan dokter, AI membaca nilai medis Anda, dan dapatkan rekomendasi yang sesuai kondisi.
          </p>

          {/* Feature card */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 max-w-sm">
            <div className="space-y-4">
              <FeatureItem icon={<HeartIcon />} text="Foto hasil lab, AI membaca" />
              <FeatureItem icon={<DocIcon />} text="Rekomendasi sesuai kondisi" />
              <FeatureItem icon={<CalendarIcon />} text="Pengingat obat" />
              <FeatureItem icon={<ShieldIcon />} text="Data medis Anda tetap privat" />
            </div>
          </div>
        </div>

        <p className="text-white/50 text-sm relative z-10">
          Glukain tidak menggantikan saran dokter.
        </p>
      </div>

      {/* Right Panel - CTA */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo />
          </div>

          <div className="mb-8">
            <p className="text-sm font-semibold text-primary-600 mb-2">S-01 - GLUKAIN</p>
            <h2 className="text-2xl xl:text-3xl font-bold text-neutral-900 mb-3">
              Selamat datang di Glukain
            </h2>
            <p className="text-neutral-500">
              Masuk ke akun Anda atau buat akun baru untuk memulai memantau kesehatan.
            </p>
          </div>

          <div className="space-y-4">
            <Link to="/login" className="btn-primary w-full flex items-center justify-center gap-2">
              Masuk
            </Link>
            <Link to="/register" className="btn-secondary w-full flex items-center justify-center gap-2">
              Daftar
            </Link>
          </div>

          {/* Mobile feature list */}
          <div className="lg:hidden mt-8 space-y-3">
            <FeatureItem icon={<HeartIcon />} text="Foto hasil lab, AI membaca" />
            <FeatureItem icon={<DocIcon />} text="Rekomendasi sesuai kondisi" />
            <FeatureItem icon={<CalendarIcon />} text="Pengingat obat" />
          </div>

          <p className="text-xs text-neutral-500 text-center mt-8">
            Glukain tidak menggantikan saran dokter.
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-primary-600/10 flex items-center justify-center text-primary-600 shrink-0">
        {icon}
      </div>
      <span className="text-neutral-900 font-medium">{text}</span>
    </div>
  );
}
