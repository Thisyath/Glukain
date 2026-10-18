import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-violet-600 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-6">
          <span className="text-white font-bold text-4xl">G</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">
          Pantau diabetes lebih mudah, mandiri, dan aman
        </h1>
        <p className="text-white/80 mb-8 max-w-md">
          Unggah foto hasil pemeriksaan dokter, AI membaca nilai medis Anda,
          dan dapatkan rekomendasi yang sesuai kondisi.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <Link to="/register" className="btn-primary flex-1">
            Daftar
          </Link>
          <Link to="/login" className="btn-secondary bg-white/10 border-white text-white flex-1">
            Masuk
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-1">Foto Hasil Lab</h3>
            <p className="text-white/60 text-sm">AI membaca nilai medis otomatis</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-1">Rekomendasi</h3>
            <p className="text-white/60 text-sm">Sesuai kondisi Anda</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-1">Pengingat Obat</h3>
            <p className="text-white/60 text-sm">Tidak terlewat dosis</p>
          </div>
        </div>
      </div>

      <div className="py-4 text-center">
        <p className="text-white/50 text-xs">
          Glukain tidak menggantikan saran dokter
        </p>
      </div>
    </div>
  );
}
