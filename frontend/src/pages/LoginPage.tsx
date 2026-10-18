import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import AuthLayout, { AuthFooter } from '../components/auth/AuthLayout';
import FormHeading from '../components/auth/FormHeading';
import Notice from '../components/auth/Notice';
import TextField from '../components/auth/TextField';
import Button from '../components/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setNeedsVerification(false);

    try {
      await authApi.login({ email: email.trim(), password });
      navigate(from ?? '/dashboard', { replace: true });
    } catch (err: any) {
      const code = err.response?.data?.error?.code;
      if (code === 'EMAIL_NOT_VERIFIED') {
        setNeedsVerification(true);
        setError('Akun Anda belum terverifikasi. Buka tautan/kode verifikasi yang dikirim ke email.');
      } else {
        setError(
          err.response?.data?.error?.message ||
            'Email atau password salah. Periksa kembali lalu coba lagi.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <FormHeading
        title="Selamat datang kembali"
        subtitle="Masuk untuk melanjutkan rutinitas sehat Anda."
      />

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {error && (
          <Notice tone="danger">
            {error}
            {needsVerification && (
              <>
                {' '}
                <Link
                  to={`/verify-email?email=${encodeURIComponent(email.trim())}`}
                  className="font-semibold underline"
                >
                  Verifikasi sekarang
                </Link>
              </>
            )}
          </Notice>
        )}

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          placeholder="siti.rahmawati@email.com"
          required
        />

        <TextField
          label="Password"
          toggleable
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />

        <Link
          to="/forgot-password"
          className="inline-block text-base font-semibold text-primary-600 hover:underline"
        >
          Lupa password?
        </Link>

        <Button type="submit" icon="arrow-right" loading={isLoading}>
          Masuk
        </Button>

        <p className="text-center text-base text-neutral-900">
          Belum punya akun?{' '}
          <Link to="/register" className="font-semibold text-primary-600 hover:underline">
            Daftar
          </Link>
        </p>

        <p className="text-[13px] leading-5 text-neutral-500">
          Untuk keamanan, akun harus sudah terverifikasi. Jangan bagikan password kepada siapa pun.
        </p>
      </form>

      <AuthFooter />
    </AuthLayout>
  );
}
