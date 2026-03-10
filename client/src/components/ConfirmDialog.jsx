const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel
}) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="surface-card w-full max-w-md p-5 md:p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {message ? <p className="mt-2 text-sm text-slate-600">{message}</p> : null}
        </div>

        <div className="flex items-center justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
