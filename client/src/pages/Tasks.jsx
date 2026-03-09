import { useMemo, useState } from 'react';
import TaskItem from '../components/TaskItem';
import GraphCard from '../components/GraphCard';
import CreateTaskModal from '../components/CreateTaskModal';
import { getApiErrorMessage, taskApi } from '../services/api';
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

const Tasks = () => {
  const {
    months,
    weeks,
    weeksByMonth,
    tasks,
    loading,
    error,
    refresh
  } = usePlannerData();

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalLoading, setTaskModalLoading] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [busyTaskId, setBusyTaskId] = useState('');
  const [actionError, setActionError] = useState('');

  const sortedMonths = useMemo(
    () => [...months].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [months]
  );

  const sortedWeeks = useMemo(
    () => [...weeks].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [weeks]
  );

  const currentMonthId = sortedMonths[0]?._id || '';
  const currentWeekId = sortedWeeks[0]?._id || '';
  const monthWeekIds = (weeksByMonth[currentMonthId] || []).map((week) => week._id);

  const todayName = useMemo(
    () => normalizeDay(new Date().toLocaleDateString(undefined, { weekday: 'long' })),
    []
  );

  const grouped = useMemo(() => {
    const today = [];
    const thisWeek = [];
    const thisMonth = [];

    for (const task of tasks) {
      if (task.weekId === currentWeekId && normalizeDay(task.day) === todayName) {
        today.push(task);
        continue;
      }

      if (task.weekId === currentWeekId) {
        thisWeek.push(task);
        continue;
      }

      if (monthWeekIds.includes(task.weekId)) {
        thisMonth.push(task);
      }
    }

    return {
      today,
      thisWeek,
      thisMonth
    };
  }, [tasks, currentWeekId, monthWeekIds, todayName]);

  const weekOptions = useMemo(() => {
    const monthById = Object.fromEntries(months.map((month) => [month._id, month.monthName]));

    return weeks
      .map((week) => ({
        value: week._id,
        label: `${monthById[week.monthId] || 'Month'} • Week ${week.weekNumber}`
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [months, weeks]);

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
    const confirmed = window.confirm('Delete this task?');
    if (!confirmed) {
      return;
    }

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
        await taskApi.update(editingTask._id, payload);
      } else {
        await taskApi.create(payload);
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
        <section className="grid gap-4 xl:grid-cols-3">
          {sections.map((section) => (
            <GraphCard
              key={section.key}
              title={section.title}
              subtitle={`${section.items.filter((task) => task.completed).length}/${section.items.length} completed`}
            >
              <div className="space-y-2">
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
                      onDelete={() => handleDeleteTask(task._id)}
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
        weekOptions={weekOptions}
        defaultWeekId={editingTask?.weekId || currentWeekId}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
      />
    </div>
  );
};

export default Tasks;

