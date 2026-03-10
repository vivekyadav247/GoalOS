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
    <article className="surface-card p-3 text-center md:p-5 md:text-left">
      <div className="flex flex-col items-center justify-between gap-2 md:flex-row md:items-start md:gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 md:text-xs">{title}</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 md:mt-2 md:text-2xl">{value}</p>
          {subtitle && <p className="mt-1 text-[10px] text-slate-500 md:mt-2 md:text-xs">{subtitle}</p>}
        </div>
        <span
          className={[
            'inline-flex h-7 w-7 items-center justify-center rounded-lg md:h-8 md:w-8',
            toneStyles[tone] || toneStyles.blue
          ].join(' ')}
        >
          {(() => {
            const Icon = toneIconMap[tone] || BarChart2;
            return <Icon className="h-4 w-4" aria-hidden="true" />;
          })()}
        </span>
      </div>
    </article>
  );
};

export default ProgressCard;
