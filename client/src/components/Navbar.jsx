import Logo from './Logo';
import { Link, NavLink } from 'react-router-dom';
import { Show, UserButton, useUser } from '@clerk/react';
import { Flame, UserCircle2 } from 'lucide-react';
import { useMemo } from 'react';
import usePlannerData from '../hooks/usePlannerData';

const desktopItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/goals', label: 'Goals' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/calendar', label: 'Calendar' }
];

const Navbar = () => {
  const { user } = useUser();
  const { tasks } = usePlannerData();

  const streak = useMemo(() => {
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return { current: 0, hasToday: false };
    }

    const toKey = (value) => {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const completedDays = new Set(
      tasks
        .filter((task) => task?.completed && task?.date)
        .map((task) => toKey(task.date))
        .filter(Boolean)
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = toKey(today);
    const hasToday = completedDays.has(todayKey);

    let current = 0;
    const cursor = new Date(today);

    while (true) {
      const key = toKey(cursor);
      if (!completedDays.has(key)) break;
      current += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return { current, hasToday };
  }, [tasks]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-3">
          <Logo size="sm" />
        </Link>

        <nav className="hidden items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 md:flex">
          {desktopItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition',
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div
            className="flex h-10 min-w-[40px] items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2 text-slate-700"
            aria-label="Current streak"
            title="Current streak"
          >
            <Flame className="h-5 w-5 text-orange-500" aria-hidden="true" />
            <span className="text-xs font-semibold text-slate-700">{streak.current}</span>
          </div>
          <Show when="signed-in">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm">
              <UserButton
                afterSignOutUrl="/"
                userProfileMode="navigation"
                userProfileUrl="/profile"
                appearance={{
                  elements: {
                    avatarBox: 'h-8 w-8'
                  }
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Action label="manageAccount" />
                  <UserButton.Action label="signOut" />
                </UserButton.MenuItems>
              </UserButton>
            </div>
          </Show>
          {!user && (
            <Link
              to="/profile"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
              aria-label="Open profile"
              title="Profile"
            >
              <UserCircle2 className="h-5 w-5" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
