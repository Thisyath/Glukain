import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../api/auth';

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <span className="font-bold text-xl text-neutral-900">Glukain</span>
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900">Masuk</h1>
          <p className="text-neutral-500 mt-2">Selamat datang kembali</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
          {serverError && (
            <div className="p-3 rounded-input bg-danger-100 text-danger-600 text-sm">
              {serverError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-1">Email</label>
            <input {...register('email')} type="email" className="input-field" placeholder="email@contoh.com" />
            {errors.email && <p className="text-danger-600 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-1">Password</label>
            <input {...register('password')} type="password" className="input-field" placeholder="Password" />
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

        <p className="text-center text-neutral-500 mt-6">
          Belum punya akun? <Link to="/register" className="text-primary-600 font-medium">Daftar</Link>
        </p>
      </div>
    </div>
  );
}
