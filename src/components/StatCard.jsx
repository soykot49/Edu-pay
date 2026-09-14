export default function StatCard({ icon: Icon, label, value, tone = 'ink', hint, className = '' }) {
  const toneMap = {
    ink: 'text-ink bg-ink/5',
    teal: 'text-teal-600 bg-teal-50',
    amber: 'text-amber-600 bg-amber-50',
    rose: 'text-rose-500 bg-rose-50',
  }
  return (
    <div className={`bento-card flex flex-col justify-between p-5 sm:p-6 animate-rise ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-faint">{label}</p>
        {Icon && (
          <span className={`flex h-9 w-9 items-center justify-center rounded-chip ${toneMap[tone]}`}>
            <Icon size={18} strokeWidth={2} />
          </span>
        )}
      </div>
      <p className="mt-4 font-display text-2xl font-semibold text-ink sm:text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-faint">{hint}</p>}
    </div>
  )
}
