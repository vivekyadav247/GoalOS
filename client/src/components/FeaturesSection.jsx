import { Target, CalendarDays, CheckSquare, LineChart } from 'lucide-react';

const FEATURES = [
  {
    icon: Target,
    title: 'Goal Planning System',
    description: 'Break long-term goals into structured plans.'
  },
  {
    icon: CalendarDays,
    title: 'Calendar Based Weeks',
    description: 'Tasks automatically follow real calendar weeks.'
  },
  {
    icon: CheckSquare,
    title: 'Daily Task Focus',
    description: 'Always know what to work on today.'
  },
  {
    icon: LineChart,
    title: 'Progress Tracking',
    description: 'Track progress across weeks and months.'
  }
];

const FeaturesSection = () => {
  return (
    <section aria-labelledby="features-heading">
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Features</p>
      <h2 id="features-heading" className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        Everything you need to execute a real goal system.
      </h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <article
              key={feature.title}
              className="surface-card h-full border-slate-100/80 bg-white/90 p-4 shadow-[0_14px_40px_-24px_rgba(15,23,42,0.3)]"
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
