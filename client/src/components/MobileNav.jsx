import { NavLink } from 'react-router-dom';
import { BarChart2, CheckSquare, LayoutDashboard, Target, UserCircle2 } from 'lucide-react';

const mobileItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/profile', label: 'Profile', icon: UserCircle2 }
];

const MobileNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 pt-2 md:hidden">
      <div className="mx-auto grid h-16 w-full max-w-md grid-cols-5 gap-1 rounded-2xl border border-slate-200 bg-white/95 p-1 shadow-[0_14px_28px_-18px_rgba(15,23,42,0.45)] backdrop-blur">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'flex min-h-[52px] items-center justify-center rounded-xl px-1 text-[11px] font-medium transition',
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'
                ].join(' ')
              }
              aria-label={item.label}
            >
              <span className="flex h-6 w-6 items-center justify-center">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="sr-only">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
