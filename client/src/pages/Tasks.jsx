import { useMemo, useState } from 'react';
import TaskItem from '../components/TaskItem';
import GraphCard from '../components/GraphCard';
import CreateTaskModal from '../components/CreateTaskModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { getApiErrorMessage, taskApi } from '../services/api';
import usePlannerData from '../hooks/usePlannerData';

const normalizeDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  if (typeof value === 'string') {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      return new Date(year, month - 1, day);
    }
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

const isMissedTask = (task, today) => {
  if (!task?.date || task?.completed || !today) return false;
  const taskDate = normalizeDate(task.date);
  if (!taskDate) return false;
  return taskDate < today;
};

const orderByCompletion = (items = [], today = null) => {
  if (!items.length) return items;
  const remaining = [];
  const done = [];
  const todayDate = today ? normalizeDate(today) : normalizeDate(new Date());

  for (const item of items) {
    const missed = isMissedTask(item, todayDate);
    if (item.completed || missed) {
      done.push(item);
    } else {
      remaining.push(item);
    }
  }
  return [...remaining, ...done];
};

const Tasks = () => {
  const { goals, tasks, loading, error, refresh } = usePlannerData();

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalLoading, setTaskModalLoading] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [busyTaskId, setBusyTaskId] = useState('');
  const [actionError, setActionError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, taskId: null });

  const goalOptions = useMemo(
    () =>
      goals.map((goal) => ({
        value: goal._id,
        label: goal.title
      })),
    [goals]
  );

  const grouped = useMemo(() => {
    const today = [];
    const thisWeek = [];
    const thisMonth = [];
    if (!tasks.length) {
      return { today, thisWeek, thisMonth };
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const weekStart = new Date(todayStart);
    const day = weekStart.getDay() || 7;
    weekStart.setDate(weekStart.getDate() - (day - 1));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    for (const task of tasks) {
      if (!task.date) continue;
      const date = new Date(task.date);

      if (date >= todayStart && date < todayEnd) {
        today.push(task);
      }

      if (date >= weekStart && date < weekEnd) {
        thisWeek.push(task);
      }

      if (date >= monthStart && date < monthEnd) {
        thisMonth.push(task);
      }
    }

    return {
      today: orderByCompletion(today, todayStart),
      thisWeek: orderByCompletion(thisWeek, todayStart),
      thisMonth: orderByCompletion(thisMonth, todayStart)
    };
  }, [tasks]);

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

  const handleSaveTask = async (payload) => {
    setTaskModalLoading(true);
    setActionError('');

    try {
      if (editingTask?._id) {
        await taskApi.update(editingTask._id, {
          title: payload.title,
          date: payload.date
        });
      } else {
        if (!payload.goalId) {
          throw new Error('Select a goal before creating a task');
        }
        await taskApi.create({
          goalId: payload.goalId,
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

  const sections = useMemo(
    () => [
      {
        key: 'today',
        title: 'Today',
        items: grouped.today,
        completedCount: grouped.today.reduce((sum, task) => sum + (task.completed ? 1 : 0), 0)
      },
      {
        key: 'week',
        title: 'This Week',
        items: grouped.thisWeek,
        completedCount: grouped.thisWeek.reduce((sum, task) => sum + (task.completed ? 1 : 0), 0)
      },
      {
        key: 'month',
        title: 'This Month',
        items: grouped.thisMonth,
        completedCount: grouped.thisMonth.reduce((sum, task) => sum + (task.completed ? 1 : 0), 0)
      }
    ],
    [grouped]
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="page-title">Tasks</h2>
          <p className="page-subtitle">Organized by Today, This Week, and This Month.</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            if (goals.length === 0) {
              setActionError('Create a goal first, then add tasks.');
              return;
            }
            setEditingTask(null);
            setTaskModalOpen(true);
          }}
        >
          Create Task
        </button>
      </section>

      {error ? <div className="surface-card p-4 text-sm text-rose-700">{error}</div> : null}
      {actionError ? <div className="surface-card p-4 text-sm text-rose-700">{actionError}</div> : null}

      {loading ? (
        <div className="surface-card p-6 text-sm text-slate-500">Loading tasks...</div>
      ) : (
        <section className="grid items-start gap-4 xl:grid-cols-3">
          {sections.map((section) => (
            <GraphCard
              key={section.key}
              title={section.title}
              subtitle={`${section.completedCount}/${section.items.length} completed`}
              className="h-full"
            >
              <div className="max-h-[360px] space-y-2 overflow-y-auto pr-2 md:max-h-[420px] md:pr-1">
                {section.items.length === 0 ? (
                  <p className="text-sm text-slate-500">No tasks in this bucket.</p>
                ) : (
                  section.items.map((task) => (
                    <TaskItem
                      key={task._id}
                      task={task}
                      busy={busyTaskId === task._id}
                      onToggle={() => handleToggleTask(task)}
                      onEdit={() => {
                        setEditingTask(task);
                        setTaskModalOpen(true);
                      }}
                      onDelete={() => setDeleteDialog({ open: true, taskId: task._id })}
                    />
                  ))
                )}
              </div>
            </GraphCard>
          ))}
        </section>
      )}

      <CreateTaskModal
        open={taskModalOpen}
        loading={taskModalLoading}
        initialValue={editingTask}
        goalOptions={goalOptions}
        requireGoal={!editingTask}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
      />
      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete task?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setDeleteDialog({ open: false, taskId: null })}
        onConfirm={() => {
          const taskId = deleteDialog.taskId;
          setDeleteDialog({ open: false, taskId: null });
          if (taskId) {
            handleDeleteTask(taskId);
          }
        }}
      />
    </div>
  );
};

export default Tasks;
