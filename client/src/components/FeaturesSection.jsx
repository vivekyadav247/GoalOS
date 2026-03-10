import { BrandName } from './Logo';
import { Target, CalendarDays, CheckSquare, ActivitySquare, LineChart, CalendarRange } from 'lucide-react';

const FEATURES = [
  {
    icon: Target,
    title: 'Goal Planning',
    description: 'Define long-term outcomes and keep every task aligned.'
  },
  {
    icon: CalendarRange,
    title: 'Automated Monthly Planning',
    description: 'Break large goals into achievable monthly milestones.'
  },
  {
    icon: CalendarDays,
    title: 'Weekly Task Breakdown',
    description: 'Translate plans into weekly focus so nothing is missed.'
  },
  {
    icon: CheckSquare,
    title: 'Daily Task Tracking',
    description: "See today's priorities and keep execution consistent."
  },
  {
    icon: LineChart,
    title: 'Progress Monitoring',
    description: 'Track completion trends across goals, weeks, and months.'
  },
  {
    icon: ActivitySquare,
    title: 'Consistency Tracking',
    description: 'Use the heatmap to monitor streaks and daily rhythm.'
  }
];

const FeaturesSection = () => {
  return (
    <section className="text-center" aria-labelledby="features-heading">
      <div data-reveal>
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Features</p>
        <h2 id="features-heading" className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          Everything you need to run the <BrandName /> planning system.
        </h2>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <article
              key={feature.title}
              data-reveal="scale"
              style={{ '--reveal-delay': `${index * 0.08}s` }}
              className="surface-card h-full border-slate-100/80 bg-white/90 p-4 text-left shadow-[0_14px_40px_-24px_rgba(15,23,42,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-26px_rgba(15,23,42,0.35)]"
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
