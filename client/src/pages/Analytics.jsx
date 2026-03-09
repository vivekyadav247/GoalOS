import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import GraphCard from '../components/GraphCard';
import ProgressCard from '../components/ProgressCard';
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

const progressFromTasks = (tasks = []) => {
  if (!tasks.length) {
    return 0;
  }
  const completed = tasks.filter((task) => task.completed).length;
  return Math.round((completed / tasks.length) * 100);
};

const Analytics = () => {
  const {
    goals,
    months,
    weeks,
    tasks,
    tasksByWeek,
    weekToMonth,
    monthToGoal,
    loading,
    error
  } = usePlannerData();

  const dailyData = useMemo(
    () =>
      weekdays.map((day) => ({
        day: day.slice(0, 3),
        value: tasks.filter((task) => task.completed && normalizeDay(task.day) === day).length
      })),
    [tasks]
  );

  const weeklyData = useMemo(() => {
    return [...weeks]
      .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
      .slice(-10)
      .map((week) => ({
        label: `W${week.weekNumber}`,
        value: progressFromTasks(tasksByWeek[week._id] || [])
      }));
  }, [weeks, tasksByWeek]);

  const categoryData = useMemo(() => {
    const grouped = {};

    for (const task of tasks) {
      const key = task.category?.trim() || 'General';
      if (!grouped[key]) {
        grouped[key] = { total: 0, completed: 0 };
      }
      grouped[key].total += 1;
      if (task.completed) {
        grouped[key].completed += 1;
      }
    }

    return Object.entries(grouped)
      .map(([category, stats]) => ({
        category,
        value: stats.total ? Math.round((stats.completed / stats.total) * 100) : 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [tasks]);

  const goalProgressData = useMemo(() => {
    const grouped = {};

    for (const task of tasks) {
      const monthId = weekToMonth[task.weekId];
      const goalId = monthToGoal[monthId];
      if (!goalId) {
        continue;
      }

      if (!grouped[goalId]) {
        grouped[goalId] = { total: 0, completed: 0 };
      }

      grouped[goalId].total += 1;
      if (task.completed) {
        grouped[goalId].completed += 1;
      }
    }

    return goals
      .map((goal) => {
        const stats = grouped[goal._id] || { total: 0, completed: 0 };
        return {
          goal: goal.title,
          progress: stats.total ? Math.round((stats.completed / stats.total) * 100) : 0
        };
      })
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 8);
  }, [goals, tasks, weekToMonth, monthToGoal]);

  const completionSummary = useMemo(() => {
    const completed = tasks.filter((task) => task.completed).length;
    const total = tasks.length;
    return total ? Math.round((completed / total) * 100) : 0;
  }, [tasks]);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="page-title">Analytics</h2>
        <p className="page-subtitle">Track productivity trends and category balance from live backend data.</p>
      </section>

      {error ? <div className="surface-card p-4 text-sm text-rose-700">{error}</div> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ProgressCard title="Total Goals" value={goals.length} subtitle="Goals in workspace" tone="blue" />
        <ProgressCard title="Months Planned" value={months.length} subtitle="Monthly breakdowns" tone="slate" />
        <ProgressCard title="Weeks Planned" value={weeks.length} subtitle="Weekly execution units" tone="amber" />
        <ProgressCard title="Completion" value={`${completionSummary}%`} subtitle="Overall completed tasks" tone="emerald" />
      </section>

      {loading ? (
        <div className="surface-card p-6 text-sm text-slate-500">Loading analytics...</div>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          <GraphCard title="Daily productivity" subtitle="Completed tasks by day" className="h-[340px]">
            <ResponsiveContainer width="100%" height="88%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GraphCard>

          <GraphCard title="Weekly progress" subtitle="Completion percentage" className="h-[340px]">
            <ResponsiveContainer width="100%" height="88%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" stroke="#64748b" />
                <YAxis stroke="#64748b" domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </GraphCard>

          <GraphCard title="Monthly category radar" subtitle="Completion percentage by category" className="h-[360px]">
            {categoryData.length === 0 ? (
              <p className="text-sm text-slate-500">No category data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="88%">
                <RadarChart data={categoryData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="category" stroke="#64748b" />
                  <PolarRadiusAxis stroke="#cbd5e1" domain={[0, 100]} />
                  <Radar dataKey="value" stroke="#2563eb" fill="#93c5fd" fillOpacity={0.55} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </GraphCard>

          <GraphCard title="Goal progress" subtitle="Completion by goal">
            <div className="space-y-3">
              {goalProgressData.length === 0 ? (
                <p className="text-sm text-slate-500">No goals available.</p>
              ) : (
                goalProgressData.map((goal) => (
                  <div key={goal.goal}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <p className="font-medium text-slate-700">{goal.goal}</p>
                      <p className="text-slate-500">{goal.progress}%</p>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </GraphCard>
        </section>
      )}
    </div>
  );
};

export default Analytics;

