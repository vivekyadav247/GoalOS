const ProductivityPhilosophy = () => {
  return (
    <section className="surface-card p-5 md:p-7" aria-labelledby="philosophy-heading">
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Productivity Philosophy</p>
      <h2 id="philosophy-heading" className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
        Consistency beats intensity.
      </h2>
      <div className="mt-4 grid gap-4 text-sm text-slate-600 md:grid-cols-2">
        <p>
          GoalOS focuses on consistent daily progress instead of short bursts. Small actions every day
          compound into visible outcomes over time.
        </p>
        <p>
          The system removes decision fatigue by making the next task obvious, so you can focus on
          execution rather than constantly re-planning.
        </p>
      </div>
    </section>
  );
};

export default ProductivityPhilosophy;
