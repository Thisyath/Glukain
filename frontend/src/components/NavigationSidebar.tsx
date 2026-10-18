import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../navigation';
import { Icon } from './icons';
import BrandMark from './assets/BrandMark';

export default function NavigationSidebar() {
  return (
    <aside className="hidden w-56 shrink-0 flex-col gap-8 border-r border-neutral-500/10 bg-white p-6 lg:sticky lg:top-0 lg:flex lg:h-screen">
      <NavLink to="/dashboard" className="flex items-center gap-2">
        <BrandMark />
        <span className="text-2xl font-extrabold tracking-tight text-primary-600">glukain</span>
      </NavLink>

      <nav className="flex flex-col gap-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex min-h-[48px] items-center gap-3 rounded-control px-3 py-3 text-base transition-colors ${
                isActive
                  ? 'bg-surface-50 font-bold text-primary-600'
                  : 'font-normal text-neutral-500 hover:bg-surface-50'
              }`
            }
          >
            <Icon name={item.icon} size={20} className="shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="rounded-card bg-surface-50 p-4">
          <Icon name="heart-handshake" size={24} className="text-primary-600" />
          <p className="mt-3 text-base font-semibold text-neutral-900">
            Langkah kecil, lebih berarti.
          </p>
          <p className="mt-1 text-[13px] leading-5 text-neutral-500">
            Kami menemani rutinitas sehat Anda.
          </p>
        </div>
        <p className="text-[13px] text-neutral-500">Glukain • Web pasien</p>
      </div>
    </aside>
  );
}
