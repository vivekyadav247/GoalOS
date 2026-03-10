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
  onAddTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onApplyPattern,
  patternBusyId,
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
              className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:px-5"
              onClick={() => onToggleMonth(month._id)}
            >
              <div>
                <p className="text-base font-semibold text-slate-900">{month.monthName}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {monthStats.completed}/{monthStats.total} tasks completed - {monthStats.progress}%
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500">{monthOpen ? 'Hide' : 'Show'}</span>
            </button>

            {monthOpen ? (
              <div className="border-t border-slate-100 px-4 py-4 sm:px-5">
                <div className="space-y-2">
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
                        onAddTask={onAddTask}
                        onToggleTask={onToggleTask}
                        onEditTask={onEditTask}
                        onDeleteTask={onDeleteTask}
                        onApplyPattern={onApplyPattern}
                        patternBusy={patternBusyId === week._id}
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
