import { NavLink } from 'react-router-dom';
import { MOBILE_NAV_ITEMS } from '../navigation';
import { Icon } from './icons';

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-500/10 bg-white lg:hidden">
      <div className="mx-auto flex max-w-[1056px] justify-around py-2">
        {MOBILE_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                isActive ? 'text-primary-600' : 'text-neutral-500'
              }`
            }
          >
            <Icon name={item.icon} size={24} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
