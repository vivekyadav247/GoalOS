import { useMemo, useState } from 'react';
import { CalendarDays, ListChecks } from 'lucide-react';
import TaskCard from './TaskCard';
import Dropdown from './Dropdown';

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
  onBulkCreateTasks
}) => {
  const [mode, setMode] = useState('all');
  const [baseTitle, setBaseTitle] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');

  const groupedByDay = useMemo(() => {
    const map = {};
    for (const day of DAYS) {
      map[day] = [];
    }
    for (const task of tasks) {
      const key = DAYS.includes(task.day) ? task.day : 'Monday';
      map[key].push(task);
    }
    return map;
  }, [tasks]);

  const handleApplyPattern = async () => {
    if (!onBulkCreateTasks || !baseTitle.trim()) {
      return;
    }

    let targetDays = [];
    if (mode === 'all') {
      targetDays = DAYS;
    } else if (mode === 'weekdays') {
      targetDays = DAYS.slice(0, 5);
    } else if (mode === 'sixdays') {
      targetDays = DAYS.slice(0, 6);
    } else {
      // custom: user will manually schedule per day with tasks, so no bulk action
      return;
    }

    const payloads = targetDays.map((day) => ({
      title: `${baseTitle} (${day.slice(0, 3)})`,
      day,
      category: category.trim(),
      priority
    }));

    await onBulkCreateTasks(week._id, payloads);
    setBaseTitle('');
  };

  const modeDescription = {
    all: 'Same focus every day',
    weekdays: 'Mon–Fri same, weekend separate',
    sixdays: 'Mon–Sat same, Sun separate',
    custom: 'Plan each day individually'
  }[mode];

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left sm:px-4"
        onClick={() => onToggleWeek(week._id)}
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-xs font-semibold text-blue-700">
            W{week.weekNumber}
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Week {week.weekNumber}</p>
            <p className="text-xs text-slate-500">
              {tasks.filter((task) => task.completed).length}/{tasks.length} tasks
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-secondary px-2.5 py-1.5 text-xs"
            onClick={(event) => {
              event.stopPropagation();
              onAddTask(week._id);
            }}
          >
            Add Task
          </button>
          <span className="text-xs font-semibold text-slate-500">{open ? 'Hide' : 'Show'}</span>
        </div>
      </button>

      {open ? (
        <div className="border-t border-slate-200 px-3 py-3 sm:px-4">
          <div className="mb-4 rounded-xl border border-dashed border-slate-300 bg-white/60 p-3 sm:p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-700">
              <CalendarDays className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
              Weekly scheduling modes
            </div>
            <p className="mb-3 text-xs text-slate-500">{modeDescription}</p>

            <div className="mb-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name={`mode-${week._id}`}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={mode === 'all'}
                  onChange={() => setMode('all')}
                />
                <span>Same plan for all days</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name={`mode-${week._id}`}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={mode === 'weekdays'}
                  onChange={() => setMode('weekdays')}
                />
                <span>Mon–Fri same, weekend separate</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name={`mode-${week._id}`}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={mode === 'sixdays'}
                  onChange={() => setMode('sixdays')}
                />
                <span>Mon–Sat same, Sun separate</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name={`mode-${week._id}`}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={mode === 'custom'}
                  onChange={() => setMode('custom')}
                />
                <span>Custom planning for each day</span>
              </label>
            </div>

            {mode !== 'custom' ? (
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,120px)]">
                <input
                  className="input-base h-9 text-xs sm:text-sm"
                  placeholder="Base task title for this pattern"
                  value={baseTitle}
                  onChange={(event) => setBaseTitle(event.target.value)}
                />
                <input
                  className="input-base h-9 text-xs sm:text-sm"
                  placeholder="Category (optional)"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                />
                <Dropdown
                  value={priority}
                  onChange={(next) => setPriority(next)}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' }
                  ]}
                  placeholder="Priority"
                  className="w-full"
                  buttonClassName="h-9 text-xs sm:text-sm"
                />
              </div>
            ) : null}

            {mode !== 'custom' ? (
              <div className="mt-3 flex items-center justify-end">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  onClick={handleApplyPattern}
                >
                  <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
                  Apply pattern
                </button>
              </div>
            ) : null}
          </div>

          {tasks.length === 0 ? (
            <p className="text-sm text-slate-500">No tasks for this week.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {DAYS.map((day) => {
                const dayTasks = groupedByDay[day] || [];
                if (dayTasks.length === 0) {
                  return null;
                }
                return (
                  <div key={day} className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 text-[10px] text-slate-700">
                        {day.slice(0, 2)}
                      </span>
                      <span>{day}</span>
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

