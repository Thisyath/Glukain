import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../api/auth';
import Logo from '../components/assets/Logo';
import { EyeIcon } from '../components/assets/illustrations';

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setServerError('');

    try {
      await authApi.login(data);
      navigate('/dashboard');
    } catch (error: any) {
      const code = error.response?.data?.error?.code;
      if (code === 'EMAIL_NOT_VERIFIED') {
        navigate('/verify-email');
      } else if (code === 'ACCOUNT_LOCKED') {
        setServerError('Terlalu banyak percobaan, coba lagi dalam 15 menit');
      } else {
        setServerError('Email atau password salah');
      }
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
          <p className="text-primary-600 text-[13px] font-bold mb-2">S-04 - MASUK</p>
          <h1 className="text-[28px] font-bold text-neutral-900 leading-9 mb-3">
            Selamat datang kembali
          </h1>
          <p className="text-neutral-500 text-base leading-6">
            Masuk ke akun Glukain Anda
          </p>
        </div>

        {serverError && (
          <div className="p-3 rounded-input bg-danger-100 text-danger-600 text-sm mb-4">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">Email</label>
            <input {...register('email')} type="email" className="input-field" placeholder="email@contoh.com" />
            {errors.email && <p className="text-danger-600 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">Password</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className="input-field pr-12"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900"
              >
                <EyeIcon visible={showPassword} />
              </button>
            </div>
            {errors.password && <p className="text-danger-600 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-primary-600 font-medium">
              Lupa password?
            </Link>
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full">
            {isLoading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="text-neutral-500 text-sm text-center mt-6">
          Belum punya akun?{' '}
          <Link to="/register" className="text-primary-600 font-medium">Daftar</Link>
        </p>

        <p className="text-neutral-500 text-[13px] text-center mt-4">
          <Link to="/" className="text-primary-600">Kembali ke Beranda</Link>
        </p>
      </div>
    </div>
  );
}
