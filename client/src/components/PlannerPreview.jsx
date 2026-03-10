const COLUMNS = 28;
const ROWS = 7;
const CELL_SIZE = 10;
const CELL_GAP = 3;

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

const monthMarks = [
  { label: 'Jan', col: 0 },
  { label: 'Feb', col: 5 },
  { label: 'Mar', col: 10 },
  { label: 'Apr', col: 15 },
  { label: 'May', col: 20 },
  { label: 'Jun', col: 24 }
];

const gridWidth = COLUMNS * CELL_SIZE + (COLUMNS - 1) * CELL_GAP;
const columnWidth = CELL_SIZE + CELL_GAP;

const PlannerPreview = () => {
  return (
    <section className="grid gap-6 text-center lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:text-left">
      <div className="mx-auto max-w-xl lg:mx-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Heatmap Preview</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          See consistency at a glance.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
          GoalOS dashboard includes a productivity heatmap so you can quickly understand daily
          execution, streak quality, and contribution patterns over time.
        </p>
      </div>

      <div className="surface-card border-slate-200 bg-white/90 p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
          <p className="font-semibold text-slate-900">186 tasks in preview period</p>
          <p>Max streak: 14</p>
        </div>

        <div className="mt-4 overflow-x-auto">
          <div className="min-w-max">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${COLUMNS}, ${CELL_SIZE}px)`,
                gridTemplateRows: `repeat(${ROWS}, ${CELL_SIZE}px)`,
                gridAutoFlow: 'column',
                gap: `${CELL_GAP}px`,
                width: `${gridWidth}px`,
                minWidth: `${gridWidth}px`
              }}
            >
              {previewCells.map((value, index) => (
                <div
                  key={index}
                  className={`h-[10px] w-[10px] rounded-[2px] ${levelClass(value)}`}
                />
              ))}
            </div>

            <div className="relative mt-2 h-5 text-[11px] text-slate-400" style={{ width: `${gridWidth}px` }}>
              {monthMarks.map((month) => (
                <span
                  key={month.label}
                  className="absolute top-0"
                  style={{ left: `${month.col * columnWidth}px` }}
                >
                  {month.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlannerPreview;
