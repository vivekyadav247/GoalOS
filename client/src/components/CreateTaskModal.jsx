import { useEffect, useState } from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const defaultForm = {
  weekId: '',
  title: '',
  day: DAYS[0],
  category: ''
};

const CreateTaskModal = ({
  open,
  loading = false,
  initialValue = null,
  weekOptions = [],
  lockWeek = false,
  defaultWeekId = '',
  onClose,
  onSubmit
}) => {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (initialValue) {
      setForm({
        weekId: initialValue.weekId || defaultWeekId || weekOptions[0]?.value || '',
        title: initialValue.title || '',
        day: initialValue.day || DAYS[0],
        category: initialValue.category || ''
      });
      return;
    }

    setForm({
      ...defaultForm,
      weekId: defaultWeekId || weekOptions[0]?.value || ''
    });
  }, [open, initialValue, defaultWeekId, weekOptions]);

  if (!open) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      weekId: form.weekId,
      title: form.title.trim(),
      day: form.day,
      category: form.category.trim()
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
            <p className="mt-1 text-sm text-slate-500">Assign the task to a week and day.</p>
          </div>
          <button type="button" onClick={onClose} className="btn-secondary px-2.5 py-1.5 text-xs">
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Week</label>
            <select
              name="weekId"
              value={form.weekId}
              onChange={handleChange}
              className="input-base"
              disabled={lockWeek}
              required
            >
              {weekOptions.length === 0 ? <option value="">No weeks available</option> : null}
              {weekOptions.map((week) => (
                <option key={week.value} value={week.value}>
                  {week.label}
                </option>
              ))}
            </select>
          </div>

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

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Day</label>
              <select name="day" value={form.day} onChange={handleChange} className="input-base">
                {DAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Category</label>
              <input
                className="input-base"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Category"
              />
            </div>
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

