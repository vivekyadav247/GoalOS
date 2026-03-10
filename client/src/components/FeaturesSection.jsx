import { Target, CalendarDays, CheckSquare, ActivitySquare, LineChart } from 'lucide-react';

const FEATURES = [
  {
    icon: Target,
    title: 'Goal Planning',
    description: 'Create structured long-term goals with clear timelines.'
  },
  {
    icon: CalendarDays,
    title: 'Weekly Structure',
    description: 'Organize each goal into practical and trackable weekly focus.'
  },
  {
    icon: CheckSquare,
    title: 'Task Tracking',
    description: 'Track daily tasks with quick updates and completion visibility.'
  },
  {
    icon: ActivitySquare,
    title: 'Productivity Heatmap',
    description: 'Visualize your daily contribution pattern across the year.'
  },
  {
    icon: LineChart,
    title: 'Progress Analytics',
    description: 'Measure consistency, streaks, and execution momentum.'
  }
];

const FeaturesSection = () => {
  return (
    <section className="text-center" aria-labelledby="features-heading">
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Features</p>
      <h2 id="features-heading" className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
        Everything you need to run the GoalOS planning system.
      </h2>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <article
              key={feature.title}
              className="surface-card h-full border-slate-100/80 bg-white/90 p-4 text-left shadow-[0_14px_40px_-24px_rgba(15,23,42,0.3)]"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturesSection;
