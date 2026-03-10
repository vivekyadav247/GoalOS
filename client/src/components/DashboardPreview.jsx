import { BrandName } from './Logo';

const metricItems = [
  { label: 'Goals', value: '4' },
  { label: 'Tasks Today', value: '6' },
  { label: 'Completed', value: '18' }
];

const previewTasks = [
  'Review monthly goals',
  'Plan weekly focus',
  'Complete deep work session'
];

const DashboardPreview = () => {
  return (
    <section className="grid gap-6 text-center lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:text-left">
      <div className="mx-auto max-w-xl lg:mx-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Dashboard Preview</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          Your daily system at a glance.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
          The dashboard shows your daily tasks, goal progress, heatmap consistency, and completion
          tracking in one view so you always know what to focus on next.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          <li>Daily tasks and completion check-ins</li>
          <li>Goal progress across weeks and months</li>
          <li>Heatmap productivity and streak tracking</li>
          <li>Progress monitoring across your system</li>
        </ul>
      </div>

      <div className="surface-card border-slate-200 bg-white/90 p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Today</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              <BrandName /> Dashboard
            </p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Streak 8</span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {metricItems.map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-3 text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          {previewTasks.map((task) => (
            <div key={task} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" aria-hidden="true" />
              <p className="text-sm font-medium text-slate-800">{task}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
