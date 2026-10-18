import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/auth';
import AuthLayout, { AuthFooter } from '../components/auth/AuthLayout';
import FormHeading from '../components/auth/FormHeading';
import Notice from '../components/auth/Notice';
import TextField from '../components/auth/TextField';
import Button from '../components/Button';
import { Icon } from '../components/icons';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');

    const next: Record<string, string> = {};
    if (newPassword.length < 8) next.newPassword = 'Password minimal 8 karakter';
    else if (!/[a-zA-Z]/.test(newPassword)) next.newPassword = 'Password wajib mengandung huruf';
    else if (!/[0-9]/.test(newPassword)) next.newPassword = 'Password wajib mengandung angka';
    if (newPassword !== confirmPassword) {
      next.confirmPassword = 'Konfirmasi password tidak sama';
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setIsLoading(true);
    try {
      await authApi.resetPassword(token, newPassword);
      // Backend mencabut semua refresh token → sesi lama diakhiri.
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      setMessage('Password berhasil diubah. Mengalihkan ke halaman masuk…');
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || 'Gagal mengubah password. Tautan mungkin kedaluwarsa.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout>
        <FormHeading
          title="Buat password baru"
          subtitle="Gunakan password yang berbeda dari sebelumnya."
        />

        <Notice tone="danger">
          Tautan reset tidak ditemukan. Minta tautan baru dari halaman lupa password.
        </Notice>

        <Link
          to="/forgot-password"
          className="flex min-h-[48px] items-center justify-center rounded-control bg-primary-600 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-600/90"
        >
          Minta tautan reset
        </Link>

        <AuthFooter />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <FormHeading
        title="Buat password baru"
        subtitle="Gunakan password yang berbeda dari sebelumnya."
      />

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {message && <Notice tone="success">{message}</Notice>}
        {error && <Notice tone="danger">{error}</Notice>}

        <TextField
          label="Password baru"
          toggleable
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          error={errors.newPassword}
          hint="Kuat • Minimal 8 karakter, huruf dan angka; disarankan 12+"
          autoComplete="new-password"
        />

        <TextField
          label="Konfirmasi password baru"
          toggleable
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <div className="rounded-control bg-surface-50 p-4">
          <div className="flex items-center gap-2">
            <Icon name="info" size={20} className="shrink-0 text-neutral-500" />
            <p className="text-base font-semibold text-neutral-900">Sesi lama akan diakhiri</p>
          </div>
          <p className="mt-2 text-base leading-6 text-neutral-900/80">
            Setelah password diubah, Anda perlu masuk kembali di semua perangkat.
          </p>
        </div>

        <Button type="submit" loading={isLoading}>
          Simpan password baru
        </Button>

        <Link
          to="/login"
          className="flex min-h-[48px] items-center justify-center rounded-control text-base font-semibold text-primary-600 transition-colors hover:bg-primary-600/5"
        >
          Kembali ke masuk
        </Link>
      </form>

      <AuthFooter />
    </AuthLayout>
  );
}
