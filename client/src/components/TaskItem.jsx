const TaskItem = ({
  task,
  busy = false,
  onToggle,
  onEdit,
  onDelete
}) => {
  const completed = Boolean(task?.completed);

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition hover:border-slate-300">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          disabled={busy}
          className={[
            'flex h-5 w-5 shrink-0 items-center justify-center rounded border transition',
            completed
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-slate-300 bg-white text-transparent hover:border-slate-400',
            busy ? 'opacity-60' : ''
          ].join(' ')}
        >
          x
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
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <span>{task?.day || 'No day'}</span>
            <span>•</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5">{task?.category || 'General'}</span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            disabled={busy}
            className="rounded-lg px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-60"
          >
            Edit
          </button>
        ) : null}
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            className="rounded-lg px-2 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
          >
            Delete
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default TaskItem;

