import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/auth';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak sama');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authApi.resetPassword(token, newPassword);
      setMessage('Password berhasil diubah');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Reset gagal, token tidak valid');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">Reset Password</h1>
          <p className="text-neutral-500 mt-2">Masukkan password baru Anda</p>
        </div>

        {message ? (
          <div className="card text-center">
            <div className="w-12 h-12 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-neutral-900 font-medium">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-4">
            {error && (
              <div className="p-3 rounded-input bg-danger-100 text-danger-600 text-sm">{error}</div>
            )}
            <input type="hidden" value={token} />

            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1">Password Baru</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
                placeholder="Minimal 8 karakter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1">Konfirmasi Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Ulangi password baru"
              />
            </div>

            <button type="submit" disabled={isLoading || !token} className="btn-primary w-full">
              {isLoading ? 'Memproses...' : 'Ubah Password'}
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
