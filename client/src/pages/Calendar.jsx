import { useMemo, useState } from 'react';
import CalendarView from '../components/CalendarView';
import usePlannerData from '../hooks/usePlannerData';

const Calendar = () => {
  const { tasks, loading, error } = usePlannerData();
  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();
  const [activeMonth, setActiveMonth] = useState(
    new Date(currentYear, today.getMonth(), 1)
  );

  const disablePrev = activeMonth.getFullYear() === currentYear && activeMonth.getMonth() === 0;
  const disableNext = activeMonth.getFullYear() === currentYear && activeMonth.getMonth() === 11;

  return (
    <div className="space-y-6">
      <section>
        <h2 className="page-title">Calendar</h2>
        <p className="page-subtitle">
          Track daily execution in the current year, month by month.
        </p>
      </section>

      {error ? <div className="surface-card p-4 text-sm text-rose-700">{error}</div> : null}
      {loading ? (
        <div className="surface-card p-6 text-sm text-slate-500">Loading calendar...</div>
      ) : (
        <CalendarView
          monthDate={activeMonth}
          tasks={tasks}
          disablePrev={disablePrev}
          disableNext={disableNext}
          onPrev={() =>
            setActiveMonth((prev) => new Date(currentYear, Math.max(prev.getMonth() - 1, 0), 1))
          }
          onNext={() =>
            setActiveMonth((prev) => new Date(currentYear, Math.min(prev.getMonth() + 1, 11), 1))
          }
        />
      )}
    </div>
  );
};

export default Calendar;
