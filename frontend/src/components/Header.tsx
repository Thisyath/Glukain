import { Link } from 'react-router-dom';
import { AuthUser } from '../api/auth';

interface HeaderProps {
  user: AuthUser;
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="bg-white shadow-card sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <span className="font-bold text-lg text-neutral-900">Glukain</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-500 hidden sm:inline">
            Halo, {user.name.split(' ')[0]}
          </span>
          <div className="w-9 h-9 rounded-full bg-primary-600/10 flex items-center justify-center">
            <span className="text-primary-600 font-semibold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
