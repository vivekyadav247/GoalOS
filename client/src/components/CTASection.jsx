import { SignUpButton } from '@clerk/react';

const CTASection = () => {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 px-6 py-10 text-white shadow-[0_22px_70px_-32px_rgba(37,99,235,0.85)] sm:px-10">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_0%_0%,rgba(255,255,255,0.35),transparent_55%)]" />
      <div className="relative z-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Start building your goal system today.
          </h2>
        </div>

        <SignUpButton mode="modal">
          <button
            type="button"
            className="btn-primary rounded-2xl border border-white/20 bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-lg shadow-blue-900/30 hover:bg-slate-50"
          >
            Create Account
          </button>
        </SignUpButton>
      </div>
    </section>
  );
};

export default CTASection;
