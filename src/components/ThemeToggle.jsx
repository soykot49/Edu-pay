import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`flex items-center gap-1.5 rounded-chip border border-line bg-panel px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-teal-400/50 hover:text-teal-600 dark:border-dark-line dark:bg-dark-panel dark:text-dark-soft dark:hover:text-teal-400 ${className}`}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
    </button>
  )
}
