import { Instagram, Linkedin, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-200/80 bg-white/90">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
        <div>
          <p className="text-base font-semibold text-slate-900">GoalOS</p>
          <p className="mt-2 text-sm text-slate-600">Goal based productivity planner</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">Developer</p>
          <p className="mt-2 text-sm text-slate-600">Built by Vivek Yadav</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">Connect</p>
          <ul className="mt-2 space-y-2 text-sm text-slate-600">
            <li>
              <a
                href="https://www.instagram.com/vivekk.ydv_"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-blue-700"
              >
                <Instagram className="h-4 w-4" />
                Instagram
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/vivek-07x/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-blue-700"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href="https://github.com/vivekyadav247"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-blue-700"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
