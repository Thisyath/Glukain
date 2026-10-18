import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { authApi } from '../api/auth';
import BottomNav from './BottomNav';
import NavigationSidebar from './NavigationSidebar';
import WebHeader from './WebHeader';

export default function Layout() {
  const user = authApi.getCurrentUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-surface-50 lg:flex">
      <NavigationSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <WebHeader user={user} />
        <main className="mx-auto w-full max-w-[1056px] flex-1 space-y-6 px-4 py-6 pb-24 lg:px-8 lg:py-8 lg:pb-8">
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
