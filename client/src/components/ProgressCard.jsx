import { BarChart2, Target, CheckCircle2, CalendarDays } from 'lucide-react';

const toneIconMap = {
  blue: BarChart2,
  emerald: CheckCircle2,
  amber: CalendarDays,
  slate: Target
};

const ProgressCard = ({ title, value, subtitle, tone = 'blue' }) => {
  const toneStyles = {
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    slate: 'bg-slate-100 text-slate-700'
  };

  return (
    <article className="surface-card p-3 md:p-5">
      <div className="flex items-center gap-3 md:items-start md:justify-between">
        <span
          className={[
            'inline-flex h-8 w-8 items-center justify-center rounded-lg',
            toneStyles[tone] || toneStyles.blue,
            'order-1 md:order-2'
          ].join(' ')}
        >
          {(() => {
            const Icon = toneIconMap[tone] || BarChart2;
            return <Icon className="h-4 w-4" aria-hidden="true" />;
          })()}
        </span>
        <div className="order-2 min-w-0 md:order-1">
          <p className="hidden text-xs font-semibold uppercase tracking-wide text-slate-500 md:block">{title}</p>
          <p className="text-lg font-semibold text-slate-900 md:mt-2 md:text-2xl">{value}</p>
          {subtitle ? (
            <p className="mt-1 hidden text-xs text-slate-500 md:block">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
};

export default ProgressCard;
