const GraphCard = ({ title, subtitle, actions, children, className = '' }) => {
  return (
    <section className={["surface-card p-4 md:p-5", className].join(' ')}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 md:text-base">{title}</h3>
          {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
};

export default GraphCard;

