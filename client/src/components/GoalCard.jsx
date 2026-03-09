const GoalCard = ({ title, category, progress = 0, tasksCompleted = 0, onClick, actions }) => {
  return (
    <article
      onClick={onClick}
      className={[
        'surface-card p-4 sm:p-5 transition duration-200',
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-18px_rgba(37,99,235,0.35)]' : ''
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
            {category || 'General'}
          </p>
          <h3 className="mt-3 text-base font-semibold leading-tight text-slate-900">{title}</h3>
        </div>
        <span className="text-xs font-medium text-slate-500">{tasksCompleted} tasks</span>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-slate-500">Progress</span>
          <span className="font-semibold text-slate-800">{progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
            style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
          />
        </div>
      </div>

      {actions ? <div className="mt-4 border-t border-slate-100 pt-3">{actions}</div> : null}
    </article>
  );
};

export default GoalCard;

