export default function Card({ children, className = '', title, subtitle, icon }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
          {icon && <span className="text-blue-600">{icon}</span>}
          <div>
            {title && <h3 className="text-base font-semibold text-slate-800">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}