import { SignInButton, SignUpButton } from '@clerk/react';

const HeroSection = ({ onViewFeatures }) => {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 px-6 py-12 text-center shadow-[0_24px_80px_-40px_rgba(15,23,42,0.85)] md:px-10 md:py-16">
      <div className="animate-orb pointer-events-none absolute -left-20 top-0 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="animate-orb-delayed pointer-events-none absolute -right-8 bottom-0 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />

      <div className="animate-fade-up relative z-10 mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Turn Your Goals Into Daily Action
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg">
          GoalOS helps you break long-term goals into months, weeks and daily tasks.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 md:flex-row">
          <SignUpButton mode="modal">
            <button
              type="button"
              className="btn-primary w-full rounded-2xl bg-blue-500 px-8 py-3.5 text-sm font-semibold shadow-lg shadow-blue-500/40 hover:bg-blue-600 md:w-auto"
            >
              Start Planning
            </button>
          </SignUpButton>

          <button
            type="button"
            onClick={onViewFeatures}
            className="btn-secondary w-full rounded-2xl border-slate-300 bg-white/95 px-8 py-3.5 text-sm font-semibold md:w-auto"
          >
            View Features
          </button>
        </div>

        <div className="mt-4 text-sm text-slate-300">
          Already have an account?{' '}
          <SignInButton mode="modal">
            <button type="button" className="font-semibold text-sky-300 hover:text-sky-200">
              Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
