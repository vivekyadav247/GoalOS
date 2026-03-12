import { Check, Circle, Pencil, Trash2, CalendarDays } from 'lucide-react';

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

const TaskItem = ({
  task,
  busy = false,
  onToggle,
  onEdit,
  onDelete
}) => {
  const completed = Boolean(task?.completed);
  const taskDate = task?.date ? normalizeDate(task.date) : null;
  const lockActions = completed;
  let isToday = false;
  let isPast = false;
  let isFuture = false;

  if (taskDate && !Number.isNaN(taskDate.getTime())) {
    const today = normalizeDate(new Date());

    if (today && taskDate < today) {
      isPast = true;
    } else if (today && taskDate > today) {
      isFuture = true;
    } else {
      isToday = true;
    }
  }

  const isMissed = isPast && !completed;
  const dateLabel = task?.date
    ? new Date(task.date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      })
    : 'No date';

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-2.5 shadow-none transition hover:border-slate-300 md:flex-row md:items-center md:justify-between md:gap-3 md:rounded-xl md:p-3 md:shadow-sm md:hover:shadow-md">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          disabled={busy || isPast || isFuture}
          className={[
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs transition md:h-8 md:w-8',
            completed
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-slate-300 bg-white text-slate-300 hover:border-slate-400 hover:text-slate-400',
            busy ? 'opacity-60' : ''
          ].join(' ')}
        >
          {completed ? <Check className="h-3 w-3" aria-hidden="true" /> : <Circle className="h-3 w-3" aria-hidden="true" />}
        </button>

        <div className="min-w-0">
          <p
            className={[
              'truncate text-sm font-medium',
              completed ? 'text-slate-400 line-through' : 'text-slate-800'
            ].join(' ')}
          >
            {task?.title}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 md:mt-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5">
              <CalendarDays className="h-3 w-3" aria-hidden="true" />
              {dateLabel}
            </span>
            {isMissed ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-rose-700">
                Missed
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 self-start md:self-auto">
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            disabled={busy || lockActions}
            title={lockActions ? 'Completed tasks cannot be edited.' : 'Edit task'}
            className={[
              'inline-flex min-h-8 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition md:min-h-9 md:px-3 md:py-2',
              lockActions
                ? 'text-slate-400'
                : 'text-slate-600 hover:bg-slate-100',
              'disabled:cursor-not-allowed disabled:opacity-60'
            ].join(' ')}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            Edit
          </button>
        ) : null}
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={busy || lockActions}
            title={lockActions ? 'Completed tasks cannot be deleted.' : 'Delete task'}
            className={[
              'inline-flex min-h-8 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition md:min-h-9 md:px-3 md:py-2',
              lockActions
                ? 'text-slate-400'
                : 'text-rose-600 hover:bg-rose-50',
              'disabled:cursor-not-allowed disabled:opacity-60'
            ].join(' ')}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Delete
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default TaskItem;
