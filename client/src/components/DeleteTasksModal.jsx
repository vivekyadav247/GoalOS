import { useEffect, useMemo, useState } from 'react';

const startOfWeek = (date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - (day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatMonthLabel = (date) =>
  date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

const formatDateLabel = (date) =>
  date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

const formatWeekLabel = (date) => {
  const start = startOfWeek(date);
  return `Week of ${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
};

const DeleteTasksModal = ({
  open,
  tasks = [],
  loading = false,
  onClose,
  onConfirm
}) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');

  const deletableTasks = useMemo(
    () => tasks.filter((task) => !task?.completed),
    [tasks]
  );

  const groupedTasks = useMemo(() => {
    const groups = new Map();
    const sorted = [...deletableTasks].sort((a, b) => {
      const aDate = a?.date ? new Date(a.date) : new Date(0);
      const bDate = b?.date ? new Date(b.date) : new Date(0);
      return aDate - bDate;
    });

    for (const task of sorted) {
      const dateValue = task?.date ? new Date(task.date) : null;
      const monthKey = dateValue && !Number.isNaN(dateValue.getTime())
        ? `${dateValue.getFullYear()}-${String(dateValue.getMonth() + 1).padStart(2, '0')}`
        : 'no-date';
      const monthLabel = dateValue && !Number.isNaN(dateValue.getTime())
        ? formatMonthLabel(dateValue)
        : 'No date';

      if (!groups.has(monthKey)) {
        groups.set(monthKey, { key: monthKey, label: monthLabel, tasks: [] });
      }

      groups.get(monthKey).tasks.push({
        ...task,
        dateLabel: dateValue && !Number.isNaN(dateValue.getTime())
          ? formatDateLabel(dateValue)
          : 'No date',
        weekLabel: dateValue && !Number.isNaN(dateValue.getTime())
          ? formatWeekLabel(dateValue)
          : 'No week'
      });
    }

    return Array.from(groups.values());
  }, [deletableTasks]);

  const monthOptions = useMemo(
    () =>
      groupedTasks.map((group) => ({
        value: group.key,
        label: group.label
      })),
    [groupedTasks]
  );

  const visibleGroups = useMemo(() => {
    if (!selectedMonth) {
      return groupedTasks;
    }
    return groupedTasks.filter((group) => group.key === selectedMonth);
  }, [groupedTasks, selectedMonth]);

  const selectedCount = selectedIds.length;
  const totalCount = deletableTasks.length;
  const blockedCount = Math.max(0, tasks.length - deletableTasks.length);

  useEffect(() => {
    if (!open) {
      return;
    }
    setSelectedIds([]);
    setSelectedMonth('');
  }, [open, tasks.length]);

  if (!open) {
    return null;
  }

  const toggleSelection = (taskId) => {
    setSelectedIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleMonthChange = (event) => {
    const value = event.target.value;
    setSelectedMonth(value);

    if (!value) {
      setSelectedIds([]);
      return;
    }

    const monthTaskIds = deletableTasks
      .filter((task) => {
        if (!task?.date) {
          return value === 'no-date';
        }
        const date = new Date(task.date);
        if (Number.isNaN(date.getTime())) {
          return value === 'no-date';
        }
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return key === value;
      })
      .map((task) => task._id);

    setSelectedIds(monthTaskIds);
  };

  const handleSelectAll = () => {
    setSelectedIds(deletableTasks.map((task) => task._id));
  };

  const handleClearAll = () => {
    setSelectedIds([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="surface-card w-full max-w-2xl p-5 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Delete tasks</h3>
            <p className="mt-1 text-sm text-slate-500">
              Select tasks to delete. They will be removed from their month and week automatically.
            </p>
          </div>
          <button type="button" onClick={onClose} className="btn-secondary px-2.5 py-1.5 text-xs">
            Close
          </button>
        </div>

        {blockedCount > 0 ? (
          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            {blockedCount} completed task{blockedCount > 1 ? 's' : ''} hidden. Completed tasks cannot be deleted.
          </div>
        ) : null}

        {totalCount === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-600">
            No deletable tasks found.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Select month</label>
                <select
                  className="input-base"
                  value={selectedMonth}
                  onChange={handleMonthChange}
                >
                  <option value="">Choose a month</option>
                  {monthOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-xs text-slate-500">
                {selectedMonth ? 'Month selected' : 'Select a month to auto-pick tasks'}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span>
                {selectedCount} selected of {totalCount}
              </span>
              <div className="flex items-center gap-2">
                <button type="button" className="btn-secondary px-2.5 py-1 text-xs" onClick={handleSelectAll}>
                  Select all
                </button>
                <button type="button" className="btn-secondary px-2.5 py-1 text-xs" onClick={handleClearAll}>
                  Clear
                </button>
              </div>
            </div>

            <div className="max-h-[420px] space-y-4 overflow-y-auto pr-1">
              {visibleGroups.map((group) => (
                <div key={group.key} className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {group.label}
                  </p>
                  <div className="space-y-2">
                    {group.tasks.map((task) => (
                      <label
                        key={task._id}
                        className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
                      >
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 accent-rose-500"
                          checked={selectedIds.includes(task._id)}
                          onChange={() => toggleSelection(task._id)}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-800">{task.title || 'Untitled task'}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {task.dateLabel} · {task.weekLabel}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-4">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading || selectedCount === 0}
            onClick={() => onConfirm(selectedIds)}
          >
            {loading ? 'Deleting...' : `Delete ${selectedCount || ''}`.trim()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteTasksModal;
