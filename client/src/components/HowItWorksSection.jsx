import { BrandName } from './Logo';

const HIERARCHY = [
  {
    label: 'Goal',
    detail: 'Define the long-term outcome you want to achieve.'
  },
  {
    label: 'Month',
    detail: 'Split the goal into clear monthly milestones.'
  },
  {
    label: 'Week',
    detail: 'Convert milestones into weekly execution plans.'
  },
  {
    label: 'Day',
    detail: 'Choose a focused daily direction.'
  },
  {
    label: 'Tasks',
    detail: 'Finish concrete actions with visible progress.'
  }
];

const HowItWorksSection = () => {
  return (
    <section
      className="grid gap-6 text-center lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:text-left"
      aria-labelledby="how-it-works-heading"
    >
      <div className="mx-auto max-w-xl lg:mx-0" data-reveal="left">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">How <BrandName /> Works</p>
        <h2
          id="how-it-works-heading"
          className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl"
        >
          Plan with a clear hierarchy from vision to execution.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
          <BrandName /> is designed as a planning tree. You start with one goal, break it into months,
          convert each month into weekly focus, and finish daily tasks that move progress forward.
        </p>
      </div>

      <div className="surface-card p-4 md:p-5" data-reveal="right">
        <div className="space-y-2">
          {HIERARCHY.map((item, index) => (
            <div key={item.label}>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left">
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="mt-1 text-xs text-slate-600">{item.detail}</p>
              </div>
              {index < HIERARCHY.length - 1 ? (
                <div className="py-1 text-center text-xs font-semibold text-blue-500">v</div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
