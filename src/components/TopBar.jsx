import { LogOut, Menu } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function TopBar({ title, subtitle, right, onMenuClick }) {
  const { profile, logout } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 min-w-0">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="rounded-chip p-2 text-ink-soft hover:bg-line/40 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="truncate font-display text-lg font-semibold leading-tight text-ink sm:text-xl">
              {title}
            </h1>
            {subtitle && <p className="truncate text-xs text-ink-faint sm:text-sm">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {right}
          <div className="hidden items-center gap-2 rounded-chip border border-line bg-panel px-3 py-1.5 sm:flex">
            <span className="h-7 w-7 shrink-0 rounded-full bg-teal-500/10 text-center text-sm font-semibold leading-7 text-teal-600">
              {(profile?.name || '?').charAt(0).toUpperCase()}
            </span>
            <span className="max-w-[9rem] truncate text-sm font-medium text-ink">{profile?.name}</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-chip border border-line bg-panel px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-rose-400/50 hover:text-rose-500"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  )
}
