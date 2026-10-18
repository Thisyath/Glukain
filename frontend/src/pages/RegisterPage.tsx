import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../api/auth';

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

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

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
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <span className="font-bold text-xl text-neutral-900">Glukain</span>
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900">Buat Akun</h1>
          <p className="text-neutral-500 mt-2">Mulai pantau kesehatan Anda</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
          {serverError && (
            <div className="p-3 rounded-input bg-danger-100 text-danger-600 text-sm">
              {serverError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-1">Nama Lengkap</label>
            <input {...register('name')} type="text" className="input-field" placeholder="Nama lengkap" />
            {errors.name && <p className="text-danger-600 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-1">Email</label>
            <input {...register('email')} type="email" className="input-field" placeholder="email@contoh.com" />
            {errors.email && <p className="text-danger-600 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-1">Password</label>
            <input {...register('password')} type="password" className="input-field" placeholder="Minimal 8 karakter" />
            {errors.password && <p className="text-danger-600 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-1">Konfirmasi Password</label>
            <input {...register('confirmPassword')} type="password" className="input-field" placeholder="Ulangi password" />
            {errors.confirmPassword && <p className="text-danger-600 text-sm mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <div className="flex items-start gap-2">
            <input {...register('consent')} type="checkbox" className="mt-1 w-5 h-5 rounded border-neutral-500/30" />
            <label className="text-sm text-neutral-500">
              Saya menyetujui <a href="#" className="text-primary-600 underline">Kebijakan Privasi</a> dan pengolahan data kesehatan saya
            </label>
          </div>
          {errors.consent && <p className="text-danger-600 text-sm">{errors.consent.message}</p>}

          <button type="submit" disabled={isLoading} className="btn-primary w-full">
            {isLoading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <p className="text-center text-neutral-500 mt-6">
          Sudah punya akun? <Link to="/login" className="text-primary-600 font-medium">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
