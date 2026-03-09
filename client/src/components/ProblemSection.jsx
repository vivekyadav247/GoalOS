const ProblemSection = () => {
  return (
    <section className="surface-card p-5 sm:p-7" aria-labelledby="problem-heading">
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Problem</p>
      <h2
        id="problem-heading"
        className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
      >
        Most productivity tools manage tasks, not progress.
      </h2>
      <div className="mt-4 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
        <p>
          Most productivity apps only manage tasks. But real progress comes from managing goals.
        </p>
        <p>
          GoalOS turns your long-term goals into a structured system of months, weeks, and daily
          actions.
        </p>
      </div>
    </section>
  );
};

export default ProblemSection;
