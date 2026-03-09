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
  weekForms,
  openMonths,
  openWeeks,
  busyAction,
  busyTaskId,
  onToggleMonth,
  onToggleWeek,
  onChangeWeekForm,
  onCreateWeek,
  onAddTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onBulkCreateTasks
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
        const weekForm = weekForms[month._id] || { weekNumber: '', description: '' };

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
                  {monthStats.completed}/{monthStats.total} tasks completed • {monthStats.progress}%
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500">{monthOpen ? 'Hide' : 'Show'}</span>
            </button>

            {monthOpen ? (
              <div className="border-t border-slate-100 px-4 py-4 sm:px-5">
                <form
                  onSubmit={(event) => onCreateWeek(event, month._id)}
                  className="mb-4 grid gap-2 sm:grid-cols-[120px_1fr_auto]"
                >
                  <input
                    type="number"
                    min="1"
                    max="53"
                    className="input-base"
                    placeholder="Week #"
                    value={weekForm.weekNumber}
                    onChange={(event) =>
                      onChangeWeekForm(month._id, {
                        ...weekForm,
                        weekNumber: event.target.value
                      })
                    }
                  />
                  <input
                    className="input-base"
                    placeholder="Week focus"
                    value={weekForm.description}
                    onChange={(event) =>
                      onChangeWeekForm(month._id, {
                        ...weekForm,
                        description: event.target.value
                      })
                    }
                  />
                  <button className="btn-secondary" disabled={busyAction === `week-${month._id}`}>
                    {busyAction === `week-${month._id}` ? 'Saving...' : 'Add Week'}
                  </button>
                </form>

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
                        onBulkCreateTasks={onBulkCreateTasks}
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

