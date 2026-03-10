import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
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
  const [timeframe, setTimeframe] = useState('overall');
  const [selectedGoal, setSelectedGoal] = useState('all');

  const now = useMemo(() => new Date(), []);
  const todayStart = useMemo(() => new Date(now.getFullYear(), now.getMonth(), now.getDate()), [now]);
  const weekStart = useMemo(() => startOfWeek(todayStart), [todayStart]);
  const weekEnd = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 7);
    return end;
  }, [weekStart]);
  const monthStart = useMemo(() => new Date(now.getFullYear(), now.getMonth(), 1), [now]);
  const monthEnd = useMemo(() => new Date(now.getFullYear(), now.getMonth() + 1, 1), [now]);

  const filteredTasks = useMemo(() => {
    let scoped = Array.isArray(tasks) ? tasks : [];

    if (selectedGoal !== 'all') {
      scoped = scoped.filter((task) => task.goalId === selectedGoal);
    }

    if (timeframe === 'overall') {
      return scoped;
    }

    return scoped.filter((task) => {
      if (!task.date) return false;
      const date = new Date(task.date);
      if (Number.isNaN(date.getTime())) return false;
      if (timeframe === 'week') {
        return date >= weekStart && date < weekEnd;
      }
      return date >= monthStart && date < monthEnd;
    });
  }, [tasks, selectedGoal, timeframe, weekStart, weekEnd, monthStart, monthEnd]);

  const filteredGoals = useMemo(() => {
    if (selectedGoal === 'all') return goals;
    return goals.filter((goal) => goal._id === selectedGoal);
  }, [goals, selectedGoal]);

  const dailyData = useMemo(
    () =>
      weekdays.map((day) => ({
        day: day.slice(0, 3),
        value: filteredTasks.filter((task) => {
          if (!task.completed || !task.date) return false;
          const d = new Date(task.date);
          const label = weekdays[d.getDay() === 0 ? 6 : d.getDay() - 1];
          return label === day;
        }).length
      })),
    [filteredTasks]
  );
  const maxDaily = useMemo(() => Math.max(1, ...dailyData.map((item) => item.value)), [dailyData]);

  const weeklyData = useMemo(() => {
    const buckets = new Map();
    for (const task of filteredTasks) {
      if (!task.date) continue;
      const d = new Date(task.date);
      if (Number.isNaN(d.getTime())) continue;
      if (d > todayStart) continue;
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
  }, [filteredTasks, todayStart]);

  const goalMap = useMemo(
    () =>
      Object.fromEntries(
        goals.map((goal) => [goal._id, goal.title])
      ),
    [goals]
  );

  const categoryData = useMemo(() => {
    const grouped = {};

    for (const task of filteredTasks) {
      if (selectedGoal !== 'all' && task.goalId !== selectedGoal) continue;
      const key = goalMap[task.goalId] || (selectedGoal === 'all' ? 'General' : 'Goal');
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
  }, [goalMap, filteredTasks, selectedGoal]);

  const goalProgressData = useMemo(() => {
    const grouped = {};

    for (const task of filteredTasks) {
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

    return filteredGoals
      .map((goal) => {
        const stats = grouped[goal._id] || { total: 0, completed: 0 };
        return {
          goal: goal.title,
          progress: stats.total ? Math.round((stats.completed / stats.total) * 100) : 0
        };
      })
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 8);
  }, [filteredGoals, filteredTasks]);

  const completionSummary = useMemo(() => {
    const completed = filteredTasks.filter((task) => task.completed).length;
    const total = filteredTasks.length;
    return total ? Math.round((completed / total) * 100) : 0;
  }, [filteredTasks]);

  const monthCount = useMemo(() => {
    const keys = new Set();
    for (const goal of filteredGoals) {
      if (goal.startDate) {
        keys.add(monthKey(new Date(goal.startDate)));
      }
      if (goal.endDate) {
        keys.add(monthKey(new Date(goal.endDate)));
      }
    }
    for (const task of filteredTasks) {
      if (!task.date) continue;
      keys.add(monthKey(new Date(task.date)));
    }
    return keys.size;
  }, [filteredGoals, filteredTasks]);

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="page-title">Analytics</h2>
          <p className="page-subtitle">Track productivity trends and execution performance from live backend data.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: 'overall', label: 'Overall' },
            { key: 'week', label: 'This Week' },
            { key: 'month', label: 'This Month' }
          ].map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setTimeframe(option.key)}
              className={[
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                timeframe === option.key
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              ].join(' ')}
            >
              {option.label}
            </button>
          ))}
          <label htmlFor="goal-filter" className="sr-only">
            Select goal
          </label>
          <select
            id="goal-filter"
            value={selectedGoal}
            onChange={(event) => setSelectedGoal(event.target.value)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All Goals</option>
            {goals.map((goal) => (
              <option key={goal._id} value={goal._id}>
                {goal.title}
              </option>
            ))}
          </select>
        </div>
      </section>

      {error ? <div className="surface-card p-4 text-sm text-rose-700">{error}</div> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ProgressCard
          title="Total Goals"
          value={filteredGoals.length}
          subtitle={selectedGoal === 'all' ? 'Goals in workspace' : 'Selected goal'}
          tone="blue"
        />
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
              <BarChart data={dailyData} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="dailyBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
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
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: '#e2e8f0',
                    fontSize: 12
                  }}
                  formatter={(value) => [`${value}`, 'Tasks']}
                />
                <Bar dataKey="value" fill="url(#dailyBarGradient)" radius={[10, 10, 6, 6]} barSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </GraphCard>

          <GraphCard title="Weekly progress" subtitle="Completion percentage" className="h-[340px]">
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
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: '#e2e8f0',
                    fontSize: 12
                  }}
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
          </GraphCard>

          <GraphCard title="Goal performance radar" subtitle="Completion percentage by goal" className="h-[380px]">
            {categoryData.length === 0 ? (
              <p className="text-sm text-slate-500">No data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="88%">
                <RadarChart data={categoryData} outerRadius="78%">
                  <defs>
                    <linearGradient id="goalRadar" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.15} />
                    </linearGradient>
                  </defs>
                  <PolarGrid radialLines={false} stroke="transparent" />
                  <PolarAngleAxis
                    dataKey="category"
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickFormatter={(value) => (String(value).length > 12 ? `${String(value).slice(0, 12)}...` : value)}
                  />
                  <PolarRadiusAxis
                    domain={[0, 100]}
                    tick={false}
                    axisLine={false}
                  />
                  <Radar
                    dataKey="value"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fill="url(#goalRadar)"
                    fillOpacity={1}
                    dot={{ r: 3.5, fill: '#fff', stroke: '#2563eb', strokeWidth: 2 }}
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
