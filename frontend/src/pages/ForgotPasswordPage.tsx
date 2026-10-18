import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import AuthLayout, { AuthFooter } from '../components/auth/AuthLayout';
import FormHeading from '../components/auth/FormHeading';
import Notice from '../components/auth/Notice';
import TextField from '../components/auth/TextField';
import Button from '../components/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError('Format email tidak valid');
      return;
    }
    setEmailError('');
    setIsLoading(true);

    try {
      const result = await authApi.forgotPassword(email.trim());
      setMessage(result.message);
    } catch {
      setError('Terjadi kesalahan, coba lagi beberapa saat lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <FormHeading
        title="Lupa password?"
        subtitle="Masukkan email akun Anda. Kami akan mengirim petunjuk pemulihan."
      />

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {message && (
          <Notice tone="success">
            {message} Pada mode pengembangan (SMTP belum dikonfigurasi), tautan reset dicetak di
            konsol server.
          </Notice>
        )}
        {error && <Notice tone="danger">{error}</Notice>}

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={emailError}
          autoComplete="email"
          placeholder="siti.rahmawati@email.com"
        />

        <p className="text-[13px] leading-5 text-neutral-500">
          Tautan reset sekali pakai berlaku 30 menit.
        </p>

        <Button type="submit" loading={isLoading}>
          Kirim tautan reset
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
