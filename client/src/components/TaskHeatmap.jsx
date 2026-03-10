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
  if (count >= 4) return 'bg-blue-800';
  if (count === 3) return 'bg-blue-600';
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

  const yearGridStart = useMemo(() => {
    const first = new Date(selectedYear, 0, 1);
    const offset = first.getDay();
    const start = new Date(first);
    start.setDate(first.getDate() - offset);
    return start;
  }, [selectedYear]);

  const yearGridEnd = useMemo(() => {
    const last = new Date(selectedYear, 11, 31);
    const offset = (6 - last.getDay() + 7) % 7;
    const end = new Date(last);
    end.setDate(last.getDate() + offset);
    return end;
  }, [selectedYear]);

  const totalWeeks = useMemo(() => {
    const totalDays = dayDiff(yearGridEnd, yearGridStart) + 1;
    return Math.ceil(totalDays / DAYS);
  }, [yearGridEnd, yearGridStart]);

  const gridCells = useMemo(() => {
    const cells = [];
    for (let week = 0; week < totalWeeks; week += 1) {
      for (let day = 0; day < DAYS; day += 1) {
        const date = new Date(yearGridStart);
        date.setDate(yearGridStart.getDate() + week * DAYS + day);

        const inYear = date.getFullYear() === selectedYear;
        const key = toDateKey(date);
        const count = inYear ? countsByDate.get(key) || 0 : 0;
        const stepLabel = count === 1 ? 'step' : 'steps';
        const tooltipText =
          count === 0
            ? `No steps on ${dateFormatter.format(date)}`
            : `${count} ${stepLabel} on ${dateFormatter.format(date)}`;

        cells.push({
          key: `${week}-${day}-${key}`,
          inYear,
          count,
          isToday: key === todayKey && selectedYear === currentYear,
          tooltip: tooltipText
        });
      }
    }
    return cells;
  }, [totalWeeks, yearGridStart, countsByDate, selectedYear, todayKey, currentYear]);

  const gridWidth = useMemo(() => {
    if (!totalWeeks) return 0;
    return totalWeeks * CELL_SIZE + (totalWeeks - 1) * CELL_GAP;
  }, [totalWeeks]);

  const monthLabels = useMemo(() => {
    const labels = [];
    for (let month = 0; month < 12; month += 1) {
      const firstDay = new Date(selectedYear, month, 1);
      const weekIndex = Math.floor(dayDiff(firstDay, yearGridStart) / DAYS);
      if (weekIndex < 0 || weekIndex >= totalWeeks) continue;
      labels.push({
        key: `${selectedYear}-${month}`,
        label: monthFormatter.format(firstDay),
        left: weekIndex * (CELL_SIZE + CELL_GAP)
      });
    }
    return labels;
  }, [selectedYear, totalWeeks, yearGridStart]);

  const totalSubmissions = useMemo(
    () => Array.from(countsByDate.values()).reduce((sum, count) => sum + count, 0),
    [countsByDate]
  );

  const totalActiveDays = useMemo(
    () => Array.from(countsByDate.values()).filter((count) => count > 0).length,
    [countsByDate]
  );

  const maxStreak = useMemo(() => {
    const activeDates = Array.from(countsByDate.entries())
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
  }, [countsByDate]);

  const currentStreak = useMemo(() => {
    const todayDate = normalizeDate(new Date());
    if (!todayDate) return 0;

    const anchor = new Date(todayDate);
    if (todayCount === 0) {
      anchor.setDate(anchor.getDate() - 1);
    }

    let streak = 0;
    const cursor = new Date(anchor);

    while (true) {
      const key = toDateKey(cursor);
      if (!key) break;
      if ((allCountsByDate.get(key) || 0) === 0) break;
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  }, [allCountsByDate, todayCount]);

  const isStreakPending = useMemo(() => todayCount === 0, [todayCount]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-2xl font-semibold text-slate-900 md:text-4xl">
            {numberFormatter.format(totalSubmissions)}{' '}
            <span className="text-xl font-medium text-slate-600 md:text-3xl">
              {totalSubmissions === 1 ? 'step' : 'steps'} in {selectedYear}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
          <span>Total active days: {totalActiveDays}</span>
          <span>Max streak: {maxStreak}</span>
          <span className={isStreakPending ? 'text-slate-400' : 'text-slate-500'}>
            Current streak: {currentStreak}
          </span>
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
        <div className="min-w-max px-2 py-2">
          <div style={{ width: `${gridWidth}px` }}>
            <div className="relative mb-2 h-4 text-xs text-slate-500">
              {monthLabels.map((month) => (
                <span key={month.key} className="absolute top-0" style={{ left: `${month.left}px` }}>
                  {month.label}
                </span>
              ))}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${totalWeeks}, ${CELL_SIZE}px)`,
                gridTemplateRows: `repeat(${DAYS}, ${CELL_SIZE}px)`,
                gridAutoFlow: 'column',
                gap: `${CELL_GAP}px`,
                width: `${gridWidth}px`,
                minWidth: `${gridWidth}px`
              }}
            >
              {gridCells.map((cell) => (
                <span
                  key={cell.key}
                  className={[
                    'h-[14px] w-[14px] rounded-[3px]',
                    cell.inYear ? colorByCount(cell.count) : 'bg-transparent',
                    cell.isToday
                      ? cell.count > 0
                        ? 'ring-2 ring-blue-300 ring-offset-1 ring-offset-white'
                        : 'ring-2 ring-slate-300 ring-offset-1 ring-offset-white'
                      : ''
                  ].join(' ')}
                  title={cell.tooltip}
                  aria-label={cell.tooltip}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TaskHeatmap;
