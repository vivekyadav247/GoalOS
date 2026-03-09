const statusClasses = {
  completed: 'border-emerald-300 bg-emerald-200',
  partial: 'border-amber-300 bg-amber-200',
  missed: 'border-rose-300 bg-rose-200',
  none: 'border-slate-200 bg-slate-100'
};

import { CalendarDays } from 'lucide-react';

const CalendarView = ({ weeks = [] }) => {
  return (
    <section className="surface-card overflow-hidden p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
          <CalendarDays className="h-4 w-4 text-blue-600" aria-hidden="true" />
          Productivity History
        </span>
        <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-300" /> Completed</span>
        <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-amber-300" /> Partial</span>
        <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-rose-300" /> Missed</span>
      </div>

      {weeks.length === 0 ? (
        <p className="text-sm text-slate-500">No calendar data available yet.</p>
      ) : (
        <div className="space-y-3">
          {weeks.map((week) => (
            <div key={week.id || week.week} className="grid grid-cols-[44px_1fr] items-center gap-2 sm:grid-cols-[56px_1fr] sm:gap-3">
              <p className="text-xs font-medium text-slate-500">W{week.week}</p>
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {week.days.map((day) => (
                  <div
                    key={`${week.id || week.week}-${day.label}`}
                    className={[
                      'flex h-10 items-center justify-center rounded-lg border text-[11px] font-semibold text-slate-700',
                      statusClasses[day.status || 'none']
                    ].join(' ')}
                    title={`${day.label}: ${day.status || 'none'}`}
                  >
                    {day.label}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default CalendarView;

