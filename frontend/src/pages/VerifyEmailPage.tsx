import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (token: string) => {
    setIsLoading(true);
    setError('');

    try {
      await authApi.verifyEmail(token);
      navigate('/login', { state: { message: 'Email berhasil diverifikasi, silakan masuk' } });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Verifikasi gagal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Verifikasi Email</h1>
        <p className="text-neutral-500 mb-6">
          Masukkan token verifikasi yang dikirim ke email Anda
        </p>

        {error && (
          <div className="p-3 rounded-input bg-danger-100 text-danger-600 text-sm mb-4">
            {error}
          </div>
        )}

        <VerifyForm onVerify={handleVerify} isLoading={isLoading} />

        <p className="text-neutral-500 mt-6 text-sm">
          Tidak menerima email? <button className="text-primary-600 font-medium">Kirim ulang</button>
        </p>

        <Link to="/login" className="inline-block mt-4 text-primary-600 font-medium">
          Kembali ke Masuk
        </Link>
      </div>
    </div>
  );
}

function VerifyForm({ onVerify, isLoading }: { onVerify: (token: string) => void; isLoading: boolean }) {
  const [token, setToken] = useState('');

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (token) onVerify(token); }}
      className="card space-y-4"
    >
      <input
        type="text"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Token verifikasi"
        className="input-field text-center tracking-widest"
      />
      <button type="submit" disabled={isLoading || !token} className="btn-primary w-full">
        {isLoading ? 'Memverifikasi...' : 'Verifikasi'}
      </button>
    </form>
  );
}
