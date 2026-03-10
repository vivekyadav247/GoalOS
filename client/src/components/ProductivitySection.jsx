import { BrandName } from './Logo';

const ProductivitySection = () => {
  return (
    <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Built for deep work</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Turn long-term goals into structured daily actions.
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Most planners stop at tasks. <BrandName /> forces each task to live on a date inside a clear hierarchy:
          a goal is broken into months, then weeks, then days. The result: you always know what today is for.
        </p>

        <ul className="mt-4 space-y-3 text-sm text-slate-700">
          <li className="flex gap-3">
            <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-semibold text-emerald-700">
              1
            </span>
            <div>
              <p className="font-medium text-slate-900">Start with the outcome.</p>
              <p className="text-sm text-slate-600">
                Define a clear goal with a date range instead of vague &ldquo;Someday&rdquo; projects.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-[11px] font-semibold text-blue-700">
              2
            </span>
            <div>
              <p className="font-medium text-slate-900">Shape each month and week.</p>
              <p className="text-sm text-slate-600">
                Translate the outcome into monthly themes and weekly priorities that keep the goal moving.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-800">
              3
            </span>
            <div>
              <p className="font-medium text-slate-900">Give every task a home.</p>
              <p className="text-sm text-slate-600">
                Assign tasks to specific days so today&apos;s view stays clean, realistic, and focused.
              </p>
            </div>
          </li>
        </ul>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.6)] backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Productivity snapshot</p>
            <p className="mt-1 text-xs text-slate-500">
              Your execution pattern over the last few weeks.
            </p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            78% completion
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="space-y-3 rounded-2xl bg-slate-50/90 p-3">
            <div className="flex items-center justify-between text-xs">
              <p className="font-semibold text-slate-800">Weekly rhythm</p>
              <span className="text-slate-500">Last 4 weeks</span>
            </div>
            <div className="flex items-end justify-between gap-1 pt-1">
              {[42, 68, 81, 76].map((value, index) => (
                <div key={String(value) + index} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex h-20 w-full items-end rounded-full bg-slate-100">
                    <div
                      className="w-full rounded-full bg-gradient-to-t from-blue-500 to-cyan-400 transition-all duration-500"
                      style={{ height: `${value}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">W{index + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-2xl bg-slate-50/90 p-3">
            <div className="flex items-center justify-between text-xs">
              <p className="font-semibold text-slate-800">Today&apos;s focus</p>
              <span className="text-slate-500">3 of 4 tasks</span>
            </div>
            <ul className="mt-1 space-y-1.5 text-[11px] text-slate-700">
              <li className="flex items-center justify-between gap-2">
                <span className="truncate">Ship planner auto-scroll</span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                  Done
                </span>
              </li>
              <li className="flex items-center justify-between gap-2">
                <span className="truncate">Draft landing page hero copy</span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                  Done
                </span>
              </li>
              <li className="flex items-center justify-between gap-2">
                <span className="truncate">Review analytics trends</span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                  In progress
                </span>
              </li>
              <li className="flex items-center justify-between gap-2 opacity-60">
                <span className="truncate">Capture next week&apos;s priorities</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                  Later
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductivitySection;
