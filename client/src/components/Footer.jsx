import { Instagram, Linkedin, Github } from 'lucide-react';
import { BrandName } from './Logo';

const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t border-slate-900/10 bg-slate-950 text-slate-200">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.08),transparent_55%)]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-10 text-center md:grid-cols-3 md:text-left md:px-6 lg:px-8">
        <div className="mx-auto md:mx-0" data-reveal style={{ '--reveal-delay': '0s' }}>
          <BrandName className="text-base font-semibold text-white" accentClassName="text-sky-400" />
          <p className="mt-2 text-sm text-slate-300">Goal planning system for daily execution.</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 md:justify-start">
            <a href="#" className="transition hover:text-white">
              Contact
            </a>
            <a href="#" className="transition hover:text-white">
              Privacy
            </a>
          </div>
        </div>

        <div className="mx-auto md:mx-0" data-reveal style={{ '--reveal-delay': '0.08s' }}>
          <p className="text-sm font-semibold text-white">Developer</p>
          <p className="mt-2 text-sm text-slate-300">Vivek Yadav</p>
          <p className="mt-3 text-xs text-slate-400">Built for focus, clarity, and daily momentum.</p>
        </div>

        <div className="mx-auto md:mx-0" data-reveal style={{ '--reveal-delay': '0.16s' }}>
          <p className="text-sm font-semibold text-white">Connect</p>
          <ul className="mt-2 space-y-2 text-sm text-slate-300">
            <li>
              <a
                href="https://www.instagram.com/vivekk.ydv_"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 transition hover:text-white"
              >
                <Instagram className="h-4 w-4 text-sky-300" />
                Instagram
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/vivek-07x/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 transition hover:text-white"
              >
                <Linkedin className="h-4 w-4 text-sky-300" />
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href="https://github.com/vivekyadav247"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 transition hover:text-white"
              >
                <Github className="h-4 w-4 text-sky-300" />
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-slate-400 md:flex-row md:px-6 lg:px-8">
          <span>
            © {new Date().getFullYear()} <BrandName className="text-slate-200" accentClassName="text-sky-400" />
          </span>
          <span>Small steps. Consistent progress.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
