import { useMemo } from 'react';
import CalendarView from '../components/CalendarView';
import usePlannerData from '../hooks/usePlannerData';

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const startOfWeek = (date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - (day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
};

const Calendar = () => {
  const { tasks, loading, error } = usePlannerData();

  const calendarWeeks = useMemo(() => {
    const weekBuckets = new Map();

    for (const task of tasks) {
      if (!task.date) continue;
      const date = new Date(task.date);
      const weekStart = startOfWeek(date);
      const key = weekStart.toISOString().slice(0, 10);
      if (!weekBuckets.has(key)) {
        weekBuckets.set(key, []);
      }
      weekBuckets.get(key).push(task);
    }

    return Array.from(weekBuckets.entries())
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .slice(-10)
      .map(([key, weekTasks], index) => ({
        id: key,
        week: index + 1,
        days: weekdays.map((day) => {
          const dayTasks = weekTasks.filter((task) => {
            if (!task.date) return false;
            const d = new Date(task.date);
            const weekday = weekdays[d.getDay() === 0 ? 6 : d.getDay() - 1];
            return weekday === day;
          });

          if (dayTasks.length === 0) {
            return { label: day.slice(0, 3), status: 'none' };
          }

          const completed = dayTasks.filter((task) => task.completed).length;
          if (completed === dayTasks.length) {
            return { label: day.slice(0, 3), status: 'completed' };
          }
          if (completed > 0) {
            return { label: day.slice(0, 3), status: 'partial' };
          }
          return { label: day.slice(0, 3), status: 'missed' };
        })
      }));
  }, [tasks]);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="page-title">Calendar</h2>
        <p className="page-subtitle">Visual productivity history for your recent weeks.</p>
      </section>

      {error ? <div className="surface-card p-4 text-sm text-rose-700">{error}</div> : null}
      {loading ? (
        <div className="surface-card p-6 text-sm text-slate-500">Loading calendar...</div>
      ) : calendarWeeks.length === 0 ? (
        <div className="surface-card p-6 text-sm text-slate-500">No tasks yet. Add tasks to populate calendar insights.</div>
      ) : (
        <CalendarView weeks={calendarWeeks} />
      )}
    </div>
  );
};

export default Calendar;
