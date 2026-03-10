const COLUMNS = 28;
const ROWS = 7;
const GAP_COLUMNS = 1;
const MONTH_GROUPS = [4, 4, 5, 5, 5, 5];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const EXPANDED_COLUMNS = MONTH_GROUPS.reduce((sum, size) => sum + size, 0)
  + GAP_COLUMNS * (MONTH_GROUPS.length - 1);

const levelClass = (value) => {
  if (value >= 4) return 'bg-blue-800';
  if (value === 3) return 'bg-blue-600';
  if (value === 2) return 'bg-blue-400';
  if (value === 1) return 'bg-blue-200';
  return 'bg-slate-200';
};

const previewCells = Array.from({ length: COLUMNS * ROWS }, (_, index) => {
  const col = Math.floor(index / ROWS);
  const row = index % ROWS;
  const wave = (col * 3 + row * 2) % 11;

  if (wave <= 2) return 0;
  if (wave <= 5) return 1;
  if (wave <= 7) return 2;
  if (wave <= 9) return 3;
  return 4;
});

const monthMarks = MONTH_GROUPS.map((size, index) => {
  const start = MONTH_GROUPS.slice(0, index).reduce((sum, value) => sum + value, 0)
    + GAP_COLUMNS * index;
  return { label: MONTH_LABELS[index], start, span: size };
});

const columnMap = [];
let dataColumn = 0;

MONTH_GROUPS.forEach((size, index) => {
  for (let i = 0; i < size; i += 1) {
    columnMap.push(dataColumn);
    dataColumn += 1;
  }

  if (index < MONTH_GROUPS.length - 1) {
    columnMap.push(null);
  }
});

const expandedCells = columnMap.flatMap((dataCol) =>
  Array.from({ length: ROWS }, (_, row) => {
    if (dataCol === null) {
      return null;
    }
    return previewCells[dataCol * ROWS + row];
  })
);

const PlannerPreview = () => {
  return (
    <section className="grid gap-6 text-center lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-10 lg:text-left">
      <div className="mx-auto max-w-xl lg:mx-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Task Heatmap</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          Visualize Your Consistency
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
          GoalOS includes a contribution-style productivity heatmap similar to GitHub or LeetCode.
          Each completed task fills a cell in a calendar grid. Over time you see consistency
          patterns and streaks.
        </p>
      </div>

      <div className="surface-card border-slate-200 bg-white/90 p-3 sm:p-4 md:p-5">
        <div className="space-y-1 text-xs text-slate-600 sm:text-sm">
          <p>🔥 Current streak: 5 days</p>
          <p>🔥 Best streak: 12 days</p>
          <p>🔥 Tasks this week: 7</p>
        </div>

        <div className="mt-4 overflow-hidden sm:overflow-x-auto">
          <div className="mx-auto flex w-full justify-center">
            <div className="w-max">
            <div
              style={{
                '--cell-size': 'clamp(6px, 1.8vw, 10px)',
                '--cell-gap': 'clamp(2px, 0.5vw, 3px)',
                display: 'grid',
                gridTemplateColumns: `repeat(${EXPANDED_COLUMNS}, var(--cell-size))`,
                gridTemplateRows: `repeat(${ROWS}, var(--cell-size))`,
                gridAutoFlow: 'column',
                gap: 'var(--cell-gap)'
              }}
            >
              {expandedCells.map((value, index) => (
                <div
                  key={index}
                  className={value === null ? 'rounded-[2px] bg-transparent' : `rounded-[2px] ${levelClass(value)}`}
                  style={{ width: 'var(--cell-size)', height: 'var(--cell-size)' }}
                  aria-hidden={value === null}
                />
              ))}
            </div>

            <div
              className="mt-2 grid text-[10px] text-slate-400 sm:text-[11px]"
              style={{
                gridTemplateColumns: `repeat(${EXPANDED_COLUMNS}, var(--cell-size))`,
                columnGap: 'var(--cell-gap)'
              }}
            >
              {monthMarks.map((month) => (
                <span
                  key={month.label}
                  className="text-center"
                  style={{ gridColumn: `${month.start + 1} / span ${month.span}` }}
                >
                  {month.label}
                </span>
              ))}
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlannerPreview;
