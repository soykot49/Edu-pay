import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, KeyRound, Lock, Mail, ShieldCheck, User } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import ThreeBackground from '../components/ThreeBackground'
import { IllustrationWelcome } from '../components/Illustrations'

const inputClass =
  'w-full rounded-chip border border-line bg-paper px-3 py-2.5 pl-10 text-sm text-ink placeholder:text-ink-faint focus:border-teal-500 focus:bg-panel focus:outline-none'

function Field({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      <Icon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
      <input className={inputClass} {...props} />
    </div>
  )
}

export default function Login() {
  const [role, setRole] = useState('student')
  const [mode, setMode] = useState('login')
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ name: '', studentId: '', username: '', email: '', password: '', accessCode: '' })
  const { user, profile, login, signupStudent, signupAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && profile) navigate(profile.role === 'admin' ? '/admin' : '/student', { replace: true })
  }, [user, profile, navigate])

  function update(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
        toast.success('Welcome back!')
      } else if (role === 'student') {
        await signupStudent({ name: form.name, studentId: form.studentId, email: form.email, password: form.password })
        toast.success('Account created — welcome to EduPay!')
      } else {
        await signupAdmin({ name: form.name, username: form.username, email: form.email, password: form.password, accessCode: form.accessCode })
        toast.success('Admin account created!')
      }
    } catch (err) {
      toast.error(humanizeError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Hero */}
      <div className="relative hidden overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-between lg:p-12">
        <ThreeBackground />
        <div className="relative z-10 flex items-center gap-2 text-paper">
          <span className="flex h-9 w-9 items-center justify-center rounded-chip bg-paper/10">
            <GraduationCap size={20} />
          </span>
          <span className="font-display text-lg font-semibold">EduPay</span>
        </div>
        <div className="relative z-10 max-w-md">
          <IllustrationWelcome className="mb-6 h-28 w-28" />
          <h2 className="font-display text-3xl font-semibold leading-tight text-paper">
            One clear ledger for every student's fees.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-paper/60">
            Students see exactly what's paid and what's due, by session. Admins get live payment
            activity, yearly income and costing, and profit at a glance — no spreadsheets.
          </p>
        </div>
        <p className="relative z-10 text-xs text-paper/40">Built for institutions of any size.</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-chip bg-teal-50 text-teal-600">
              <GraduationCap size={20} />
            </span>
            <span className="font-display text-lg font-semibold text-ink">EduPay</span>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-1 rounded-chip border border-line bg-line/20 p-1">
            <button
              onClick={() => setRole('student')}
              className={`rounded-[8px] py-2 text-sm font-medium transition-colors ${role === 'student' ? 'bg-panel text-ink shadow-sm' : 'text-ink-faint'}`}
            >
              Student
            </button>
            <button
              onClick={() => setRole('admin')}
              className={`rounded-[8px] py-2 text-sm font-medium transition-colors ${role === 'admin' ? 'bg-panel text-ink shadow-sm' : 'text-ink-faint'}`}
            >
              Admin / Developer
            </button>
          </div>

          <h2 className="font-display text-2xl font-semibold text-ink">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="mt-1 text-sm text-ink-faint">
            {role === 'student' ? 'Track your dues, payments and session history.' : 'Manage payments, income and site settings.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            {mode === 'signup' && (
              <Field icon={User} placeholder="Full name" value={form.name} onChange={update('name')} required />
            )}
            {mode === 'signup' && role === 'student' && (
              <Field icon={KeyRound} placeholder="Student ID (e.g. STU-2026-014)" value={form.studentId} onChange={update('studentId')} required />
            )}
            {mode === 'signup' && role === 'admin' && (
              <Field icon={User} placeholder="Username" value={form.username} onChange={update('username')} required />
            )}
            <Field icon={Mail} type="email" placeholder="Email address" value={form.email} onChange={update('email')} required />
            <Field icon={Lock} type="password" placeholder="Password" value={form.password} onChange={update('password')} required minLength={6} />
            {mode === 'signup' && role === 'admin' && (
              <Field icon={ShieldCheck} placeholder="Admin access code (from site developer)" value={form.accessCode} onChange={update('accessCode')} />
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-2 w-full rounded-chip bg-ink py-2.5 text-sm font-semibold text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-faint">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="font-medium text-teal-600 hover:underline"
            >
              {mode === 'login' ? 'Create one' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

function humanizeError(err) {
  const code = err?.code || ''
  if (code.includes('user-not-found') || code.includes('invalid-credential')) return 'No account matches that email and password.'
  if (code.includes('wrong-password')) return 'Incorrect password.'
  if (code.includes('email-already-in-use')) return 'That email already has an account — try logging in instead.'
  if (code.includes('weak-password')) return 'Password should be at least 6 characters.'
  return err?.message || 'Something went wrong. Please try again.'
}
