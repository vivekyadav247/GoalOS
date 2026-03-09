const STEPS = ['Goal', 'Month', 'Week', 'Day', 'Tasks'];

const HowItWorksSection = () => {
  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center" aria-labelledby="how-it-works-heading">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">How GoalOS Works</p>
        <h2
          id="how-it-works-heading"
          className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
        >
          Goal to Month to Week to Day to Tasks
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Instead of random tasks, GoalOS builds a structured plan that guides your daily work.
        </p>
      </div>

      <div className="surface-card p-4 sm:p-5">
        <div className="space-y-2">
          {STEPS.map((step, index) => (
            <div key={step}>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">
                {step}
              </div>
              {index < STEPS.length - 1 ? (
                <div className="py-1 text-center text-xs text-slate-400">|</div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
