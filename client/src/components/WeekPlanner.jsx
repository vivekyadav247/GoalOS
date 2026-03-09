import { useMemo } from 'react';
import TaskCard from './TaskCard';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const WeekPlanner = ({
  week,
  tasks = [],
  open = false,
  busyTaskId = '',
  onToggleWeek,
  onAddTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  highlightToday = false,
  containerRef
}) => {
  const groupedByDay = useMemo(() => {
    const map = {};
    for (const day of DAYS) {
      map[day] = [];
    }
    for (const task of tasks) {
      if (!task.date) continue;
      const date = new Date(task.date);
      const weekday = DAYS[date.getDay() === 0 ? 6 : date.getDay() - 1];
      map[weekday].push(task);
    }
    return map;
  }, [tasks]);

  const formatRangeLabel = () => {
    const start = new Date(week.startDate);
    const end = new Date(week.endDate);
    const startLabel = start.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
    const endLabel = end.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
    return `${startLabel} - ${endLabel}`;
  };

  const todayName = useMemo(
    () => new Date().toLocaleDateString(undefined, { weekday: 'long' }),
    []
  );

  return (
    <div ref={containerRef} className="rounded-xl border border-slate-200 bg-slate-50/70">
      <div className="flex items-center gap-2 px-3 py-3 sm:px-4">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
          onClick={() => onToggleWeek(week._id)}
        >
          <div className="flex min-w-0 items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-xs font-semibold text-blue-700">
              W
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">Week: {formatRangeLabel()}</p>
              <p className="text-xs text-slate-500">
                {tasks.filter((task) => task.completed).length}/{tasks.length} tasks
              </p>
            </div>
          </div>
          <span className="shrink-0 text-xs font-semibold text-slate-500">{open ? 'Hide' : 'Show'}</span>
        </button>

        <button
          type="button"
          className="btn-secondary shrink-0 px-2.5 py-1.5 text-xs"
          onClick={() => onAddTask(week._id)}
        >
          Add Task
        </button>
      </div>

      {open ? (
        <div className="border-t border-slate-200 px-3 py-3 sm:px-4">
          {tasks.length === 0 ? (
            <p className="text-sm text-slate-500">No tasks for this week.</p>
          ) : (
            <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
              {DAYS.map((day) => {
                const dayTasks = groupedByDay[day] || [];
                if (dayTasks.length === 0) {
                  return null;
                }
                const isToday = highlightToday && todayName === day;
                return (
                  <div
                    key={day}
                    className={[
                      'space-y-1.5 rounded-lg',
                      isToday ? 'border border-blue-100 bg-blue-50/60 px-2 py-1' : ''
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 text-[10px] text-slate-700">
                        {day.slice(0, 2)}
                      </span>
                      <span>{day}</span>
                      {isToday ? (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                          Today
                        </span>
                      ) : null}
                    </div>
                    <div className="space-y-1.5">
                      {dayTasks.map((task) => (
                        <TaskCard
                          key={task._id}
                          task={task}
                          busy={busyTaskId === task._id}
                          onToggle={() => onToggleTask(task)}
                          onEdit={() => onEditTask(task)}
                          onDelete={() => onDeleteTask(task._id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default WeekPlanner;
