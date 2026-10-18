import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../api/auth';
import Logo from '../components/assets/Logo';
import { HeartIcon, DocIcon, CalendarIcon, ShieldIcon, EyeIcon, ArrowRightIcon } from '../components/assets/illustrations';

const registerSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(100),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter').regex(/[a-zA-Z]/, 'Wajib mengandung huruf').regex(/[0-9]/, 'Wajib mengandung angka'),
  confirmPassword: z.string(),
  consent: z.literal(true, { errorMap: () => ({ message: 'Anda harus menyetujui kebijakan privasi' }) }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Konfirmasi password tidak sama',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');

  const passwordChecks = [
    { label: 'Minimal 8 karakter', valid: password.length >= 8 },
    { label: 'Ada huruf dan angka', valid: /[a-zA-Z]/.test(password) && /[0-9]/.test(password) },
    { label: 'Bukan password umum', valid: !['password', '12345678', 'qwerty123'].includes(password.toLowerCase()) },
  ];

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setServerError('');

    try {
      await authApi.register(data);
      navigate('/verify-email', { state: { email: data.email } });
    } catch (error: any) {
      setServerError(error.response?.data?.error?.message || 'Registrasi gagal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-violet-600 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute bottom-40 left-10 w-32 h-32 rounded-full bg-white/5" />

        <Logo light />

        <div className="relative z-10">
          <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-6">
            Lebih memahami kondisi. Lebih tenang menjalani hari.
          </h1>
          <p className="text-white/70 text-lg mb-10 max-w-md">
            Pendamping rutinitas bagi Anda yang sudah didiagnosis diabetes oleh dokter.
          </p>

          {/* Feature card */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 max-w-sm">
            <div className="space-y-4">
              <FeatureItem icon={<HeartIcon />} text="Satu tempat untuk kesehatan Anda" />
              <FeatureItem icon={<DocIcon />} text="Hasil pemeriksaan lebih mudah dibaca" />
              <FeatureItem icon={<CalendarIcon />} text="Jadwal obat sesuai resep" />
              <FeatureItem icon={<ShieldIcon />} text="Data medis Anda tetap privat" />
            </div>
          </div>
        </div>

        <p className="text-white/50 text-sm relative z-10">
          Glukain tidak menggantikan dokter.
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo />
          </div>

          <div className="mb-8">
            <p className="text-sm font-semibold text-primary-600 mb-2">S-02 - AKUN GLUKAIN</p>
            <h2 className="text-2xl xl:text-3xl font-bold text-neutral-900 mb-3">
              Mulai bersama Glukain
            </h2>
            <p className="text-neutral-500">
              Buat akun untuk memantau kondisi Anda. Khusus pasien yang sudah didiagnosis diabetes.
            </p>
          </div>

          {serverError && (
            <div className="p-3 rounded-input bg-danger-100 text-danger-600 text-sm mb-4">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Nama */}
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">Nama lengkap</label>
              <input
                {...register('name')}
                type="text"
                className="input-field"
                placeholder="Siti Rahmawati"
              />
              {errors.name && <p className="text-danger-600 text-sm mt-1">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">Email</label>
              <input
                {...register('email')}
                type="email"
                className="input-field"
                placeholder="siti.rahmawati@mail.com"
              />
              {errors.email && <p className="text-danger-600 text-sm mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-12"
                  placeholder=" "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900"
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
              <p className="text-xs text-neutral-500 mt-1.5">Kuat - Disarankan minimal 12 karakter</p>

              {/* Password strength */}
              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  {passwordChecks.map((check, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${check.valid ? 'bg-success-100' : 'bg-neutral-500/10'}`}>
                        {check.valid && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-success-600">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs ${check.valid ? 'text-success-600' : 'text-neutral-500'}`}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {errors.password && <p className="text-danger-600 text-sm mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">Konfirmasi password</label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="input-field pr-12"
                  placeholder=" "
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900"
                >
                  <EyeIcon visible={showConfirmPassword} />
                </button>
              </div>
              {errors.confirmPassword && <p className="text-danger-600 text-sm mt-1">{errors.confirmPassword.message}</p>}
            </div>

            {/* Consent */}
            <div className="flex items-start gap-3">
              <input
                {...register('consent')}
                type="checkbox"
                className="mt-1 w-5 h-5 rounded border-neutral-500/30 text-primary-600 focus:ring-primary-600"
              />
              <label className="text-sm text-neutral-500">
                Saya menyetujui <a href="#" className="text-primary-600 underline">Kebijakan Privasi</a> dan pemrosesan data medis untuk layanan Glukain. <span className="text-danger-600">(Wajib)</span>
              </label>
            </div>
            {errors.consent && <p className="text-danger-600 text-sm">{errors.consent.message}</p>}

            {/* Submit */}
            <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
              {isLoading ? 'Memproses...' : (
                <>
                  Daftar
                  <ArrowRightIcon />
                </>
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-6 text-center space-y-4">
            <p className="text-neutral-500">
              Sudah punya akun? <Link to="/login" className="text-primary-600 font-medium">Masuk</Link>
            </p>
            <p className="text-xs text-neutral-500">
              Setelah daftar, cek email Anda untuk verifikasi. Data kesehatan hanya dapat diakses oleh Anda.
            </p>
            <p className="text-xs text-neutral-500">
              Bantuan - <a href="#" className="text-primary-600">Kebijakan Privasi</a> - 2026 Glukain
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
        {icon}
      </div>
      <span className="text-white font-medium">{text}</span>
    </div>
  );
}
