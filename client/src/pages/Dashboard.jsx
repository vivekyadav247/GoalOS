import { useMemo, useState } from 'react';
import { useUser } from '@clerk/react';
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import GraphCard from '../components/GraphCard';
import TaskItem from '../components/TaskItem';
import TaskHeatmap from '../components/TaskHeatmap';
import ConfirmDialog from '../components/ConfirmDialog';
import CreateGoalModal from '../components/CreateGoalModal';
import CreateTaskModal from '../components/CreateTaskModal';
import { getApiErrorMessage, goalApi, taskApi } from '../services/api';
import usePlannerData from '../hooks/usePlannerData';

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const tooltipStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: 12,
  color: '#f8fafc',
  fontSize: 12,
  boxShadow: '0 12px 28px -18px rgba(15, 23, 42, 0.6)'
};
const tooltipLabelStyle = { color: '#e2e8f0', fontWeight: 600 };
const tooltipItemStyle = { color: '#f8fafc' };

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

    const today = normalizeDate(new Date());
    if (!today) return 0;
    const todayKey = toDateKey(today);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = toDateKey(yesterday);

    if (!completedDays.has(todayKey) && !completedDays.has(yesterdayKey)) {
      return 0;
    }

    const anchor = completedDays.has(todayKey) ? today : yesterday;
    let streak = 0;
    const cursor = new Date(anchor);

    while (true) {
      const key = toDateKey(cursor);
      if (!completedDays.has(key)) break;
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
  const maxDaily = useMemo(() => Math.max(1, ...dailyData.map((item) => item.value)), [dailyData]);

  const weeklyData = useMemo(() => {
    const buckets = new Map();
    const today = normalizeDate(new Date());

    for (const task of tasks) {
      if (!task.date) continue;
      const date = normalizeDate(task.date);
      if (!date) continue;
      if (today && date > today) continue;
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

      <section className="grid grid-cols-4 gap-2 md:gap-4">
        <article className="rounded-xl border border-slate-200 bg-white p-2 text-center shadow-sm md:rounded-2xl md:p-4">
          <p className="text-lg font-semibold text-slate-900 md:text-2xl">{summary.totalGoals}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 md:text-xs">
            Goals
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-2 text-center shadow-sm md:rounded-2xl md:p-4">
          <p className="text-lg font-semibold text-slate-900 md:text-2xl">{todaysTasks.length}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 md:text-xs">
            Today
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-2 text-center shadow-sm md:rounded-2xl md:p-4">
          <p className="text-lg font-semibold text-slate-900 md:text-2xl">{summary.completedTasks}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 md:text-xs">
            Completed
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-2 text-center shadow-sm md:rounded-2xl md:p-4">
          <p className="text-lg font-semibold text-slate-900 md:text-2xl">{activeStreak}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 md:text-xs">
            Streak
          </p>
        </article>
      </section>

      <TaskHeatmap tasks={tasks} />

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
            <BarChart data={dailyData} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="dashboardDailyBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                tickMargin={8}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <YAxis
                domain={[0, maxDaily]}
                allowDecimals={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                tickMargin={8}
                tick={{ fill: '#64748b', fontSize: 11 }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(15, 23, 42, 0.05)' }}
                contentStyle={tooltipStyle}
                labelStyle={tooltipLabelStyle}
                itemStyle={tooltipItemStyle}
                formatter={(value) => [`${value}`, 'Tasks']}
              />
              <Bar dataKey="value" fill="url(#dashboardDailyBar)" radius={[10, 10, 6, 6]} barSize={34} />
            </BarChart>
          </ResponsiveContainer>
        </GraphCard>
        <GraphCard title="Weekly progress" subtitle="Completion percentage by week" className="h-[340px]">
          {weeklyData.length === 0 ? (
            <p className="text-sm text-slate-500">No progress yet for this range.</p>
          ) : (
            <ResponsiveContainer width="100%" height="88%">
              <LineChart data={weeklyData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="label"
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                  tickMargin={8}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 100]}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                  tickMargin={8}
                  ticks={[0, 25, 50, 75, 100]}
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ stroke: '#e2e8f0', strokeDasharray: '4 4' }}
                  contentStyle={tooltipStyle}
                  labelStyle={tooltipLabelStyle}
                  itemStyle={tooltipItemStyle}
                  formatter={(value) => [`${value}%`, 'Completion']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#fff', stroke: '#0ea5e9', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#0ea5e9' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
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
