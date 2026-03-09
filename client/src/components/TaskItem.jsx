import { Check, Circle, Pencil, Trash2, CalendarDays } from 'lucide-react';

const TaskItem = ({
  task,
  busy = false,
  onToggle,
  onEdit,
  onDelete
}) => {
  const completed = Boolean(task?.completed);
  const dateLabel = task?.date
    ? new Date(task.date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      })
    : 'No date';

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          disabled={busy}
            className={[
              'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs transition',
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
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5">
              <CalendarDays className="h-3 w-3" aria-hidden="true" />
              {dateLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-60"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            Edit
          </button>
        ) : null}
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
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

