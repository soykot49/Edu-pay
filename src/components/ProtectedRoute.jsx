import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ role, children }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
          <p className="text-sm text-ink-faint">Loading your dashboard…</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) return <Navigate to="/" replace />
  if (role && profile.role !== role) return <Navigate to="/" replace />
  return children
}
