import { ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const buildTooltip = ({ label, isPast, isToday, stats }) => {
  const lines = [label];
  if (isPast) {
    lines.push(`Completed: ${stats.completed}`, `Missed: ${stats.pending}`);
    return lines.join('\n');
  }

  if (isToday) {
    lines.push(
      `Today: ${stats.total} ${stats.total === 1 ? 'task' : 'tasks'}`,
      `Done: ${stats.completed}`,
      `Pending: ${stats.pending}`
    );
    return lines.join('\n');
  }

  lines.push(
    `${stats.total} upcoming ${stats.total === 1 ? 'task' : 'tasks'}`
  );
  return lines.join('\n');
};

const CalendarView = ({ monthDate, tasks, onPrev, onNext, disablePrev, disableNext }) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = toDateKey(today);

  const statsByDate = new Map();
  for (const task of tasks) {
    if (!task?.date) continue;
    const date = new Date(task.date);
    if (Number.isNaN(date.getTime())) continue;
    if (date.getFullYear() !== year || date.getMonth() !== month) continue;
    const key = toDateKey(date);
    const current = statsByDate.get(key) || { total: 0, completed: 0, pending: 0 };
    current.total += 1;
    if (task.completed) {
      current.completed += 1;
    } else {
      current.pending += 1;
    }
    statsByDate.set(key, current);
  }

  const cells = [];
  const totalCells = 42;
  for (let i = 0; i < totalCells; i += 1) {
    const dayNumber = i - startOffset + 1;
    if (dayNumber < 1 || dayNumber > totalDays) {
      cells.push({ type: 'empty', key: `empty-${i}` });
    } else {
      const date = new Date(year, month, dayNumber);
      const key = toDateKey(date);
      const stats = statsByDate.get(key) || { total: 0, completed: 0, pending: 0 };
      cells.push({
        type: 'day',
        key,
        dayNumber,
        stats,
        label: date.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      });
    }
  }

  return (
    <section className="surface-card p-4 md:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Calendar</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900 md:text-2xl">
            {monthDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrev}
            disabled={disablePrev}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={disableNext}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-xs font-semibold text-slate-500">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center">
            {day}
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-2">
        {cells.map((cell) => {
          if (cell.type === 'empty') {
            return <div key={cell.key} className="h-12 rounded-lg bg-transparent" aria-hidden="true" />;
          }

          const isToday = cell.key === todayKey;
          const cellDate = new Date(year, month, cell.dayNumber);
          const isPast = cellDate < today;
          const tooltip = buildTooltip({
            label: cell.label,
            isPast,
            isToday,
            stats: cell.stats
          });
          return (
            <div
              key={cell.key}
              className={[
                'relative flex h-12 items-center justify-center rounded-lg border text-sm font-semibold',
                isToday
                  ? 'bg-blue-200 text-blue-900 border-blue-200'
                  : 'bg-white text-slate-700 border-slate-200'
              ].join(' ')}
              title={tooltip}
            >
              <span>{cell.dayNumber}</span>
              {isPast ? (
                <span className="absolute bottom-1 right-1 flex items-center gap-1">
                  {cell.stats.completed > 0 ? (
                    <span className="rounded-full bg-emerald-100 px-1 text-[10px] font-semibold text-emerald-700">
                      {cell.stats.completed}
                    </span>
                  ) : null}
                  {cell.stats.pending > 0 ? (
                    <span className="rounded-full bg-rose-100 px-1 text-[10px] font-semibold text-rose-700">
                      {cell.stats.pending}
                    </span>
                  ) : null}
                </span>
              ) : cell.stats.total > 0 ? (
                <span className="absolute bottom-1 right-1 rounded-full bg-blue-100 px-1 text-[10px] font-semibold text-blue-700">
                  {cell.stats.total}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CalendarView;
