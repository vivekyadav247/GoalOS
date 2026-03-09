const PREVIEW_TASKS = [
  { day: 'Mon', task: 'Learn React Hooks' },
  { day: 'Tue', task: 'Build API' },
  { day: 'Wed', task: 'Solve DSA' },
  { day: 'Thu', task: 'Work on Project' },
  { day: 'Fri', task: 'Revise Concepts' }
];

const PlannerPreview = () => {
  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Planner Preview</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          A practical weekly plan generated from your goal.
        </h2>
        <p className="mt-3 text-sm text-slate-600">
          This is how GoalOS keeps execution clear. Every day has one visible next action tied to
          your larger objective.
        </p>
      </div>

      <div className="surface-card overflow-hidden border-slate-200 bg-white/90">
        <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Goal</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">Become a Full Stack Developer</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">March</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
              Week: 10-16
            </span>
          </div>
        </div>

        <div className="space-y-2 px-4 py-4">
          {PREVIEW_TASKS.map((item) => (
            <div
              key={item.day}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
            >
              <div className="w-12 rounded-lg bg-slate-100 px-2 py-1 text-center text-xs font-semibold text-slate-700">
                {item.day}
              </div>
              <p className="text-sm font-medium text-slate-800">{item.task}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlannerPreview;
