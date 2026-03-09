import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CreateTaskModal from '../components/CreateTaskModal';
import GoalPlanner from '../components/GoalPlanner';
import { getApiErrorMessage, goalApi, monthApi, taskApi, weekApi } from '../services/api';
import useGoalHierarchy from '../hooks/useGoalHierarchy';

const GoalDetail = () => {
  const navigate = useNavigate();
  const { goalId } = useParams();
  const {
    goal,
    months,
    weeksByMonth,
    tasksByWeek,
    tasks,
    loading,
    error,
    refresh
  } = useGoalHierarchy(goalId);

  const [monthForm, setMonthForm] = useState({ monthName: '', description: '' });
  const [weekForms, setWeekForms] = useState({});
  const [openMonths, setOpenMonths] = useState({});
  const [openWeeks, setOpenWeeks] = useState({});

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalLoading, setTaskModalLoading] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedWeekForTask, setSelectedWeekForTask] = useState('');
  const [busyTaskId, setBusyTaskId] = useState('');
  const [busyAction, setBusyAction] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (months.length === 0) {
      return;
    }

    setOpenMonths((prev) => {
      if (Object.keys(prev).length > 0) {
        return prev;
      }
      return { [months[0]._id]: true };
    });
  }, [months]);

  const allWeeks = useMemo(
    () =>
      months.flatMap((month) =>
        (weeksByMonth[month._id] || []).map((week) => ({
          ...week,
          monthName: month.monthName
        }))
      ),
    [months, weeksByMonth]
  );

  const weekOptions = useMemo(
    () =>
      allWeeks.map((week) => ({
        value: week._id,
        label: `${week.monthName} • Week ${week.weekNumber}`
      })),
    [allWeeks]
  );

  const goalStats = useMemo(() => {
    const completed = tasks.filter((task) => task.completed).length;
    const total = tasks.length;
    return {
      completed,
      total,
      progress: total ? Math.round((completed / total) * 100) : 0
    };
  }, [tasks]);

  const toggleMonth = (monthId) => {
    setOpenMonths((prev) => ({ ...prev, [monthId]: !prev[monthId] }));
  };

  const toggleWeek = (weekId) => {
    setOpenWeeks((prev) => ({ ...prev, [weekId]: !prev[weekId] }));
  };

  const handleCreateMonth = async (event) => {
    event.preventDefault();
    const monthName = monthForm.monthName.trim();
    if (!monthName) {
      setActionError('Month name is required');
      return;
    }

    setBusyAction('month');
    setActionError('');

    try {
      await monthApi.create({
        goalId,
        monthName,
        description: monthForm.description.trim()
      });
      setMonthForm({ monthName: '', description: '' });
      await refresh();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Unable to create month plan'));
    } finally {
      setBusyAction('');
    }
  };

  const handleCreateWeek = async (event, monthId) => {
    event.preventDefault();
    const form = weekForms[monthId] || { weekNumber: '', description: '' };
    const weekNumber = Number(form.weekNumber);

    if (!Number.isInteger(weekNumber) || weekNumber < 1 || weekNumber > 53) {
      setActionError('Week number must be between 1 and 53');
      return;
    }

    setBusyAction(`week-${monthId}`);
    setActionError('');

    try {
      await weekApi.create({
        monthId,
        weekNumber,
        description: (form.description || '').trim()
      });

      setWeekForms((prev) => ({
        ...prev,
        [monthId]: { weekNumber: '', description: '' }
      }));
      setOpenMonths((prev) => ({ ...prev, [monthId]: true }));
      await refresh();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Unable to create week plan'));
    } finally {
      setBusyAction('');
    }
  };

  const handleSaveTask = async (payload) => {
    if (!payload.weekId) {
      setActionError('Select a week before saving a task');
      return;
    }

    setTaskModalLoading(true);
    setActionError('');

    try {
      if (editingTask?._id) {
        await taskApi.update(editingTask._id, payload);
      } else {
        await taskApi.create(payload);
      }

      setTaskModalOpen(false);
      setEditingTask(null);
      setSelectedWeekForTask('');
      await refresh();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Unable to save task'));
    } finally {
      setTaskModalLoading(false);
    }
  };

  const handleToggleTask = async (task) => {
    setBusyTaskId(task._id);
    setActionError('');

    try {
      await taskApi.toggleComplete(task._id, !task.completed);
      await refresh();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Unable to update task status'));
    } finally {
      setBusyTaskId('');
    }
  };

  const handleDeleteTask = async (taskId) => {
    const confirmed = window.confirm('Delete this task?');
    if (!confirmed) {
      return;
    }

    setBusyTaskId(taskId);
    setActionError('');

    try {
      await taskApi.remove(taskId);
      await refresh();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Unable to delete task'));
    } finally {
      setBusyTaskId('');
    }
  };

  const handleBulkCreateTasks = async (weekId, payloads) => {
    if (!Array.isArray(payloads) || payloads.length === 0) {
      return;
    }

    setBusyAction(`bulk-week-${weekId}`);
    setActionError('');

    try {
      // Sequential to keep server load predictable and ordering stable.
      // eslint-disable-next-line no-restricted-syntax
      for (const payload of payloads) {
        // eslint-disable-next-line no-await-in-loop
        await taskApi.create({
          weekId,
          title: payload.title,
          day: payload.day,
          category: payload.category,
          priority: payload.priority
        });
      }
      await refresh();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Unable to apply weekly pattern'));
    } finally {
      setBusyAction('');
    }
  };

  const handleDeleteGoal = async () => {
    const confirmed = window.confirm('Delete this goal and all progress?');
    if (!confirmed) {
      return;
    }

    setBusyAction('goal-delete');
    setActionError('');

    try {
      await goalApi.deleteGoal(goalId);
      navigate('/goals', { replace: true });
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Unable to delete goal'));
    } finally {
      setBusyAction('');
    }
  };

  if (loading) {
    return <div className="surface-card p-6 text-sm text-slate-500">Loading goal details...</div>;
  }

  if (error) {
    return <div className="surface-card p-6 text-sm text-rose-700">{error}</div>;
  }

  if (!goal) {
    return <div className="surface-card p-6 text-sm text-slate-500">Goal not found.</div>;
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Goal Planner</p>
          <h2 className="page-title mt-2">{goal.title}</h2>
          <p className="page-subtitle max-w-3xl">{goal.description || 'Build your monthly, weekly, and daily execution plan.'}</p>
          <p className="mt-3 text-sm text-slate-600">
            {goalStats.completed}/{goalStats.total} tasks completed • {goalStats.progress}%
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn-secondary"
            onClick={() => {
              setEditingTask(null);
              setSelectedWeekForTask('');
              setTaskModalOpen(true);
            }}
          >
            Add Task
          </button>
          <button
            className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
            onClick={handleDeleteGoal}
            disabled={busyAction === 'goal-delete'}
          >
            {busyAction === 'goal-delete' ? 'Deleting...' : 'Delete Goal'}
          </button>
        </div>
      </section>

      {actionError ? <div className="surface-card p-4 text-sm text-rose-700">{actionError}</div> : null}

      <section className="surface-card p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-slate-900">Create monthly plan</h3>
        <form onSubmit={handleCreateMonth} className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input
            className="input-base"
            placeholder="Month name (e.g. April 2026)"
            value={monthForm.monthName}
            onChange={(event) => setMonthForm((prev) => ({ ...prev, monthName: event.target.value }))}
          />
          <input
            className="input-base"
            placeholder="Description (optional)"
            value={monthForm.description}
            onChange={(event) => setMonthForm((prev) => ({ ...prev, description: event.target.value }))}
          />
          <button className="btn-primary" disabled={busyAction === 'month'}>
            {busyAction === 'month' ? 'Creating...' : 'Add Month'}
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <GoalPlanner
          months={months}
          weeksByMonth={weeksByMonth}
          tasksByWeek={tasksByWeek}
          weekForms={weekForms}
          openMonths={openMonths}
          openWeeks={openWeeks}
          busyAction={busyAction}
          busyTaskId={busyTaskId}
          onToggleMonth={toggleMonth}
          onToggleWeek={toggleWeek}
          onChangeWeekForm={(monthId, nextForm) =>
            setWeekForms((prev) => ({
              ...prev,
              [monthId]: nextForm
            }))
          }
          onCreateWeek={handleCreateWeek}
          onAddTask={(weekId) => {
            setEditingTask(null);
            setSelectedWeekForTask(weekId);
            setTaskModalOpen(true);
          }}
          onToggleTask={handleToggleTask}
          onEditTask={(task) => {
            setEditingTask(task);
            setSelectedWeekForTask(task.weekId);
            setTaskModalOpen(true);
          }}
          onDeleteTask={handleDeleteTask}
          onBulkCreateTasks={handleBulkCreateTasks}
        />
      </section>

      <CreateTaskModal
        open={taskModalOpen}
        loading={taskModalLoading}
        initialValue={editingTask}
        weekOptions={weekOptions}
        defaultWeekId={selectedWeekForTask}
        lockWeek={Boolean(selectedWeekForTask && !editingTask)}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
          setSelectedWeekForTask('');
        }}
        onSubmit={handleSaveTask}
      />
    </div>
  );
};

export default GoalDetail;

