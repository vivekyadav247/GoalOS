import { useMemo } from 'react';
import CalendarView from '../components/CalendarView';
import usePlannerData from '../hooks/usePlannerData';

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const normalizeDay = (value) => {
  if (!value) {
    return '';
  }
  const normalized = String(value).trim().toLowerCase();
  const matched = weekdays.find((day) => day.toLowerCase() === normalized);
  return matched || '';
};

const Calendar = () => {
  const { weeks, tasksByWeek, loading, error } = usePlannerData();

  const calendarWeeks = useMemo(() => {
    return [...weeks]
      .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
      .slice(-10)
      .map((week) => {
        const weekTasks = tasksByWeek[week._id] || [];

        return {
          id: week._id,
          week: week.weekNumber,
          days: weekdays.map((day) => {
            const dayTasks = weekTasks.filter((task) => normalizeDay(task.day) === day);
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
        };
      });
  }, [weeks, tasksByWeek]);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="page-title">Calendar</h2>
        <p className="page-subtitle">Visual productivity history for your recent weeks.</p>
      </section>

      {error ? <div className="surface-card p-4 text-sm text-rose-700">{error}</div> : null}
      {loading ? (
        <div className="surface-card p-6 text-sm text-slate-500">Loading calendar...</div>
      ) : (
        <CalendarView weeks={calendarWeeks} />
      )}
    </div>
  );
};

export default Calendar;

