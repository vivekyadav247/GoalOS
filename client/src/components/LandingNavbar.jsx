import { SignUpButton } from '@clerk/react';

const LandingNavbar = ({ onFeaturesClick, onHowItWorksClick }) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white">
            GO
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-900">GoalOS</p>
            <p className="text-xs text-slate-500">Goal based productivity planner</p>
          </div>
        </button>

        <nav className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onFeaturesClick}
            className="hidden text-sm font-medium text-slate-600 transition hover:text-slate-900 sm:inline-flex"
          >
            View Features
          </button>
          <button
            type="button"
            onClick={onHowItWorksClick}
            className="hidden text-sm font-medium text-slate-600 transition hover:text-slate-900 sm:inline-flex"
          >
            How it Works
          </button>
          <a
            href="https://github.com/vivekyadav247"
            target="_blank"
            rel="noreferrer"
            className="hidden text-sm font-medium text-slate-600 transition hover:text-slate-900 sm:inline-flex"
          >
            GitHub
          </a>
          <SignUpButton mode="modal">
            <button type="button" className="btn-primary px-5 py-2.5">
              Start Planning
            </button>
          </SignUpButton>
        </nav>
      </div>
    </header>
  );
};

export default LandingNavbar;
