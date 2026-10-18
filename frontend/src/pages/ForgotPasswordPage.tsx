import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await authApi.forgotPassword(email);
      setMessage(result.message);
    } catch (err: any) {
      setError('Terjadi kesalahan, coba lagi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">Lupa Password</h1>
          <p className="text-neutral-500 mt-2">
            Masukkan email Anda untuk menerima tautan reset
          </p>
        </div>

        {message ? (
          <div className="card text-center">
            <div className="w-12 h-12 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-neutral-900 font-medium">{message}</p>
            <Link to="/login" className="btn-secondary mt-6 inline-block">
              Kembali ke Masuk
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-4">
            {error && (
              <div className="p-3 rounded-input bg-danger-100 text-danger-600 text-sm">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="email@contoh.com"
              />
            </div>

            <button type="submit" disabled={isLoading || !email} className="btn-primary w-full">
              {isLoading ? 'Mengirim...' : 'Kirim Tautan Reset'}
            </button>
          </form>
        )}

        <p className="text-center text-neutral-500 mt-6">
          <Link to="/login" className="text-primary-600 font-medium">Kembali ke Masuk</Link>
        </p>
      </div>
    </div>
  );
}
