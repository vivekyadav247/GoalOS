import { useEffect, useMemo, useState } from 'react';

const DAYS = 7;
const CELL_SIZE = 14;
const CELL_GAP = 4;

const numberFormatter = new Intl.NumberFormat();
const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
});
const monthFormatter = new Intl.DateTimeFormat(undefined, { month: 'short' });

const normalizeDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  if (typeof value === 'string') {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      return new Date(year, month - 1, day);
    }
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

const toDateKey = (value) => {
  const date = normalizeDate(value);
  if (!date) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fromDateKey = (key) => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const dayDiff = (a, b) => Math.round((a.getTime() - b.getTime()) / 86400000);

const isCountedTask = (task) => {
  return Boolean(task?.date && task?.completed);
};

const colorByCount = (count) => {
  if (count >= 3) return 'bg-blue-600';
  if (count === 2) return 'bg-blue-400';
  if (count === 1) return 'bg-blue-200';
  return 'bg-slate-200';
};

const TaskHeatmap = ({ tasks = [] }) => {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const today = useMemo(() => normalizeDate(new Date()), []);
  const currentYear = today ? today.getFullYear() : new Date().getFullYear();

  const availableYears = useMemo(() => {
    const years = new Set([currentYear]);
    for (const task of safeTasks) {
      const date = normalizeDate(task?.date);
      if (date) years.add(date.getFullYear());
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [safeTasks, currentYear]);

  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0] || currentYear);
    }
  }, [availableYears, selectedYear, currentYear]);

  const allCountsByDate = useMemo(() => {
    const counts = new Map();

    for (const task of safeTasks) {
      if (!isCountedTask(task)) continue;

      const date = normalizeDate(task.date);
      if (!date) continue;

      const key = toDateKey(date);
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    return counts;
  }, [safeTasks]);

  const countsByDate = useMemo(() => {
    const counts = new Map();

    for (const task of safeTasks) {
      if (!isCountedTask(task)) continue;

      const date = normalizeDate(task.date);
      if (!date || date.getFullYear() !== selectedYear) continue;

      const key = toDateKey(date);
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    return counts;
  }, [safeTasks, selectedYear]);

  const todayKey = toDateKey(new Date());
  const todayCount = allCountsByDate.get(todayKey) || 0;

  const months = useMemo(() => {
    const items = [];

    for (let month = 0; month < 12; month += 1) {
      const firstDay = new Date(selectedYear, month, 1);
      const daysInMonth = new Date(selectedYear, month + 1, 0).getDate();
      const startOffset = (firstDay.getDay() + 6) % 7;
      const totalSlots = startOffset + daysInMonth;
      const columns = Math.ceil(totalSlots / DAYS);
      const cells = [];

      for (let col = 0; col < columns; col += 1) {
        for (let row = 0; row < DAYS; row += 1) {
          const index = col * DAYS + row;
          const dayNumber = index - startOffset + 1;

          if (dayNumber < 1 || dayNumber > daysInMonth) {
            cells.push({
              type: 'empty',
              key: `m${month}-e${col}-${row}`
            });
            continue;
          }

          const date = new Date(selectedYear, month, dayNumber);
          const key = toDateKey(date);
          const count = countsByDate.get(key) || 0;
          const taskLabel = count === 1 ? 'task' : 'tasks';
          const tooltipText = `${dateFormatter.format(date)} — ${count} ${taskLabel} completed`;

          cells.push({
            type: 'day',
            key,
            count,
            isToday: key === todayKey && selectedYear === currentYear,
            tooltip: tooltipText
          });
        }
      }

      items.push({
        key: `${selectedYear}-${month}`,
        label: monthFormatter.format(firstDay),
        columns,
        cells
      });
    }

    return items;
  }, [selectedYear, countsByDate, todayKey, currentYear]);

  const totalSubmissions = useMemo(
    () => Array.from(countsByDate.values()).reduce((sum, count) => sum + count, 0),
    [countsByDate]
  );

  const totalActiveDays = useMemo(
    () => Array.from(countsByDate.values()).filter((count) => count > 0).length,
    [countsByDate]
  );

  const maxStreak = useMemo(() => {
    const activeDates = Array.from(allCountsByDate.entries())
      .filter(([, count]) => count > 0)
      .map(([key]) => fromDateKey(key))
      .sort((a, b) => a.getTime() - b.getTime());

    if (activeDates.length === 0) return 0;

    let best = 0;
    let streak = 0;
    let prev = null;

    for (const date of activeDates) {
      if (!prev || dayDiff(date, prev) !== 1) {
        streak = 1;
      } else {
        streak += 1;
      }
      if (streak > best) best = streak;
      prev = date;
    }

    return best;
  }, [allCountsByDate]);

  const currentStreak = useMemo(() => {
    const todayDate = normalizeDate(new Date());
    if (!todayDate) return 0;
    if (todayCount === 0) return 0;

    let streak = 0;
    const cursor = new Date(todayDate);

    while (true) {
      const key = toDateKey(cursor);
      if (!key) break;
      if ((allCountsByDate.get(key) || 0) === 0) break;
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  }, [allCountsByDate, todayCount]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-2xl font-semibold text-slate-900 md:text-4xl">
            {numberFormatter.format(totalSubmissions)}{' '}
            <span className="text-xl font-medium text-slate-600 md:text-3xl">
              completed {totalSubmissions === 1 ? 'task' : 'tasks'} in {selectedYear}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
          <span>Active days: {totalActiveDays}</span>
          <span>Current streak: {currentStreak} {currentStreak === 1 ? 'day' : 'days'}</span>
          <span>Longest streak: {maxStreak} {maxStreak === 1 ? 'day' : 'days'}</span>
          <label htmlFor="heatmap-year" className="sr-only">
            Select year
          </label>
          <select
            id="heatmap-year"
            value={selectedYear}
            onChange={(event) => setSelectedYear(Number(event.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-6 px-2 py-2">
          {months.map((month) => (
            <div key={month.key} className="shrink-0">
              <p className="mb-2 text-xs font-semibold text-slate-500">{month.label}</p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${month.columns}, ${CELL_SIZE}px)`,
                  gridTemplateRows: `repeat(${DAYS}, ${CELL_SIZE}px)`,
                  gridAutoFlow: 'column',
                  gap: `${CELL_GAP}px`
                }}
              >
                {month.cells.map((cell) => {
                  if (cell.type === 'empty') {
                    return (
                      <span
                        key={cell.key}
                        className="h-[14px] w-[14px] rounded-[3px] bg-transparent"
                        aria-hidden="true"
                      />
                    );
                  }

                  return (
                    <span
                      key={`${month.key}-${cell.key}`}
                      className={[
                        'h-[14px] w-[14px] rounded-[3px]',
                        colorByCount(cell.count),
                        cell.isToday ? 'ring-1 ring-blue-400 ring-offset-1 ring-offset-white' : ''
                      ].join(' ')}
                      title={cell.tooltip}
                      aria-label={cell.tooltip}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TaskHeatmap;
