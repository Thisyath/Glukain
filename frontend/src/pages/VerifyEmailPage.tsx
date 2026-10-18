import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/auth';
import AuthLayout, { AuthFooter } from '../components/auth/AuthLayout';
import FormHeading from '../components/auth/FormHeading';
import Notice from '../components/auth/Notice';
import Button from '../components/Button';
import { Icon } from '../components/icons';

const RESEND_SECONDS = 45;

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain || !local) return email;
  return `${local.charAt(0)}***@${domain}`;
}

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const tokenFromUrl = searchParams.get('token') ?? '';
  const emailFromUrl = searchParams.get('email') ?? '';
  const emailFromState = (location.state as { email?: string } | null)?.email ?? '';
  const email = emailFromUrl || emailFromState;

  const [token, setToken] = useState(tokenFromUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  const attempted = useRef(false);

  const verify = useCallback(
    async (value: string) => {
      setIsLoading(true);
      setError('');

      try {
        await authApi.verifyEmail(value);
        setMessage('Email berhasil diverifikasi. Mengalihkan ke halaman masuk…');
        setTimeout(() => navigate('/login', { replace: true }), 1500);
      } catch (err: any) {
        setError(
          err.response?.data?.error?.message || 'Kode tidak valid atau sudah kedaluwarsa.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  // Tautan pada email membuka /verify-email?token=… — verifikasi sekali saja
  // (guard menahan pemanggilan ganda pada React StrictMode).
  useEffect(() => {
    if (tokenFromUrl && !attempted.current) {
      attempted.current = true;
      void verify(tokenFromUrl);
    }
  }, [tokenFromUrl, verify]);

  // Hitung mundur tombol kirim ulang.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!token.trim()) return;
    void verify(token.trim());
  };

  const handleResend = async () => {
    if (!email) {
      setError('Email tujuan tidak diketahui. Kembali ke halaman masuk dan coba lagi.');
      return;
    }

    setIsResending(true);
    setError('');

    try {
      await authApi.resendVerification(email);
      setMessage(`Tautan verifikasi baru dikirim ke ${maskEmail(email)}.`);
      setSecondsLeft(RESEND_SECONDS);
    } catch {
      setError('Gagal mengirim ulang. Coba lagi beberapa saat lagi.');
    } finally {
      setIsResending(false);
    }
  };

  const countdown = `00:${String(secondsLeft).padStart(2, '0')}`;

  return (
    <AuthLayout>
      <FormHeading
        title="Cek email Anda"
        subtitle="Buka tautan verifikasi pada email Anda, atau tempel kodenya di bawah ini."
      />

      <div className="space-y-6">
        {message && <Notice tone="success">{message}</Notice>}
        {error && <Notice tone="danger">{error}</Notice>}

        <Icon name="mail-check" size={48} className="text-primary-600" />

        {email && (
          <p className="text-[13px] text-neutral-500">Alamat tujuan: {maskEmail(email)}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="space-y-2">
            <label htmlFor="token" className="block text-base font-semibold text-neutral-900">
              Kode verifikasi
            </label>
            <input
              id="token"
              type="text"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              autoComplete="one-time-code"
              className="min-h-[56px] w-full rounded-control border border-neutral-500/50 bg-white px-4 py-3 text-center text-base tracking-widest text-neutral-900 outline-none placeholder:text-neutral-500/50 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/40"
              placeholder="Tempel kode dari email"
            />
            <p className="text-[13px] leading-5 text-neutral-500">
              Kode pada email berupa tautan panjang yang bisa Anda salin seluruhnya.
            </p>
          </div>

          <div className="rounded-control bg-surface-50 p-4">
            <div className="flex items-center gap-2">
              <Icon name="info" size={20} className="shrink-0 text-neutral-500" />
              <p className="text-base font-semibold text-neutral-900">Berlaku selama 15 menit</p>
            </div>
            <p className="mt-2 text-base leading-6 text-neutral-900/80">
              Kode hanya dapat digunakan satu kali. Jangan bagikan kode kepada siapa pun.
            </p>
          </div>

          <Button type="submit" loading={isLoading} disabled={!token.trim()}>
            Verifikasi email
          </Button>
        </form>

        <Button
          variant="ghost"
          onClick={handleResend}
          loading={isResending}
          disabled={secondsLeft > 0 || !email}
          className={secondsLeft > 0 || !email ? 'text-neutral-500' : ''}
        >
          {secondsLeft > 0 ? `Kirim ulang dalam ${countdown}` : 'Kirim ulang kode'}
        </Button>

        <p className="text-[13px] leading-5 text-neutral-500">
          Periksa folder spam. Setelah terverifikasi, Anda dapat masuk ke Glukain.
        </p>

        <Link
          to="/login"
          className="flex min-h-[48px] items-center justify-center rounded-control text-base font-semibold text-primary-600 transition-colors hover:bg-primary-600/5"
        >
          Kembali ke masuk
        </Link>
      </div>

      <AuthFooter />
    </AuthLayout>
  );
}
