import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from './navigation';
import { LayoutDashboard, Target, CheckSquare, BarChart2, CalendarDays } from 'lucide-react';

const navIconMap = {
  '/dashboard': LayoutDashboard,
  '/goals': Target,
  '/tasks': CheckSquare,
  '/analytics': BarChart2,
  '/calendar': CalendarDays
};

const MobileNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
      <div className="grid grid-cols-5 gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = navIconMap[item.to];
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'flex flex-col items-center justify-center rounded-xl px-1 py-2 text-[11px] font-medium transition',
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'
                ].join(' ')
              }
            >
              <span className="mb-1 flex h-5 w-5 items-center justify-center rounded-md border border-slate-200 bg-white text-[10px]">
                {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : item.short}
              </span>
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;

