import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const Dropdown = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  className = '',
  buttonClassName = ''
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      window.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const selectedOption = options.find((option) => option.value === value) || null;

  return (
    <div ref={containerRef} className={['relative', className].join(' ')}>
      {label ? (
        <label className="mb-1 block text-xs font-medium text-slate-600">
          {label}
        </label>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={[
          'flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-800 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
          buttonClassName
        ].join(' ')}
      >
        <span className="truncate text-xs sm:text-sm">
          {selectedOption ? selectedOption.label : <span className="text-slate-400">{placeholder}</span>}
        </span>
        <ChevronDown
          className={[
            'ml-2 h-4 w-4 shrink-0 text-slate-400 transition-transform',
            open ? 'rotate-180' : 'rotate-0'
          ].join(' ')}
          aria-hidden="true"
        />
      </button>

      <div
        className={[
          'absolute left-0 right-0 mt-1 origin-top rounded-xl border border-slate-200 bg-white text-sm shadow-lg ring-1 ring-slate-900/5 transition',
          'max-h-60 overflow-y-auto',
          'z-40',
          open ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
        ].join(' ')}
      >
        {options.length === 0 ? (
          <div className="px-3 py-2 text-xs text-slate-400">No options</div>
        ) : (
          options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange?.(option.value);
                setOpen(false);
              }}
              className={[
                'flex w-full items-center justify-between px-3 py-2 text-xs sm:text-sm text-slate-700 transition',
                value === option.value
                  ? 'bg-blue-50 text-blue-700'
                  : 'hover:bg-slate-50 hover:text-slate-900'
              ].join(' ')}
            >
              <span className="truncate">{option.label}</span>
              {option.badge ? (
                <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                  {option.badge}
                </span>
              ) : null}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default Dropdown;

