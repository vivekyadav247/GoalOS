import { SignUpButton } from '@clerk/react';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 px-6 py-10 text-white shadow-[0_22px_70px_-32px_rgba(37,99,235,0.85)] md:px-10"
      data-reveal="pop"
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_0%_0%,rgba(255,255,255,0.35),transparent_55%)]" />
      <div className="relative z-10 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Start building your productivity system today.
          </h2>
        </div>

        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
          <SignUpButton mode="modal">
            <button
              type="button"
              className="btn-primary w-full rounded-2xl border border-white/20 bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-lg shadow-blue-900/30 hover:bg-slate-50 md:w-auto"
            >
              Start Planning
            </button>
          </SignUpButton>
          <Link
            to="/dashboard"
            className="btn-secondary w-full rounded-2xl border-white/40 bg-transparent px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 md:w-auto"
          >
            Open Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
