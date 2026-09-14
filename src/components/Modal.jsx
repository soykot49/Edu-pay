import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg animate-rise rounded-t-bento border border-line bg-panel p-6 shadow-bentoHover dark:border-dark-line dark:bg-dark-panel sm:rounded-bento">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink dark:text-dark-ink">{title}</h3>
          <button onClick={onClose} className="rounded-chip p-1.5 text-ink-faint hover:bg-line/50 hover:text-ink dark:text-dark-faint dark:hover:bg-dark-line/60 dark:hover:text-dark-ink" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
