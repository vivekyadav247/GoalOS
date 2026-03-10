import { useMemo, useState } from 'react';
import TaskCard from './TaskCard';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const PATTERNS = [
  { value: 'ALL_DAYS', label: 'Same for all days' },
  { value: 'WEEKDAY_WEEKEND', label: 'Mon-Fri same, weekend different' },
  { value: 'MON_SAT', label: 'Mon-Sat same, Sunday different' },
  { value: 'CUSTOM', label: 'Custom per day' }
];

const normalizeTask = (value) => (typeof value === 'string' ? value.trim() : '');

const buildWeekPlan = (pattern, config) => {
  const normalized = String(pattern || '').toUpperCase();

  if (normalized === 'CUSTOM') {
    return DAYS.reduce((acc, day) => {
      acc[day] = normalizeTask(config.customDays?.[day]);
      return acc;
    }, {});
  }

  if (normalized === 'WEEKDAY_WEEKEND') {
    const weekdayTask = normalizeTask(config.weekdayTask);
    const weekendTask = normalizeTask(config.weekendTask);
    return DAYS.reduce((acc, day, index) => {
      acc[day] = index < 5 ? weekdayTask : weekendTask;
      return acc;
    }, {});
  }

  if (normalized === 'MON_SAT') {
    const task = normalizeTask(config.task);
    const sundayTask = normalizeTask(config.sundayTask);
    return DAYS.reduce((acc, day, index) => {
      acc[day] = index < 6 ? task : sundayTask;
      return acc;
    }, {});
  }

  const task = normalizeTask(config.task);
  return DAYS.reduce((acc, day) => {
    acc[day] = task;
    return acc;
  }, {});
};

const WeekPlanner = ({
  week,
  tasks = [],
  open = false,
  busyTaskId = '',
  patternBusy = false,
  onToggleWeek,
  onAddTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onApplyPattern,
  highlightToday = false,
  containerRef
}) => {
  const [pattern, setPattern] = useState('ALL_DAYS');
  const [task, setTask] = useState('');
  const [weekdayTask, setWeekdayTask] = useState('');
  const [weekendTask, setWeekendTask] = useState('');
  const [sundayTask, setSundayTask] = useState('');
  const [customDays, setCustomDays] = useState(() =>
    DAYS.reduce((acc, day) => {
      acc[day] = '';
      return acc;
    }, {})
  );

  const groupedByDay = useMemo(() => {
    const map = {};
    for (const day of DAYS) {
      map[day] = [];
    }
    for (const taskItem of tasks) {
      if (!taskItem.date) continue;
      const date = new Date(taskItem.date);
      const weekday = DAYS[date.getDay() === 0 ? 6 : date.getDay() - 1];
      map[weekday].push(taskItem);
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

  const previewPlan = useMemo(
    () =>
      buildWeekPlan(pattern, {
        task,
        weekdayTask,
        weekendTask,
        sundayTask,
        customDays
      }),
    [pattern, task, weekdayTask, weekendTask, sundayTask, customDays]
  );

  const previewEntries = useMemo(
    () => DAYS.map((day) => ({ day, task: previewPlan[day] })),
    [previewPlan]
  );

  const hasPreviewTasks = previewEntries.some((entry) => entry.task);

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
                {tasks.filter((taskItem) => taskItem.completed).length}/{tasks.length} tasks
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
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm sm:px-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Weekly Pattern</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">Plan tasks for this week</p>
              </div>
              <button
                type="button"
                className="btn-primary px-3 py-2 text-xs"
                onClick={() =>
                  onApplyPattern?.(week, {
                    pattern,
                    task,
                    weekdayTask,
                    weekendTask,
                    sundayTask,
                    customDays
                  })
                }
                disabled={!hasPreviewTasks || patternBusy}
              >
                {patternBusy ? 'Applying...' : 'Apply Pattern'}
              </button>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="text-xs font-semibold text-slate-600">
                Pattern
                <select
                  className="input-base mt-1"
                  value={pattern}
                  onChange={(event) => setPattern(event.target.value)}
                >
                  {PATTERNS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {pattern === 'ALL_DAYS' ? (
                <label className="text-xs font-semibold text-slate-600">
                  Task for all days
                  <input
                    className="input-base mt-1"
                    placeholder="e.g. DSA practice"
                    value={task}
                    onChange={(event) => setTask(event.target.value)}
                  />
                </label>
              ) : null}

              {pattern === 'WEEKDAY_WEEKEND' ? (
                <>
                  <label className="text-xs font-semibold text-slate-600">
                    Weekday task
                    <input
                      className="input-base mt-1"
                      placeholder="Mon-Fri task"
                      value={weekdayTask}
                      onChange={(event) => setWeekdayTask(event.target.value)}
                    />
                  </label>
                  <label className="text-xs font-semibold text-slate-600">
                    Weekend task
                    <input
                      className="input-base mt-1"
                      placeholder="Sat-Sun task"
                      value={weekendTask}
                      onChange={(event) => setWeekendTask(event.target.value)}
                    />
                  </label>
                </>
              ) : null}

              {pattern === 'MON_SAT' ? (
                <>
                  <label className="text-xs font-semibold text-slate-600">
                    Mon-Sat task
                    <input
                      className="input-base mt-1"
                      placeholder="Mon-Sat task"
                      value={task}
                      onChange={(event) => setTask(event.target.value)}
                    />
                  </label>
                  <label className="text-xs font-semibold text-slate-600">
                    Sunday task
                    <input
                      className="input-base mt-1"
                      placeholder="Sunday task"
                      value={sundayTask}
                      onChange={(event) => setSundayTask(event.target.value)}
                    />
                  </label>
                </>
              ) : null}
            </div>

            {pattern === 'CUSTOM' ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {DAYS.map((day) => (
                  <label key={day} className="text-xs font-semibold text-slate-600">
                    {day}
                    <input
                      className="input-base mt-1"
                      placeholder={`Task for ${day}`}
                      value={customDays[day]}
                      onChange={(event) =>
                        setCustomDays((prev) => ({ ...prev, [day]: event.target.value }))
                      }
                    />
                  </label>
                ))}
              </div>
            ) : null}

            <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <p className="text-xs font-semibold text-slate-700">Preview</p>
              {hasPreviewTasks ? (
                <div className="mt-2 grid gap-1 sm:grid-cols-2">
                  {previewEntries.map((entry) => (
                    <div key={entry.day} className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-600">{entry.day}</span>
                      <span className="text-slate-500">{entry.task || 'Not set'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-slate-500">Add tasks above to preview the week.</p>
              )}
            </div>
          </div>

          {tasks.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No tasks for this week.</p>
          ) : (
            <div className="mt-3 max-h-96 space-y-3 overflow-y-auto pr-1">
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
                      {dayTasks.map((taskItem) => (
                        <TaskCard
                          key={taskItem._id}
                          task={taskItem}
                          busy={busyTaskId === taskItem._id}
                          onToggle={() => onToggleTask(taskItem)}
                          onEdit={() => onEditTask(taskItem)}
                          onDelete={() => onDeleteTask(taskItem._id)}
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
