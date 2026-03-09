import { useLocation, useNavigate } from 'react-router-dom';
import { PAGE_TITLES } from './navigation';
import { clearAuthSession, getAuthUser } from '../services/api';

const resolveTitle = (pathname) => {
  if (pathname.startsWith('/goals/')) {
    return 'Goal Detail';
  }

  return PAGE_TITLES[pathname] || 'GoalOS';
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getAuthUser();

  const handleLogout = () => {
    clearAuthSession();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 sm:text-xl">{resolveTitle(location.pathname)}</h1>
          <p className="text-xs text-slate-500">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'short',
              day: 'numeric'
            })}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 md:block">
            Search
          </div>
          <button onClick={handleLogout} className="btn-secondary px-3 py-2 text-xs sm:text-sm">
            Log out
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-xs font-semibold text-white">
            {(user?.name || 'G').slice(0, 1).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

