import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from './navigation';

const Sidebar = () => {
  return (
    <aside className="hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white/90 p-6 lg:flex lg:flex-col">
      <div>
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
            GO
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">GoalOS</p>
            <p className="text-xs text-slate-500">Personal productivity</p>
          </div>
        </div>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                ].join(' ')
              }
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-slate-200 bg-white text-[11px]">
                {item.short}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Planning Tip</p>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          Break large goals into monthly outcomes, weekly priorities, and daily tasks.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;

