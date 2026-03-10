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

const startOfWeek = (date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - (day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
};

const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const Analytics = () => {
  const { goals, tasks, loading, error } = usePlannerData();

  const dailyData = useMemo(
    () =>
      weekdays.map((day) => ({
        day: day.slice(0, 3),
        value: tasks.filter((task) => {
          if (!task.completed || !task.date) return false;
          const d = new Date(task.date);
          const label = weekdays[d.getDay() === 0 ? 6 : d.getDay() - 1];
          return label === day;
        }).length
      })),
    [tasks]
  );

  const weeklyData = useMemo(() => {
    const buckets = new Map();
    for (const task of tasks) {
      if (!task.date) continue;
      const d = new Date(task.date);
      const key = startOfWeek(d).toISOString().slice(0, 10);
      if (!buckets.has(key)) {
        buckets.set(key, []);
      }
      buckets.get(key).push(task);
    }

    return Array.from(buckets.entries())
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .slice(-10)
      .map(([key, weekTasks]) => {
        const completed = weekTasks.filter((task) => task.completed).length;
        const progress = weekTasks.length ? Math.round((completed / weekTasks.length) * 100) : 0;
        return {
          label: `W ${key.slice(5)}`,
          value: progress
        };
      });
  }, [tasks]);

  const goalMap = useMemo(
    () =>
      Object.fromEntries(
        goals.map((goal) => [goal._id, goal.title])
      ),
    [goals]
  );

  const categoryData = useMemo(() => {
    const grouped = {};

    for (const task of tasks) {
      const key = goalMap[task.goalId] || 'General';
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
  }, [goalMap, tasks]);

  const goalProgressData = useMemo(() => {
    const grouped = {};

    for (const task of tasks) {
      const goalId = task.goalId;
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
  }, [goals, tasks]);

  const completionSummary = useMemo(() => {
    const completed = tasks.filter((task) => task.completed).length;
    const total = tasks.length;
    return total ? Math.round((completed / total) * 100) : 0;
  }, [tasks]);

  const monthCount = useMemo(() => {
    const keys = new Set();
    for (const goal of goals) {
      if (goal.startDate) {
        keys.add(monthKey(new Date(goal.startDate)));
      }
      if (goal.endDate) {
        keys.add(monthKey(new Date(goal.endDate)));
      }
    }
    for (const task of tasks) {
      if (!task.date) continue;
      keys.add(monthKey(new Date(task.date)));
    }
    return keys.size;
  }, [goals, tasks]);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="page-title">Analytics</h2>
        <p className="page-subtitle">Track productivity trends and execution performance from live backend data.</p>
      </section>

      {error ? <div className="surface-card p-4 text-sm text-rose-700">{error}</div> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ProgressCard title="Total Goals" value={goals.length} subtitle="Goals in workspace" tone="blue" />
        <ProgressCard title="Months Planned" value={monthCount} subtitle="Months touched by plans" tone="slate" />
        <ProgressCard title="Task Weeks" value={weeklyData.length} subtitle="Active execution weeks" tone="amber" />
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

          <GraphCard title="Goal performance radar" subtitle="Completion percentage by goal" className="h-[380px]">
            {categoryData.length === 0 ? (
              <p className="text-sm text-slate-500">No data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="88%">
                <RadarChart data={categoryData} outerRadius="72%">
                  <defs>
                    <linearGradient id="goalRadar" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <PolarGrid stroke="#e2e8f0" radialLines />
                  <PolarAngleAxis
                    dataKey="category"
                    stroke="#64748b"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(value) => (String(value).length > 12 ? `${String(value).slice(0, 12)}...` : value)}
                  />
                  <PolarRadiusAxis
                    stroke="#cbd5e1"
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickCount={6}
                  />
                  <Radar
                    dataKey="value"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fill="url(#goalRadar)"
                    fillOpacity={1}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      borderColor: '#e2e8f0',
                      fontSize: 12
                    }}
                    formatter={(value) => [`${value}%`, 'Completion']}
                  />
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
