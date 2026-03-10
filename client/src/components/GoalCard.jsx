import { Target, CheckCircle2 } from 'lucide-react';

const GoalCard = ({ title, category, progress = 0, tasksCompleted = 0, onClick, actions }) => {
  return (
    <article
      onClick={onClick}
      className={[
        'surface-card p-4 md:p-5 transition duration-200',
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-18px_rgba(37,99,235,0.35)]' : ''
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Target className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <p className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              {category || 'General'}
            </p>
            <h3 className="mt-2 text-base font-semibold leading-tight text-slate-900">{title}</h3>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          {tasksCompleted} tasks
        </span>
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
