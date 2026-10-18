import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import Logo from '../components/assets/Logo';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsLoading(true);
    setError('');

    try {
      await authApi.verifyEmail(token);
      setMessage('Email berhasil diverifikasi');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Token tidak valid atau kedaluwarsa');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <div className="text-center mb-8">
          <p className="text-primary-600 text-[13px] font-bold mb-2">S-03 - VERIFIKASI EMAIL</p>
          <h1 className="text-[28px] font-bold text-neutral-900 leading-9 mb-3">
            Verifikasi Email Anda
          </h1>
          <p className="text-neutral-500 text-base leading-6">
            Masukkan token verifikasi yang dikirim ke email Anda
          </p>
        </div>

        {message && (
          <div className="p-3 rounded-input bg-success-100 text-success-600 text-sm mb-4 text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="p-3 rounded-input bg-danger-100 text-danger-600 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="input-field text-center tracking-widest"
            placeholder="Token verifikasi"
          />

          <button type="submit" disabled={isLoading || !token} className="btn-primary w-full">
            {isLoading ? 'Memverifikasi...' : 'Verifikasi'}
          </button>
        </form>

        <p className="text-neutral-500 text-sm text-center mt-6">
          Tidak menerima email?{' '}
          <button className="text-primary-600 font-medium">Kirim ulang</button>
        </p>

        <p className="text-neutral-500 text-[13px] text-center mt-4">
          <Link to="/login" className="text-primary-600 font-medium">Kembali ke Masuk</Link>
        </p>
      </div>
    </div>
  );
}
