import { useEffect, useState } from 'react';

const defaultForm = {
  title: '',
  date: '',
  goalId: ''
};

const EMPTY_GOAL_OPTIONS = [];

const isSameForm = (a, b) =>
  a.title === b.title && a.date === b.date && a.goalId === b.goalId;

const CreateTaskModal = ({
  open,
  loading = false,
  initialValue = null,
  goalOptions = EMPTY_GOAL_OPTIONS,
  requireGoal = false,
  onClose,
  onSubmit
}) => {
  const [form, setForm] = useState(defaultForm);
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    setDateError('');

    if (initialValue) {
      const nextForm = {
        title: initialValue.title || '',
        date: initialValue.date ? String(initialValue.date).slice(0, 10) : '',
        goalId: initialValue.goalId || ''
      };
      setForm((prev) => (isSameForm(prev, nextForm) ? prev : nextForm));
      return;
    }

    const nextForm = {
      ...defaultForm,
      goalId: goalOptions[0]?.value || ''
    };
    setForm((prev) => (isSameForm(prev, nextForm) ? prev : nextForm));
  }, [open, initialValue, goalOptions]);

  if (!open) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (form.date) {
      const today = new Date();
      const todayKey = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      )
        .toISOString()
        .slice(0, 10);

      if (form.date < todayKey) {
        setDateError('Tasks cannot be created for past dates');
        return;
      }
    }

    onSubmit({
      title: form.title.trim(),
      date: form.date || null,
      goalId: form.goalId || ''
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="surface-card w-full max-w-lg p-5 sm:p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {initialValue ? 'Edit Task' : 'Create Task'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">Assign the task to a goal and date.</p>
          </div>
          <button type="button" onClick={onClose} className="btn-secondary px-2.5 py-1.5 text-xs">
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Task title</label>
            <input
              className="input-base"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Task title"
              required
            />
          </div>

          {goalOptions.length > 0 ? (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Goal</label>
              <select
                className="input-base"
                name="goalId"
                value={form.goalId}
                onChange={handleChange}
                required={requireGoal}
              >
                {!requireGoal ? <option value="">No goal selected</option> : null}
                {goalOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Date</label>
            <input
              className="input-base"
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              min={new Date().toISOString().slice(0, 10)}
              required
            />
            {dateError ? (
              <p className="mt-1 text-xs text-rose-600">{dateError}</p>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : initialValue ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
