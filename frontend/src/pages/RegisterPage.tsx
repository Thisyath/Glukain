import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import AuthLayout, { AuthFooter } from '../components/auth/AuthLayout';
import FormHeading from '../components/auth/FormHeading';
import Notice from '../components/auth/Notice';
import TextField from '../components/auth/TextField';
import Button from '../components/Button';
import { Icon } from '../components/icons';

function strengthHint(password: string): string {
  if (password.length === 0) return 'Minimal 8 karakter • huruf dan angka • disarankan 12+';
  if (password.length >= 12) return 'Kuat • Disarankan minimal 12 karakter';
  if (password.length >= 8) return 'Sedang • Disarankan minimal 12 karakter';
  return 'Lemah • Minimal 8 karakter';
}

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const validate = () => {
    const next: Record<string, string> = {};

    if (!form.name.trim()) next.name = 'Nama wajib diisi';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Format email tidak valid';
    if (form.password.length < 8) next.password = 'Password minimal 8 karakter';
    else if (!/[a-zA-Z]/.test(form.password)) next.password = 'Password wajib mengandung huruf';
    else if (!/[0-9]/.test(form.password)) next.password = 'Password wajib mengandung angka';
    if (form.password !== form.confirmPassword) {
      next.confirmPassword = 'Konfirmasi password tidak sama';
    }
    if (!consent) next.consent = 'Anda harus menyetujui kebijakan privasi';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setServerError('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      await authApi.register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        consent: true,
      });
      navigate(`/verify-email?email=${encodeURIComponent(form.email.trim())}`, {
        state: { email: form.email.trim() },
      });
    } catch (err: any) {
      setServerError(err.response?.data?.error?.message || 'Pendaftaran gagal, coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <FormHeading
        title="Mulai bersama Glukain"
        subtitle="Buat akun untuk memantau kondisi Anda. Khusus pasien yang telah didiagnosis diabetes."
      />

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {serverError && <Notice tone="danger">{serverError}</Notice>}

        <TextField
          label="Nama lengkap"
          value={form.name}
          onChange={(event) => update('name', event.target.value)}
          error={errors.name}
          autoComplete="name"
          placeholder="Siti Rahmawati"
        />

        <TextField
          label="Email"
          type="email"
          value={form.email}
          onChange={(event) => update('email', event.target.value)}
          error={errors.email}
          autoComplete="email"
          placeholder="siti.rahmawati@email.com"
        />

        <TextField
          label="Password"
          toggleable
          value={form.password}
          onChange={(event) => update('password', event.target.value)}
          error={errors.password}
          hint={strengthHint(form.password)}
          autoComplete="new-password"
        />

        <div className="flex items-center gap-2">
          <Icon name="circle-check" size={20} className="shrink-0 text-neutral-500" />
          <p className="text-[13px] leading-5 text-neutral-500">
            Minimal 8 karakter • Ada huruf dan angka • Bukan password umum
          </p>
        </div>

        <TextField
          label="Konfirmasi password"
          toggleable
          value={form.confirmPassword}
          onChange={(event) => update('confirmPassword', event.target.value)}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <button
              type="button"
              role="checkbox"
              aria-checked={consent}
              aria-label="Setujui kebijakan privasi"
              onClick={() => setConsent((value) => !value)}
              className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-sm border transition-colors ${
                consent
                  ? 'border-primary-600 bg-primary-600 text-white'
                  : 'border-neutral-500/60 bg-white text-transparent'
              }`}
            >
              <Icon name="check" size={16} />
            </button>
            <button
              type="button"
              onClick={() => setConsent((value) => !value)}
              className="text-left text-base leading-6 text-neutral-900"
            >
              Saya menyetujui Kebijakan Privasi dan pemrosesan data medis untuk layanan Glukain.
              (Wajib)
            </button>
          </div>
          {errors.consent && <p className="text-[13px] text-danger-600">{errors.consent}</p>}
        </div>

        <Button type="submit" icon="arrow-right" loading={isLoading}>
          Daftar
        </Button>

        <p className="text-center text-base text-neutral-900">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:underline">
            Masuk
          </Link>
        </p>

        <p className="text-[13px] leading-5 text-neutral-500">
          Setelah daftar, cek email Anda untuk verifikasi. Data kesehatan hanya dapat diakses oleh
          Anda.
        </p>
      </form>

      <AuthFooter />
    </AuthLayout>
  );
}
