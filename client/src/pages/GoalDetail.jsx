import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CreateTaskModal from '../components/CreateTaskModal';
import GoalPlanner from '../components/GoalPlanner';
import ConfirmDialog from '../components/ConfirmDialog';
import { getApiErrorMessage, goalApi, taskApi } from '../services/api';
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

  const [openMonths, setOpenMonths] = useState({});
  const [openWeeks, setOpenWeeks] = useState({});

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalLoading, setTaskModalLoading] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [busyTaskId, setBusyTaskId] = useState('');
  const [busyAction, setBusyAction] = useState('');
  const [actionError, setActionError] = useState('');
  const [selectedDateForTask, setSelectedDateForTask] = useState('');
  const [deleteTaskDialog, setDeleteTaskDialog] = useState({ open: false, taskId: null });
  const [deleteGoalDialogOpen, setDeleteGoalDialogOpen] = useState(false);

  const weekRefs = useRef({});
  const hasAutoScrolledRef = useRef(false);

  const getAllWeeks = useCallback(
    () => Object.values(weeksByMonth || {}).flat(),
    [weeksByMonth]
  );

  const getWeekById = useCallback(
    (weekId) => getAllWeeks().find((week) => week._id === weekId) || null,
    [getAllWeeks]
  );

  const findWeekIdForDate = useCallback(
    (rawDate) => {
      if (!rawDate) {
        return '';
      }

      const target = new Date(rawDate);
      if (Number.isNaN(target.getTime())) {
        return '';
      }

      target.setHours(0, 0, 0, 0);
      const ts = target.getTime();

      const allWeeks = getAllWeeks();
      const match = allWeeks.find((week) => {
        if (!week.startDate || !week.endDate) {
          return false;
        }

        const start = new Date(week.startDate);
        const end = new Date(week.endDate);

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
          return false;
        }

        return ts >= start.getTime() && ts <= end.getTime();
      });

      return match?._id || '';
    },
    [getAllWeeks]
  );

  const todayWeekId = useMemo(
    () => findWeekIdForDate(new Date()),
    [findWeekIdForDate]
  );

  const scrollToWeek = useCallback((weekId) => {
    if (!weekId) {
      return;
    }

    const node = weekRefs.current[weekId];
    if (node && typeof node.scrollIntoView === 'function') {
      node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const registerWeekRef = useCallback((weekId, node) => {
    if (!weekId) {
      return;
    }

    if (node) {
      weekRefs.current[weekId] = node;
    } else {
      delete weekRefs.current[weekId];
    }
  }, []);

  const deriveDefaultDateForWeek = useCallback(
    (weekId) => {
      const week = getWeekById(weekId);
      if (!week || !week.startDate) {
        return '';
      }

      const start = new Date(week.startDate);
      if (Number.isNaN(start.getTime())) {
        return '';
      }

      start.setDate(start.getDate() + 1);
      start.setHours(0, 0, 0, 0);
      return start.toISOString().slice(0, 10);
    },
    [getWeekById]
  );

  useEffect(() => {
    if (months.length === 0) {
      return;
    }

    setOpenMonths((prev) => {
      if (Object.keys(prev).length > 0) {
        return prev;
      }

      let initialMonthId = months[0]?._id;

      if (todayWeekId) {
        const monthWithToday = months.find((month) =>
          (weeksByMonth[month._id] || []).some((week) => week._id === todayWeekId)
        );
        if (monthWithToday) {
          initialMonthId = monthWithToday._id;
        }
      }

      if (!initialMonthId) {
        return prev;
      }

      return { [initialMonthId]: true };
    });
  }, [months, weeksByMonth, todayWeekId]);

  useEffect(() => {
    if (!todayWeekId || hasAutoScrolledRef.current) {
      return;
    }

    let monthIdForToday = '';
    for (const month of months) {
      const monthWeeks = weeksByMonth[month._id] || [];
      if (monthWeeks.some((week) => week._id === todayWeekId)) {
        monthIdForToday = month._id;
        break;
      }
    }

    if (!monthIdForToday) {
      return;
    }

    setOpenMonths((prev) => ({ ...prev, [monthIdForToday]: true }));
    setOpenWeeks((prev) => ({ ...prev, [todayWeekId]: true }));

    const timeout = window.setTimeout(() => {
      scrollToWeek(todayWeekId);
    }, 80);

    hasAutoScrolledRef.current = true;

    return () => {
      window.clearTimeout(timeout);
    };
  }, [todayWeekId, months, weeksByMonth, scrollToWeek]);

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

  const handleJumpToDate = useCallback(
    (rawDate) => {
      if (!rawDate) {
        return;
      }

      const weekId = findWeekIdForDate(rawDate);
      if (!weekId) {
        return;
      }

      let monthIdForWeek = '';
      for (const month of months) {
        const monthWeeks = weeksByMonth[month._id] || [];
        if (monthWeeks.some((week) => week._id === weekId)) {
          monthIdForWeek = month._id;
          break;
        }
      }

      if (monthIdForWeek) {
        setOpenMonths((prev) => ({ ...prev, [monthIdForWeek]: true }));
      }

      setOpenWeeks((prev) => ({ ...prev, [weekId]: true }));

      window.setTimeout(() => {
        scrollToWeek(weekId);
      }, 80);
    },
    [findWeekIdForDate, months, weeksByMonth, scrollToWeek]
  );

  const handleJumpToToday = useCallback(() => {
    handleJumpToDate(new Date());
  }, [handleJumpToDate]);

  const handleJumpToStart = useCallback(() => {
    if (!goal?.startDate) {
      return;
    }
    handleJumpToDate(goal.startDate);
  }, [goal, handleJumpToDate]);

  const handleJumpToEnd = useCallback(() => {
    if (!goal?.endDate) {
      return;
    }
    handleJumpToDate(goal.endDate);
  }, [goal, handleJumpToDate]);

  const handleSaveTask = async (payload) => {
    if (!goalId) {
      setActionError('Goal is missing');
      return;
    }

    if (!payload.date) {
      setActionError('Select a date before saving a task');
      return;
    }

    setTaskModalLoading(true);
    setActionError('');

    try {
      if (editingTask?._id) {
        await taskApi.update(editingTask._id, {
          title: payload.title,
          date: payload.date
        });
      } else {
        await taskApi.create({
          goalId,
          title: payload.title,
          date: payload.date
        });
      }

      setTaskModalOpen(false);
      setEditingTask(null);
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

  const taskModalInitialValue = useMemo(
    () => editingTask
      || (selectedDateForTask
        ? { title: '', date: selectedDateForTask }
        : null),
    [editingTask, selectedDateForTask]
  );

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
            {goalStats.completed}/{goalStats.total} tasks completed - {goalStats.progress}%
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn-secondary"
            onClick={() => {
              setEditingTask(null);
              setSelectedDateForTask('');
              setTaskModalOpen(true);
            }}
          >
            Add Task
          </button>
          <button
            className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
            onClick={() => setDeleteGoalDialogOpen(true)}
            disabled={busyAction === 'goal-delete'}
          >
            {busyAction === 'goal-delete' ? 'Deleting...' : 'Delete Goal'}
          </button>
        </div>
      </section>

      {actionError ? <div className="surface-card p-4 text-sm text-rose-700">{actionError}</div> : null}

      <section className="surface-card p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Planner timeline</h3>
            <p className="mt-2 text-xs text-slate-500">
              Months and weeks are generated automatically from the goal date range.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
            <button
              type="button"
              className="btn-secondary px-3 py-1.5 text-xs"
              onClick={handleJumpToToday}
            >
              Jump to Today
            </button>
            <button
              type="button"
              className="btn-secondary px-3 py-1.5 text-xs"
              onClick={handleJumpToStart}
              disabled={!goal.startDate}
            >
              Jump to Start
            </button>
            <button
              type="button"
              className="btn-secondary px-3 py-1.5 text-xs"
              onClick={handleJumpToEnd}
              disabled={!goal.endDate}
            >
              Jump to End
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <GoalPlanner
          months={months}
          weeksByMonth={weeksByMonth}
          tasksByWeek={tasksByWeek}
          openMonths={openMonths}
          openWeeks={openWeeks}
          busyTaskId={busyTaskId}
          onToggleMonth={toggleMonth}
          onToggleWeek={toggleWeek}
          onAddTask={(weekId) => {
            setEditingTask(null);
            if (weekId) {
              setSelectedDateForTask(deriveDefaultDateForWeek(weekId));
            } else {
              setSelectedDateForTask('');
            }
            setTaskModalOpen(true);
          }}
          onToggleTask={handleToggleTask}
          onEditTask={(task) => {
            setEditingTask(task);
            setSelectedDateForTask(
              task.date ? String(task.date).slice(0, 10) : ''
            );
            setTaskModalOpen(true);
          }}
          onDeleteTask={(taskId) => setDeleteTaskDialog({ open: true, taskId })}
          todayWeekId={todayWeekId}
          onWeekRef={registerWeekRef}
        />
      </section>

      <CreateTaskModal
        open={taskModalOpen}
        loading={taskModalLoading}
        initialValue={taskModalInitialValue}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
          setSelectedDateForTask('');
        }}
        onSubmit={handleSaveTask}
      />
      <ConfirmDialog
        open={deleteTaskDialog.open}
        title="Delete task?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setDeleteTaskDialog({ open: false, taskId: null })}
        onConfirm={() => {
          const taskId = deleteTaskDialog.taskId;
          setDeleteTaskDialog({ open: false, taskId: null });
          if (taskId) {
            handleDeleteTask(taskId);
          }
        }}
      />
      <ConfirmDialog
        open={deleteGoalDialogOpen}
        title="Delete goal?"
        message="This will remove the goal and all progress."
        confirmLabel="Delete"
        onCancel={() => setDeleteGoalDialogOpen(false)}
        onConfirm={() => {
          setDeleteGoalDialogOpen(false);
          handleDeleteGoal();
        }}
      />
    </div>
  );
};

export default GoalDetail;
