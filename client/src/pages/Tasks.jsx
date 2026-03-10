import { useMemo, useState } from 'react';
import TaskItem from '../components/TaskItem';
import GraphCard from '../components/GraphCard';
import CreateTaskModal from '../components/CreateTaskModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { getApiErrorMessage, taskApi } from '../services/api';
import usePlannerData from '../hooks/usePlannerData';

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
      today,
      thisWeek,
      thisMonth
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

  const sections = [
    { key: 'today', title: 'Today', items: grouped.today },
    { key: 'week', title: 'This Week', items: grouped.thisWeek },
    { key: 'month', title: 'This Month', items: grouped.thisMonth }
  ];

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
              subtitle={`${section.items.filter((task) => task.completed).length}/${section.items.length} completed`}
              className="h-full"
            >
              <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1 md:max-h-[420px]">
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
