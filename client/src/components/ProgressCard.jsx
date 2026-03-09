const ProgressCard = ({ title, value, subtitle, tone = 'blue' }) => {
  const toneStyles = {
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    slate: 'bg-slate-100 text-slate-700'
  };

  return (
    <article className="surface-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
          {subtitle && <p className="mt-2 text-xs text-slate-500">{subtitle}</p>}
        </div>
        <span className={[
          'inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold',
          toneStyles[tone] || toneStyles.blue
        ].join(' ')}>
          {title.slice(0, 1)}
        </span>
      </div>
    </article>
  );
};

export default ProgressCard;

