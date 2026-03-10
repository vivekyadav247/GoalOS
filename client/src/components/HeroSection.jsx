import { SignInButton, SignUpButton } from '@clerk/react';

const previewTasks = ['Review sprint goals', 'Write 3 tasks', 'Complete deep work block'];

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
          GoalOS helps you transform big ambitions into structured daily work by organizing your
          goals into months, weeks, and daily tasks.
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
            Explore Features
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

      <div className="relative z-10 mt-10">
        <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-white/95 p-4 text-left text-slate-800 shadow-[0_18px_60px_-30px_rgba(15,23,42,0.55)] md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Dashboard Preview</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">Today&apos;s focus</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">Streak: 7</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">Tasks: 5</span>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
            <div className="space-y-2">
              {previewTasks.map((task) => (
                <div key={task} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" aria-hidden="true" />
                  <p className="text-sm font-medium text-slate-800">{task}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Weekly progress</p>
              <div className="mt-3 space-y-2">
                {['Goal clarity', 'Execution', 'Consistency'].map((label, index) => (
                  <div key={label}>
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                      <span>{label}</span>
                      <span>{70 + index * 10}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200">
                      <div className="h-2 rounded-full bg-blue-500" style={{ width: `${70 + index * 10}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
