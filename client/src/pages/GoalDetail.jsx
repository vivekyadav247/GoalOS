import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CreateTaskModal from '../components/CreateTaskModal';
import GoalTaskQuickAdd from '../components/GoalTaskQuickAdd';
import GoalPlanner from '../components/GoalPlanner';
import ConfirmDialog from '../components/ConfirmDialog';
import { getApiErrorMessage, goalApi, taskApi, weekApi } from '../services/api';
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
  const [quickAddBusy, setQuickAddBusy] = useState(false);
  const [selectedDateForTask, setSelectedDateForTask] = useState('');
  const [deleteTaskDialog, setDeleteTaskDialog] = useState({ open: false, taskId: null });
  const [deleteGoalDialogOpen, setDeleteGoalDialogOpen] = useState(false);

  const weekRefs = useRef({});
  const hasAutoScrolledRef = useRef(false);

  const getAllWeeks = useCallback(
    () => Object.values(weeksByMonth || {}).flat(),
    [weeksByMonth]
  );

  const getWeekRange = useCallback((week) => {
    if (!week) {
      return { start: null, end: null };
    }

    return {
      start: week.rangeStart || week.startDate || null,
      end: week.rangeEnd || week.endDate || null
    };
  }, []);

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
        const range = getWeekRange(week);
        if (!range.start || !range.end) {
          return false;
        }

        const start = new Date(range.start);
        const end = new Date(range.end);

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
          return false;
        }

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        return ts >= start.getTime() && ts <= end.getTime();
      });

      return match?._id || '';
    },
    [getAllWeeks, getWeekRange]
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

  const formatLocalDate = useCallback((value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

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

  const applyPatternToWeek = useCallback(
    async (week, payload) => {
      if (!goalId) {
        throw new Error('Goal is missing');
      }

      if (!week?.startDate) {
        throw new Error('Week start date is missing');
      }

      const weekStart = formatLocalDate(week.startDate);
      if (!weekStart) {
        throw new Error('Week start date is invalid');
      }

      await weekApi.applyPattern({
        goalId,
        weekStart,
        pattern: payload.pattern,
        task: payload.task,
        weekdayTask: payload.weekdayTask,
        weekendTask: payload.weekendTask,
        sundayTask: payload.sundayTask,
        customDays: payload.customDays,
        rangeStart: payload.rangeStart,
        rangeEnd: payload.rangeEnd
      });
    },
    [goalId, formatLocalDate]
  );

  const handleQuickAddTask = async (payload) => {
    if (!goalId) {
      setActionError('Goal is missing');
      return false;
    }

    if (!payload?.title || !payload?.date) {
      setActionError('Task title and date are required');
      return false;
    }

    setQuickAddBusy(true);
    setActionError('');

    try {
      await taskApi.create({
        goalId,
        title: payload.title,
        date: payload.date
      });
      await refresh();
      return true;
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Unable to create task'));
      return false;
    } finally {
      setQuickAddBusy(false);
    }
  };

  const handleQuickApplyPattern = async ({ mode, monthId, weekId, payload }) => {
    if (!goalId) {
      setActionError('Goal is missing');
      return false;
    }

    setQuickAddBusy(true);
    setActionError('');

    try {
      if (mode === 'GOAL') {
        const allWeeks = getAllWeeks();
        if (allWeeks.length === 0) {
          throw new Error('No weeks found for this goal');
        }

        const rangeStartKey = goal?.startDate ? formatLocalDate(goal.startDate) : '';
        const rangeEndKey = goal?.endDate ? formatLocalDate(goal.endDate) : '';

        if (!rangeStartKey || !rangeEndKey) {
          throw new Error('Goal timeline is missing');
        }

        for (const week of allWeeks) {
          await applyPatternToWeek(week, {
            ...payload,
            rangeStart: rangeStartKey,
            rangeEnd: rangeEndKey
          });
        }
      } else if (mode === 'WEEK') {
        const week = getWeekById(weekId);
        if (!week) {
          throw new Error('Selected week not found');
        }
        await applyPatternToWeek(week, payload);
      } else if (mode === 'MONTH') {
        const monthWeeks = weeksByMonth[monthId] || [];
        if (monthWeeks.length === 0) {
          throw new Error('No weeks found for this month');
        }
        const [yearValue, monthValue] = String(monthId || '').split('-').map(Number);
        if (!yearValue || !monthValue) {
          throw new Error('Invalid month selection');
        }
        const monthStart = new Date(yearValue, monthValue - 1, 1);
        const monthEnd = new Date(yearValue, monthValue, 0, 23, 59, 59, 999);

        let goalStart = goal?.startDate ? new Date(goal.startDate) : null;
        let goalEnd = goal?.endDate ? new Date(goal.endDate) : null;

        if (goalStart && Number.isNaN(goalStart.getTime())) {
          goalStart = null;
        }
        if (goalEnd && Number.isNaN(goalEnd.getTime())) {
          goalEnd = null;
        }

        if (goalStart) {
          goalStart.setHours(0, 0, 0, 0);
        }
        if (goalEnd) {
          goalEnd.setHours(23, 59, 59, 999);
        }

        let rangeStart = monthStart;
        let rangeEnd = monthEnd;

        if (goalStart && goalStart > rangeStart) {
          rangeStart = goalStart;
        }
        if (goalEnd && goalEnd < rangeEnd) {
          rangeEnd = goalEnd;
        }

        if (rangeStart > rangeEnd) {
          throw new Error('Selected month is outside the goal timeline');
        }

        const rangeStartKey = formatLocalDate(rangeStart);
        const rangeEndKey = formatLocalDate(rangeEnd);

        for (const week of monthWeeks) {
          await applyPatternToWeek(week, {
            ...payload,
            rangeStart: rangeStartKey,
            rangeEnd: rangeEndKey
          });
        }
      } else {
        throw new Error('Select a planning option');
      }

      await refresh();
      return true;
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Unable to apply weekly pattern'));
      return false;
    } finally {
      setQuickAddBusy(false);
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

      <GoalTaskQuickAdd
        goal={goal}
        months={months}
        weeksByMonth={weeksByMonth}
        onCreateTask={handleQuickAddTask}
        onApplyPattern={handleQuickApplyPattern}
        busy={quickAddBusy}
      />

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
