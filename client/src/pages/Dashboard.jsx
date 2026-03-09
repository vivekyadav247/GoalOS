import { useMemo, useState } from 'react';
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
import ProgressCard from '../components/ProgressCard';
import GraphCard from '../components/GraphCard';
import TaskItem from '../components/TaskItem';
import GoalCard from '../components/GoalCard';
import CreateGoalModal from '../components/CreateGoalModal';
import CreateTaskModal from '../components/CreateTaskModal';
import { getApiErrorMessage, getAuthUser, goalApi, taskApi } from '../services/api';
import usePlannerData from '../hooks/usePlannerData';

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const normalizeDay = (value) => {
  if (!value) {
    return '';
  }
  const normalized = String(value).trim().toLowerCase();
  const matched = weekdays.find((day) => day.toLowerCase() === normalized);
  return matched || '';
};

const computeProgress = (tasks = []) => {
  if (!tasks.length) {
    return 0;
  }
  const completed = tasks.filter((task) => task.completed).length;
  return Math.round((completed / tasks.length) * 100);
};

const Dashboard = () => {
  const user = getAuthUser();
  const {
    goals,
    months,
    weeks,
    tasks,
    tasksByWeek,
    weekToMonth,
    monthToGoal,
    loading,
    error,
    refresh
  } = usePlannerData();

  const [busyTaskId, setBusyTaskId] = useState('');
  const [modalError, setModalError] = useState('');
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const goalStats = useMemo(() => {
    const byGoal = {};

    for (const task of tasks) {
      const monthId = weekToMonth[task.weekId];
      const goalId = monthToGoal[monthId];
      if (!goalId) {
        continue;
      }

      if (!byGoal[goalId]) {
        byGoal[goalId] = { total: 0, completed: 0 };
      }

      byGoal[goalId].total += 1;
      if (task.completed) {
        byGoal[goalId].completed += 1;
      }
    }

    return byGoal;
  }, [tasks, weekToMonth, monthToGoal]);

  const summary = useMemo(() => {
    const completedTasks = tasks.filter((task) => task.completed).length;
    const totalTasks = tasks.length;

    return {
      totalGoals: goals.length,
      totalTasks,
      completedTasks,
      completionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0
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

  const todayName = useMemo(
    () => new Date().toLocaleDateString(undefined, { weekday: 'long' }),
    []
  );

  const todaysTasks = useMemo(() => {
    const dayName = normalizeDay(todayName);
    const exactMatches = tasks.filter((task) => normalizeDay(task.day) === dayName);

    if (exactMatches.length > 0) {
      return exactMatches;
    }

    return [...tasks]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 8);
  }, [tasks, todayName]);

  const dailyData = useMemo(
    () =>
      weekdays.map((day) => ({
        label: day.slice(0, 3),
        value: tasks.filter((task) => task.completed && normalizeDay(task.day) === day).length
      })),
    [tasks]
  );

  const weeklyData = useMemo(() => {
    return [...weeks]
      .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
      .slice(-8)
      .map((week) => ({
        label: `W${week.weekNumber}`,
        value: computeProgress(tasksByWeek[week._id] || [])
      }));
  }, [weeks, tasksByWeek]);

  const weekOptions = useMemo(() => {
    const monthMap = Object.fromEntries(months.map((month) => [month._id, month.monthName]));

    return [...weeks]
      .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
      .map((week) => ({
        value: week._id,
        label: `${monthMap[week.monthId] || 'Month'} • Week ${week.weekNumber}`
      }));
  }, [months, weeks]);

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

  const handleCreateTask = async (payload) => {
    setModalLoading(true);
    setModalError('');

    try {
      await taskApi.create(payload);
      setTaskModalOpen(false);
      await refresh();
    } catch (err) {
      setModalError(getApiErrorMessage(err, 'Unable to create task'));
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="page-title">
            {greeting}, <span className="text-blue-700">{user?.name || 'Planner'}</span>
          </h2>
          <p className="page-subtitle">Track outcomes, tasks, and momentum across your planning cycle.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button className="btn-secondary" onClick={() => setTaskModalOpen(true)}>
            New Task
          </button>
          <button className="btn-primary" onClick={() => setGoalModalOpen(true)}>
            New Goal
          </button>
        </div>
      </section>

      {error ? <div className="surface-card p-4 text-sm text-rose-700">{error}</div> : null}
      {modalError ? <div className="surface-card p-4 text-sm text-rose-700">{modalError}</div> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ProgressCard title="Total Goals" value={summary.totalGoals} subtitle="Active focus areas" tone="blue" />
        <ProgressCard title="Total Tasks" value={summary.totalTasks} subtitle="Across all plans" tone="slate" />
        <ProgressCard title="Completed" value={summary.completedTasks} subtitle="Tasks marked done" tone="emerald" />
        <ProgressCard title="Completion Rate" value={`${summary.completionRate}%`} subtitle="Overall task progress" tone="amber" />
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

      <section className="grid gap-4 lg:grid-cols-2">
        <GraphCard title="Today's tasks" subtitle={`${todayName} task list`}>
          <div className="space-y-2">
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

      <CreateGoalModal
        open={goalModalOpen}
        loading={modalLoading}
        onClose={() => setGoalModalOpen(false)}
        onSubmit={handleCreateGoal}
      />
      <CreateTaskModal
        open={taskModalOpen}
        loading={modalLoading}
        weekOptions={weekOptions}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
};

export default Dashboard;

