import { useEffect, useMemo, useState } from 'react';

const MODE_OPTIONS = [
  { value: 'GOAL', label: 'Overall goal' },
  { value: 'MONTH', label: 'Month' },
  { value: 'WEEK', label: 'Week' }
];

const PATTERNS = [
  { value: 'ALL_DAYS', label: 'Same for all days' },
  { value: 'WEEKDAY_WEEKEND', label: 'Mon-Fri same, weekend different' },
  { value: 'MON_SAT', label: 'Mon-Sat same, Sunday different' }
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const normalizeTask = (value) => (typeof value === 'string' ? value.trim() : '');

const buildWeekPlan = (pattern, config) => {
  const normalized = String(pattern || '').toUpperCase();

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

const formatLocalDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatRangeLabel = (startValue, endValue) => {
  const start = new Date(startValue);
  const end = new Date(endValue);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Unknown range';
  }
  const startLabel = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const endLabel = end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${startLabel} - ${endLabel}`;
};

const getWeekRange = (week) => {
  if (!week) {
    return { start: '', end: '' };
  }
  return {
    start: week.rangeStart || week.startDate || '',
    end: week.rangeEnd || week.endDate || ''
  };
};

const GoalTaskQuickAdd = ({ goal, months, weeksByMonth, onCreateTask, onApplyPattern, busy }) => {
  const [mode, setMode] = useState('GOAL');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [monthId, setMonthId] = useState('');
  const [weekId, setWeekId] = useState('');
  const [pattern, setPattern] = useState('ALL_DAYS');
  const [task, setTask] = useState('');
  const [weekdayTask, setWeekdayTask] = useState('');
  const [weekendTask, setWeekendTask] = useState('');
  const [sundayTask, setSundayTask] = useState('');
  const [formError, setFormError] = useState('');

  const monthOptions = useMemo(
    () =>
      (months || []).map((month, index) => ({
        value: month._id,
        label: `Month ${index + 1}: ${month.monthName}`
      })),
    [months]
  );

  const weeksList = useMemo(() => {
    const list = [];
    let sequence = 0;

    (months || []).forEach((month) => {
      const monthWeeks = (weeksByMonth && weeksByMonth[month._id]) || [];
      monthWeeks.forEach((week) => {
        const range = getWeekRange(week);
        if (!range.start || !range.end) {
          return;
        }
        sequence += 1;
        list.push({
          ...week,
          monthId: month._id,
          sequence,
          label: `Week ${sequence}: ${formatRangeLabel(range.start, range.end)}`
        });
      });
    });

    return list;
  }, [months, weeksByMonth]);

  const weekOptions = useMemo(
    () => weeksList.map((week) => ({ value: week._id, label: week.label })),
    [weeksList]
  );

  const weeksInSelectedMonth = useMemo(() => {
    if (!monthId || !weeksByMonth) {
      return [];
    }
    return weeksByMonth[monthId] || [];
  }, [monthId, weeksByMonth]);

  const minGoalDate = useMemo(() => {
    const todayKey = formatLocalDate(new Date());
    const startKey = goal?.startDate ? formatLocalDate(goal.startDate) : '';
    if (startKey && startKey > todayKey) {
      return startKey;
    }
    return todayKey;
  }, [goal]);

  const maxGoalDate = useMemo(
    () => (goal?.endDate ? formatLocalDate(goal.endDate) : ''),
    [goal]
  );

  const hasTimeline = monthOptions.length > 0 && weekOptions.length > 0;

  useEffect(() => {
    if (mode !== 'GOAL') {
      return;
    }

    if (date) {
      return;
    }

    const today = new Date();
    const todayKey = formatLocalDate(today);
    const startKey = goal?.startDate ? formatLocalDate(goal.startDate) : '';

    if (startKey && todayKey < startKey) {
      setDate(startKey);
    } else {
      setDate(todayKey);
    }
  }, [mode, date, goal]);

  useEffect(() => {
    if (mode === 'MONTH' && monthOptions.length > 0) {
      if (!monthOptions.some((option) => option.value === monthId)) {
        setMonthId(monthOptions[0].value);
      }
    }
  }, [mode, monthOptions, monthId]);

  useEffect(() => {
    if (mode === 'WEEK' && weekOptions.length > 0) {
      if (!weekOptions.some((option) => option.value === weekId)) {
        setWeekId(weekOptions[0].value);
      }
    }
  }, [mode, weekOptions, weekId]);

  const planPreview = useMemo(
    () =>
      buildWeekPlan(pattern, {
        task,
        weekdayTask,
        weekendTask,
        sundayTask
      }),
    [pattern, task, weekdayTask, weekendTask, sundayTask]
  );

  const hasPatternTasks = useMemo(
    () => Object.values(planPreview).some((value) => Boolean(value)),
    [planPreview]
  );

  const modeButtonClass = (active) =>
    [
      'rounded-xl border px-3 py-2 text-xs font-semibold transition',
      active
        ? 'border-blue-600 bg-blue-600 text-white'
        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
    ].join(' ');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (mode === 'GOAL') {
      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        setFormError('Add a task title first.');
        return;
      }

      if (!date) {
        setFormError('Choose a date for the task.');
        return;
      }

      const todayKey = formatLocalDate(new Date());
      if (date < todayKey) {
        setFormError('Tasks cannot be created for past dates.');
        return;
      }

      const startKey = goal?.startDate ? formatLocalDate(goal.startDate) : '';
      const endKey = goal?.endDate ? formatLocalDate(goal.endDate) : '';

      if (startKey && date < startKey) {
        setFormError(`Date must be on or after ${startKey}.`);
        return;
      }

      if (endKey && date > endKey) {
        setFormError(`Date must be on or before ${endKey}.`);
        return;
      }

      const ok = await onCreateTask?.({ title: trimmedTitle, date });
      if (ok) {
        setTitle('');
      }
      return;
    }

    if (!hasTimeline) {
      setFormError('Add a start and end date to this goal to plan by month or week.');
      return;
    }

    if (!hasPatternTasks) {
      setFormError('Add at least one task in the pattern.');
      return;
    }

    if (mode === 'MONTH') {
      if (!monthId) {
        setFormError('Select a month to apply the pattern.');
        return;
      }
    }

    if (mode === 'WEEK') {
      if (!weekId) {
        setFormError('Select a week to apply the pattern.');
        return;
      }
    }

    const ok = await onApplyPattern?.({
      mode,
      monthId,
      weekId,
      payload: {
        pattern,
        task: normalizeTask(task),
        weekdayTask: normalizeTask(weekdayTask),
        weekendTask: normalizeTask(weekendTask),
        sundayTask: normalizeTask(sundayTask)
      }
    });

    if (ok) {
      setTask('');
      setWeekdayTask('');
      setWeekendTask('');
      setSundayTask('');
    }
  };

  const actionLabel =
    mode === 'GOAL'
      ? 'Add Task'
      : mode === 'MONTH'
        ? 'Apply to Month'
        : 'Apply to Week';

  return (
    <section className="surface-card p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Quick add tasks</h3>
          <p className="mt-1 text-xs text-slate-500">
            Choose if you want to add a single task or apply a weekly pattern.
          </p>
        </div>
        {goal?.startDate && goal?.endDate ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Timeline: {formatLocalDate(goal.startDate)} to {formatLocalDate(goal.endDate)}
          </div>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {MODE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={modeButtonClass(mode === option.value)}
              onClick={() => {
                setMode(option.value);
                setFormError('');
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            {mode === 'GOAL' ? (
              <p className="text-xs text-slate-500">
                Add one task inside this goal timeline.
              </p>
            ) : null}

            {mode === 'MONTH' ? (
              <label className="text-xs font-semibold text-slate-600">
                Month ({monthOptions.length})
                <select
                  className="input-base mt-1"
                  value={monthId}
                  onChange={(event) => setMonthId(event.target.value)}
                  disabled={!hasTimeline}
                >
                  {monthOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="mt-1 block text-[11px] text-slate-500">
                  Weeks in this month: {weeksInSelectedMonth.length}
                </span>
              </label>
            ) : null}

            {mode === 'WEEK' ? (
              <label className="text-xs font-semibold text-slate-600">
                Week ({weekOptions.length})
                <select
                  className="input-base mt-1"
                  value={weekId}
                  onChange={(event) => setWeekId(event.target.value)}
                  disabled={!hasTimeline}
                >
                  {weekOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {!hasTimeline && mode !== 'GOAL' ? (
              <p className="text-xs text-amber-600">
                Add a start and end date to this goal to unlock month/week planning.
              </p>
            ) : null}
          </div>

          <div className="space-y-3">
            {mode === 'GOAL' ? (
              <>
                <label className="text-xs font-semibold text-slate-600">
                  Task title
                  <input
                    className="input-base mt-1"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Task title"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-600">
                  Date
                  <input
                    className="input-base mt-1"
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    min={minGoalDate}
                    max={maxGoalDate || undefined}
                  />
                </label>
              </>
            ) : (
              <>
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
                      value={task}
                      onChange={(event) => setTask(event.target.value)}
                      placeholder="e.g. DSA practice"
                    />
                  </label>
                ) : null}

                {pattern === 'WEEKDAY_WEEKEND' ? (
                  <>
                    <label className="text-xs font-semibold text-slate-600">
                      Weekday task
                      <input
                        className="input-base mt-1"
                        value={weekdayTask}
                        onChange={(event) => setWeekdayTask(event.target.value)}
                        placeholder="Mon-Fri task"
                      />
                    </label>
                    <label className="text-xs font-semibold text-slate-600">
                      Weekend task
                      <input
                        className="input-base mt-1"
                        value={weekendTask}
                        onChange={(event) => setWeekendTask(event.target.value)}
                        placeholder="Sat-Sun task"
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
                        value={task}
                        onChange={(event) => setTask(event.target.value)}
                        placeholder="Mon-Sat task"
                      />
                    </label>
                    <label className="text-xs font-semibold text-slate-600">
                      Sunday task
                      <input
                        className="input-base mt-1"
                        value={sundayTask}
                        onChange={(event) => setSundayTask(event.target.value)}
                        placeholder="Sunday task"
                      />
                    </label>
                  </>
                ) : null}
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {formError ? <p className="text-xs text-rose-600">{formError}</p> : <span />}
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? 'Saving...' : actionLabel}
          </button>
        </div>
      </form>
    </section>
  );
};

export default GoalTaskQuickAdd;
