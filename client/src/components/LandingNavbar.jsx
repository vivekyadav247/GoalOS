import Logo from './Logo';
import { useState } from 'react';
import { SignUpButton } from '@clerk/react';
import { Menu, X } from 'lucide-react';

const LandingNavbar = ({ onFeaturesClick, onHowItWorksClick, onProductivityClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = (handler) => {
    if (handler) {
      handler();
    }
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 md:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3"
        >
          <Logo size="lg" />
        </button>

        <nav className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={() => handleNavClick(onFeaturesClick)}
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            Features
          </button>
          <button
            type="button"
            onClick={() => handleNavClick(onHowItWorksClick)}
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            How it Works
          </button>
          <button
            type="button"
            onClick={() => handleNavClick(onProductivityClick)}
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            Productivity
          </button>
          <SignUpButton mode="modal">
            <button type="button" className="btn-primary px-5 py-2.5">
              Start Planning
            </button>
          </SignUpButton>
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 md:hidden"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {menuOpen ? (
        <div className="border-t border-slate-200/70 bg-white/95 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4">
            <button
              type="button"
              onClick={() => handleNavClick(onFeaturesClick)}
              className="rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => handleNavClick(onHowItWorksClick)}
              className="rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              How it Works
            </button>
            <button
              type="button"
              onClick={() => handleNavClick(onProductivityClick)}
              className="rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Productivity
            </button>
            <SignUpButton mode="modal">
              <button type="button" className="btn-primary w-full px-5 py-2.5">
                Start Planning
              </button>
            </SignUpButton>
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default LandingNavbar;
