import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi, AuthUser } from '../api/auth';
import { breadcrumbFor } from '../navigation';
import { Icon } from './icons';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join('') || 'G';
}

export default function WebHeader({ user }: { user: AuthUser }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  const handleLogout = async () => {
    setLeaving(true);
    try {
      await authApi.logout();
    } catch {
      // tetap arahkan ke login meski request gagal (token lokal sudah dibersihkan
      // oleh interceptor 401 bila perlu)
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-500/10 bg-white">
      <div className="mx-auto flex h-[72px] max-w-[1056px] items-center justify-between gap-4 px-4 lg:px-8">
        <p className="hidden truncate text-[13px] text-neutral-500 sm:block">
          Ruang kesehatan Anda / {breadcrumbFor(pathname)}
        </p>

        <div className="ml-auto flex items-center gap-3 lg:gap-4">
          <button
            type="button"
            title="Notifikasi"
            aria-label="Notifikasi"
            className="grid h-12 w-12 place-items-center rounded-control bg-surface-50 text-neutral-900 transition-colors hover:bg-surface-50/70"
          >
            <Icon name="bell" size={24} />
          </button>

          <Link to="/profile" className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-pill bg-primary-600 text-base font-bold text-white">
              {initials(user.name)}
            </span>
            <span className="hidden text-base font-semibold text-neutral-900 sm:block">
              {user.name}
            </span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={leaving}
            title="Keluar"
            aria-label="Keluar"
            className="grid h-10 w-10 place-items-center rounded-control text-neutral-500 transition-colors hover:bg-surface-50 hover:text-neutral-900 disabled:opacity-50"
          >
            <Icon name="log-out" size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
