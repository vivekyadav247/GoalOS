import { useEffect, useState } from 'react';

const emptyForm = {
  title: '',
  category: '',
  description: '',
  startDate: '',
  endDate: ''
};

const toDateInput = (value) => {
  if (!value) {
    return '';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toISOString().slice(0, 10);
};

const CreateGoalModal = ({
  open,
  loading = false,
  initialValue = null,
  onClose,
  onSubmit
}) => {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!initialValue) {
      setForm(emptyForm);
      return;
    }

    setForm({
      title: initialValue.title || '',
      category: initialValue.category || '',
      description: initialValue.description || '',
      startDate: toDateInput(initialValue.startDate),
      endDate: toDateInput(initialValue.endDate)
    });
  }, [open, initialValue]);

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
      title: form.title.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      startDate: form.startDate || null,
      endDate: form.endDate || null
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="surface-card w-full max-w-xl p-5 sm:p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {initialValue ? 'Edit Goal' : 'Create Goal'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">Define the outcome and planning window.</p>
          </div>
          <button type="button" onClick={onClose} className="btn-secondary px-2.5 py-1.5 text-xs">
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="input-base"
            name="title"
            placeholder="Goal title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <input
            className="input-base"
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
          />

          <textarea
            className="input-base min-h-[96px]"
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="input-base"
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
            />
            <input
              className="input-base"
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : initialValue ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGoalModal;

