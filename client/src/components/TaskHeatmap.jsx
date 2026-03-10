import { useEffect, useMemo, useState } from 'react';

const WEEKS = 53;
const DAYS = 7;
const CELL_SIZE = 14;
const CELL_GAP = 4;
const MONTH_GAP = 8;

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
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
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

const startOfWeek = (date) => {
  const d = normalizeDate(date);
  if (!d) return null;
  d.setDate(d.getDate() - d.getDay());
  return d;
};

const dayDiff = (a, b) => Math.round((a.getTime() - b.getTime()) / 86400000);

const isCountedTask = (task) => {
  return Boolean(task?.date);
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

  const yearGridStart = useMemo(
    () => startOfWeek(new Date(selectedYear, 0, 1)),
    [selectedYear]
  );

  const monthStartWeeks = useMemo(() => {
    if (!yearGridStart) return [];

    const indices = [];
    for (let month = 0; month < 12; month += 1) {
      const firstDay = new Date(selectedYear, month, 1);
      const weekIndex = Math.floor(dayDiff(firstDay, yearGridStart) / DAYS);
      if (weekIndex >= 0 && weekIndex < WEEKS) indices.push(weekIndex);
    }
    return Array.from(new Set(indices)).sort((a, b) => a - b);
  }, [yearGridStart, selectedYear]);

  const monthStartSet = useMemo(
    () => new Set(monthStartWeeks.slice(1)),
    [monthStartWeeks]
  );

  const visualColumns = useMemo(() => {
    const cols = [];
    for (let week = 0; week < WEEKS; week += 1) {
      cols.push({ type: 'week', week });
      if (monthStartSet.has(week + 1)) {
        cols.push({ type: 'gap', key: `gap-${week}` });
      }
    }
    return cols;
  }, [monthStartSet]);

  const columnWidthPx = (column) => (column.type === 'week' ? CELL_SIZE : MONTH_GAP);

  const columnOffsets = useMemo(() => {
    const offsets = [];
    let x = 0;
    for (let i = 0; i < visualColumns.length; i += 1) {
      offsets.push(x);
      x += columnWidthPx(visualColumns[i]);
      if (i < visualColumns.length - 1) x += CELL_GAP;
    }
    return offsets;
  }, [visualColumns]);

  const gridWidth = useMemo(() => {
    if (visualColumns.length === 0) return 0;
    let total = 0;
    for (const col of visualColumns) total += columnWidthPx(col);
    total += CELL_GAP * (visualColumns.length - 1);
    return total;
  }, [visualColumns]);

  const monthLabels = useMemo(() => {
    if (!yearGridStart || visualColumns.length === 0) return [];

    const labels = [];
    const monthStarts = [];

    for (let month = 0; month < 12; month += 1) {
      const firstDay = new Date(selectedYear, month, 1);
      const weekIndex = Math.floor(dayDiff(firstDay, yearGridStart) / DAYS);
      if (weekIndex < 0 || weekIndex >= WEEKS) continue;

      const visualIndex = visualColumns.findIndex(
        (column) => column.type === 'week' && column.week === weekIndex
      );
      if (visualIndex === -1) continue;

      monthStarts.push({
        month,
        visualIndex
      });
    }

    for (let i = 0; i < monthStarts.length; i += 1) {
      const current = monthStarts[i];
      const next = monthStarts[i + 1];
      const startX = columnOffsets[current.visualIndex];
      const endX = next ? columnOffsets[next.visualIndex] : gridWidth;
      const centerX = (startX + endX) / 2;

      labels.push({
        key: `${selectedYear}-${current.month}`,
        label: monthFormatter.format(new Date(selectedYear, current.month, 1)),
        left: centerX
      });
    }

    return labels;
  }, [selectedYear, yearGridStart, visualColumns, columnOffsets, gridWidth]);

  const gridCells = useMemo(() => {
    if (!yearGridStart) return [];

    const cells = [];
    for (const column of visualColumns) {
      if (column.type === 'gap') {
        for (let day = 0; day < DAYS; day += 1) {
          cells.push({
            type: 'gap',
            key: `${column.key}-d${day}`
          });
        }
        continue;
      }

      for (let day = 0; day < DAYS; day += 1) {
        const date = new Date(yearGridStart);
        date.setDate(yearGridStart.getDate() + column.week * DAYS + day);

        const inYear = date.getFullYear() === selectedYear;
        const key = toDateKey(date);
        const count = inYear ? countsByDate.get(key) || 0 : 0;
        cells.push({
          type: 'day',
          key: `${column.week}-${day}-${key}`,
          inYear,
          count,
          tooltip: `${dateFormatter.format(date)}\n${count} ${count === 1 ? 'task' : 'tasks'} completed`
        });
      }
    }

    return cells;
  }, [selectedYear, yearGridStart, visualColumns, countsByDate]);

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
    const anchor =
      selectedYear === currentYear
        ? normalizeDate(new Date())
        : new Date(selectedYear, 11, 31);

    if (!anchor) return 0;

    let streak = 0;
    const cursor = new Date(anchor);

    while (cursor.getFullYear() === selectedYear) {
      const key = toDateKey(cursor);
      if ((countsByDate.get(key) || 0) === 0) break;
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  }, [countsByDate, selectedYear, currentYear]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-2xl font-semibold text-slate-900 md:text-4xl">
            {numberFormatter.format(totalSubmissions)}{' '}
            <span className="text-xl font-medium text-slate-600 md:text-3xl">
              submissions in {selectedYear}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
          <span>Total active days: {totalActiveDays}</span>
          <span>Max streak: {maxStreak}</span>
          <span>Current streak: {currentStreak}</span>
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
        <div className="min-w-max px-3">
          <div style={{ width: `${gridWidth}px` }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: visualColumns
                  .map((column) => `${columnWidthPx(column)}px`)
                  .join(' '),
                gridTemplateRows: `repeat(${DAYS}, ${CELL_SIZE}px)`,
                gridAutoFlow: 'column',
                gap: `${CELL_GAP}px`,
                width: `${gridWidth}px`,
                minWidth: `${gridWidth}px`
              }}
            >
              {gridCells.map((cell) => {
                if (cell.type === 'gap') {
                  return <div key={cell.key} className="h-[14px] w-full bg-transparent" aria-hidden="true" />;
                }

                return (
                  <div
                    key={cell.key}
                    className={[
                      'h-[14px] w-[14px] rounded-[3px]',
                      cell.inYear ? colorByCount(cell.count) : 'bg-transparent'
                    ].join(' ')}
                    title={cell.tooltip}
                    aria-label={cell.tooltip}
                  />
                );
              })}
            </div>

            <div className="relative mt-3 h-6 text-sm text-slate-400" style={{ width: `${gridWidth}px` }}>
              {monthLabels.map((month) => (
                <span
                  key={month.key}
                  className="absolute top-0 -translate-x-1/2"
                  style={{ left: `${month.left}px` }}
                >
                  {month.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TaskHeatmap;
