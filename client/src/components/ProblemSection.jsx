import { BrandName } from './Logo';

const ProblemSection = () => {
  return (
    <section className="surface-card p-5 sm:p-7" aria-labelledby="problem-heading">
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Problem</p>
      <h2
        id="problem-heading"
        className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl"
      >
        Goals fail when there is no daily structure.
      </h2>
      <div className="mt-4 grid gap-4 text-sm text-slate-600 md:grid-cols-2">
        <p>
          Many people set goals but struggle to stay consistent because the goal feels too big and
          unclear.
        </p>
        <p>
          Without a daily system, motivation fades. <BrandName /> solves this by turning long-term goals
          into small daily actions you can execute immediately.
        </p>
      </div>
    </section>
  );
};

export default ProblemSection;
