import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { authApi } from '../api/auth';
import BottomNav from './BottomNav';
import Header from './Header';

export default function Layout() {
  const user = authApi.getCurrentUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <Header user={user} />
      <main className="pb-20 pt-4 px-4 max-w-4xl mx-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
