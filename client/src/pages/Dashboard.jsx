import { useMemo, useState } from 'react';
import { useUser } from '@clerk/react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import GraphCard from '../components/GraphCard';
import TaskItem from '../components/TaskItem';
import GoalCard from '../components/GoalCard';
import TaskHeatmap from '../components/TaskHeatmap';
import ConfirmDialog from '../components/ConfirmDialog';
import CreateGoalModal from '../components/CreateGoalModal';
import CreateTaskModal from '../components/CreateTaskModal';
import { getApiErrorMessage, goalApi, taskApi } from '../services/api';
import usePlannerData from '../hooks/usePlannerData';

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const computeProgress = (tasks = []) => {
  if (!tasks.length) {
    return 0;
  }
  const completed = tasks.filter((task) => task.completed).length;
  return Math.round((completed / tasks.length) * 100);
};

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

const toDateKey = (value) => {
  const date = normalizeDate(value);
  if (!date) {
    return '';
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Dashboard = () => {
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

  const goalStats = useMemo(() => {
    const byGoal = {};

    for (const task of tasks) {
      const goalId = task.goalId;
      if (!goalId) continue;

      if (!byGoal[goalId]) {
        byGoal[goalId] = { total: 0, completed: 0 };
      }

      byGoal[goalId].total += 1;
      if (task.completed) {
        byGoal[goalId].completed += 1;
      }
    }

    return byGoal;
  }, [tasks]);

  const summary = useMemo(() => {
    const completedTasks = tasks.filter((task) => task.completed).length;

    return {
      totalGoals: goals.length,
      completedTasks
    };
  }, [goals.length, tasks]);

  const goalCards = useMemo(() => {
    return goals.map((goal) => {
      const stats = goalStats[goal._id] || { total: 0, completed: 0 };
      const progress = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;
      return {
        ...goal,
        progress,
        tasksCompleted: stats.completed
      };
    });
  }, [goals, goalStats]);

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
        const date = normalizeDate(task.date);
        if (!date) return false;
        return date >= start && date < end;
      })
      .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  }, [tasks]);

  const activeStreak = useMemo(() => {
    const completedDays = new Set(
      tasks
        .filter((task) => task.completed && task.date)
        .map((task) => toDateKey(task.date))
        .filter(Boolean)
    );

    if (completedDays.size === 0) {
      return 0;
    }

    let streak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    while (true) {
      const key = toDateKey(cursor);
      if (!completedDays.has(key)) {
        break;
      }
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  }, [tasks]);

  const dailyData = useMemo(
    () =>
      weekdays.map((day) => ({
        label: day.slice(0, 3),
        value: tasks.filter((task) => {
          if (!task.completed || !task.date) return false;
          const taskDate = normalizeDate(task.date);
          if (!taskDate) return false;
          const weekday = weekdays[taskDate.getDay() === 0 ? 6 : taskDate.getDay() - 1];
          return weekday === day;
        }).length
      })),
    [tasks]
  );

  const weeklyData = useMemo(() => {
    const buckets = new Map();

    for (const task of tasks) {
      if (!task.date) continue;
      const date = normalizeDate(task.date);
      if (!date) continue;
      const year = date.getFullYear();
      const weekStart = new Date(year, date.getMonth(), date.getDate());
      const day = weekStart.getDay() || 7;
      weekStart.setDate(weekStart.getDate() - (day - 1));
      weekStart.setHours(0, 0, 0, 0);
      const key = weekStart.toISOString().slice(0, 10);

      if (!buckets.has(key)) {
        buckets.set(key, []);
      }
      buckets.get(key).push(task);
    }

    return Array.from(buckets.entries())
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .slice(-8)
      .map(([key, weekTasks]) => ({
        label: `W${key.slice(5)}`,
        value: computeProgress(weekTasks)
      }));
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
          <p className="page-subtitle">Track outcomes, tasks, and momentum across your planning cycle.</p>
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

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Goals</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{summary.totalGoals}</p>
          <p className="mt-1 text-xs text-slate-500">Active focus areas</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Tasks Today</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{todaysTasks.length}</p>
          <p className="mt-1 text-xs text-slate-500">Scheduled for today</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Completed Tasks</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{summary.completedTasks}</p>
          <p className="mt-1 text-xs text-slate-500">Marked as done</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Active Streak</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{activeStreak}</p>
          <p className="mt-1 text-xs text-slate-500">{activeStreak === 1 ? 'Day in a row' : 'Days in a row'}</p>
        </article>
      </section>

      <TaskHeatmap tasks={tasks} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="surface-card p-5 text-sm text-slate-500">Loading goal cards...</div>
        ) : goalCards.length === 0 ? (
          <div className="surface-card p-5 text-sm text-slate-500">
            Create your first goal to see goal progress cards.
          </div>
        ) : (
          goalCards.slice(0, 3).map((goal) => (
            <GoalCard
              key={goal._id}
              title={goal.title}
              category={goal.category}
              progress={goal.progress}
              tasksCompleted={goal.tasksCompleted}
            />
          ))
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <GraphCard title="Today's Tasks" subtitle="Your plan for today">
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500">Loading tasks...</p>
            ) : todaysTasks.length === 0 ? (
              <p className="text-sm text-slate-500">No tasks yet.</p>
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

        <GraphCard title="Goal focus" subtitle="Current progress by goal">
          <div className="space-y-3">
            {goals.length === 0 ? (
              <p className="text-sm text-slate-500">No goals available.</p>
            ) : (
              goals.map((goal) => {
                const stats = goalStats[goal._id] || { total: 0, completed: 0 };
                const progress = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;

                return (
                  <div key={goal._id}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{goal.title}</span>
                      <span className="text-slate-500">{progress}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </GraphCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <GraphCard title="Daily productivity" subtitle="Completed tasks by weekday" className="h-[340px]">
          <ResponsiveContainer width="100%" height="88%">
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GraphCard>
        <GraphCard title="Weekly progress" subtitle="Completion percentage by week" className="h-[340px]">
          <ResponsiveContainer width="100%" height="88%">
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" stroke="#64748b" />
              <YAxis stroke="#64748b" domain={[0, 100]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </GraphCard>
      </section>

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

export default Dashboard;
