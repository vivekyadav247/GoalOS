import { useMemo, useState } from 'react';
import { useUser } from '@clerk/react';
import GraphCard from '../components/GraphCard';
import TaskItem from '../components/TaskItem';
import ConfirmDialog from '../components/ConfirmDialog';
import CreateGoalModal from '../components/CreateGoalModal';
import CreateTaskModal from '../components/CreateTaskModal';
import { getApiErrorMessage, goalApi, taskApi } from '../services/api';
import usePlannerData from '../hooks/usePlannerData';

const Home = () => {
  const { user } = useUser();
  const { goals, tasks, loading, error, refresh } = usePlannerData();

  const [busyTaskId, setBusyTaskId] = useState('');
  const [modalError, setModalError] = useState('');
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, taskId: null });

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const goalOptions = useMemo(
    () =>
      goals.map((goal) => ({
        value: goal._id,
        label: goal.title
      })),
    [goals]
  );

  const todaysTasks = useMemo(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    return tasks
      .filter((task) => {
        const date = new Date(task.date);
        return date >= start && date < end;
      })
      .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  }, [tasks]);

  const handleToggleTask = async (task) => {
    setBusyTaskId(task._id);
    setModalError('');

    try {
      await taskApi.toggleComplete(task._id, !task.completed);
      await refresh();
    } catch (err) {
      setModalError(getApiErrorMessage(err, 'Unable to update task'));
    } finally {
      setBusyTaskId('');
    }
  };

  const handleCreateGoal = async (payload) => {
    setModalLoading(true);
    setModalError('');

    try {
      await goalApi.createGoal(payload);
      setGoalModalOpen(false);
      await refresh();
    } catch (err) {
      setModalError(getApiErrorMessage(err, 'Unable to create goal'));
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    setBusyTaskId(taskId);
    setModalError('');

    try {
      await taskApi.remove(taskId);
      await refresh();
    } catch (err) {
      setModalError(getApiErrorMessage(err, 'Unable to delete task'));
    } finally {
      setBusyTaskId('');
    }
  };

  const handleSaveTask = async (payload) => {
    setModalLoading(true);
    setModalError('');

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
      setModalError(getApiErrorMessage(err, 'Unable to save task'));
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="page-title text-2xl md:text-3xl">
            {greeting},{' '}
            <span className="text-blue-700">
              {user?.firstName || user?.username || 'Planner'}
            </span>
          </h2>
          <p className="page-subtitle">Your home shows only today&apos;s tasks.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="btn-secondary"
            onClick={() => {
              if (goals.length === 0) {
                setModalError('Create a goal first, then add tasks.');
                return;
              }
              setEditingTask(null);
              setTaskModalOpen(true);
            }}
          >
            New Task
          </button>
          <button className="btn-primary" onClick={() => setGoalModalOpen(true)}>
            New Goal
          </button>
        </div>
      </section>

      {error ? <div className="surface-card p-4 text-sm text-rose-700">{error}</div> : null}
      {modalError ? <div className="surface-card p-4 text-sm text-rose-700">{modalError}</div> : null}

      <GraphCard title="Today&apos;s Tasks" subtitle="Your plan for today">
        <div className="space-y-3">
          {loading ? (
            <p className="text-sm text-slate-500">Loading tasks...</p>
          ) : todaysTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
              <p className="font-medium text-slate-700">No tasks for today yet.</p>
              <p className="mt-1 text-slate-500">
                Future ke liye goals banao aur unhe daily tasks mein baanto, taki roz ka focus clear rahe.
              </p>
            </div>
          ) : (
            todaysTasks.map((task) => (
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

      <CreateGoalModal
        open={goalModalOpen}
        loading={modalLoading}
        onClose={() => setGoalModalOpen(false)}
        onSubmit={handleCreateGoal}
      />
      <CreateTaskModal
        open={taskModalOpen}
        loading={modalLoading}
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

export default Home;
