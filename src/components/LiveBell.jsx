import { useMemo, useState } from 'react'
import { Bell, CheckCircle2, Circle } from 'lucide-react'
import { formatCurrency, formatDate } from '../utils/emailReminder'
import { IllustrationEmpty } from './Illustrations'

// Live, sticky notification bell for the admin dashboard. Backed by a
// realtime Firestore listener (see AdminDashboard), so new student
// payment claims appear the instant they're written — no refresh needed.
export default function LiveBell({ notifications, onOpenTx }) {
  const [open, setOpen] = useState(false)
  const unread = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center gap-2 rounded-chip border border-line bg-panel px-3 py-2 text-sm font-medium text-ink-soft hover:border-teal-400/50 hover:text-teal-600"
        aria-label="Notifications"
      >
        <Bell size={16} />
        <span className="hidden sm:inline">Notifications</span>
        {unread > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[11px] font-semibold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[22rem] max-w-[90vw] overflow-hidden rounded-bento border border-line bg-panel shadow-bentoHover">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="font-display text-sm font-semibold text-ink">Live activity</p>
            <span className="flex items-center gap-1.5 text-xs text-teal-600">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-pulseDot rounded-full bg-teal-500" />
              </span>
              live
            </span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
                <IllustrationEmpty className="h-20 w-20" />
                <p className="text-sm text-ink-faint">No activity yet. New payment claims from students will show up here instantly.</p>
              </div>
            ) : (
              notifications.slice(0, 12).map((n) => (
                <button
                  key={n.id}
                  onClick={() => onOpenTx(n)}
                  className="flex w-full items-start gap-3 border-b border-line/70 px-4 py-3 text-left last:border-0 hover:bg-teal-50/60"
                >
                  {n.read ? (
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-teal-500" />
                  ) : (
                    <Circle size={16} className="mt-0.5 shrink-0 fill-amber-400 text-amber-400" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {n.studentName} <span className="font-normal text-ink-faint">· {n.studentId}</span>
                    </p>
                    <p className="text-xs text-ink-faint">
                      Claims payment of {formatCurrency(n.amount)} for {n.session || 'this session'}
                    </p>
                    <p className="mt-0.5 text-[11px] text-ink-faint/80">{formatDate(n.createdAt)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
