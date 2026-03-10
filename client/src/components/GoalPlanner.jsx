import WeekPlanner from './WeekPlanner';

const computeStats = (tasks = []) => {
  const completed = tasks.filter((task) => task.completed).length;
  const total = tasks.length;
  return {
    completed,
    total,
    progress: total ? Math.round((completed / total) * 100) : 0
  };
};

const GoalPlanner = ({
  months,
  weeksByMonth,
  tasksByWeek,
  openMonths,
  openWeeks,
  busyTaskId,
  onToggleMonth,
  onToggleWeek,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  todayWeekId,
  onWeekRef
}) => {
  if (!months || months.length === 0) {
    return <div className="surface-card p-6 text-sm text-slate-500">No monthly plans yet.</div>;
  }

  return (
    <>
      {months.map((month) => {
        const monthWeeks = weeksByMonth[month._id] || [];
        const monthTasks = monthWeeks.flatMap((week) => tasksByWeek[week._id] || []);
        const monthStats = computeStats(monthTasks);
        const monthOpen = Boolean(openMonths[month._id]);

        return (
          <article key={month._id} className="surface-card overflow-hidden">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-slate-50 sm:px-6 sm:py-5"
              onClick={() => onToggleMonth(month._id)}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold text-slate-900 sm:text-lg">{month.monthName}</p>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    {monthWeeks.length} weeks
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {monthStats.completed}/{monthStats.total} tasks completed
                  <span className="ml-2 inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                    {monthStats.progress}%
                  </span>
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500">{monthOpen ? 'Hide' : 'Show'}</span>
            </button>

            {monthOpen ? (
              <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-4 sm:px-6 sm:py-5">
                <div className="space-y-3">
                  {monthWeeks.length === 0 ? (
                    <p className="text-sm text-slate-500">No week plans yet.</p>
                  ) : (
                    monthWeeks.map((week) => (
                      <WeekPlanner
                        key={week._id}
                        week={week}
                        tasks={tasksByWeek[week._id] || []}
                        open={Boolean(openWeeks[week._id])}
                        busyTaskId={busyTaskId}
                        onToggleWeek={onToggleWeek}
                        onToggleTask={onToggleTask}
                        onEditTask={onEditTask}
                        onDeleteTask={onDeleteTask}
                        highlightToday={todayWeekId === week._id}
                        containerRef={(node) => onWeekRef?.(week._id, node)}
                      />
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </article>
        );
      })}
    </>
  );
};

export default GoalPlanner;
