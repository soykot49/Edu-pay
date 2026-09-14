import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, KeyRound, Lock, Mail, ShieldCheck, User } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from '../components/ThemeToggle'
import Modal from '../components/Modal'
import ThreeBackground from '../components/ThreeBackground'
import { IllustrationWelcome } from '../components/Illustrations'
import { submitPasswordResetRequest } from '../utils/firestore'

const inputClass =
  'w-full rounded-chip border border-line bg-paper px-3 py-2.5 pl-10 text-sm text-ink placeholder:text-ink-faint focus:border-teal-500 focus:bg-panel focus:outline-none dark:border-dark-line dark:bg-dark-bg dark:text-dark-ink dark:placeholder:text-dark-faint dark:focus:bg-dark-panel'

// Email and password get a visible label instead of placeholder text, so the
// box is genuinely blank until the person (or their browser's password
// manager) fills it in — nothing that could be mistaken for a pre-filled
// value sitting in the field.
function LabeledField({ icon: Icon, label, ...props }) {
  return (
    <div>
      <label htmlFor={props.id} className="mb-1 block text-xs font-medium text-ink-soft dark:text-dark-soft">
        {label}
      </label>
      <div className="relative">
        <Icon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint dark:text-dark-faint" />
        <input id={props.id} className={inputClass} {...props} />
      </div>
    </div>
  )
}

function Field({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      <Icon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint dark:text-dark-faint" />
      <input className={inputClass} {...props} />
    </div>
  )
}

const BLANK_FORM = { name: '', studentId: '', username: '', email: '', password: '', accessCode: '' }

export default function Login() {
  const [role, setRole] = useState('student')
  const [mode, setMode] = useState('login')
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState(BLANK_FORM)
  const [forgotOpen, setForgotOpen] = useState(false)
  const { user, profile, login, signupStudent, signupAdmin, resetPassword } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && profile) navigate(profile.role === 'admin' ? '/admin' : '/student', { replace: true })
  }, [user, profile, navigate])

  // Every time the person switches role or mode, wipe the form. Keeps the
  // form blank and avoids old email/password sitting around across tabs.
  useEffect(() => {
    setForm(BLANK_FORM)
  }, [role, mode])

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
    <div className="grid min-h-screen grid-cols-1 bg-paper dark:bg-dark-bg lg:grid-cols-2">
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
      <div className="relative flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="absolute right-5 top-5 sm:right-8 sm:top-8">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-chip bg-teal-50 text-teal-600 dark:bg-teal-400/10 dark:text-teal-400">
              <GraduationCap size={20} />
            </span>
            <span className="font-display text-lg font-semibold text-ink dark:text-dark-ink">EduPay</span>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-1 rounded-chip border border-line bg-line/20 p-1 dark:border-dark-line dark:bg-dark-line/20">
            <button
              onClick={() => setRole('student')}
              className={`rounded-[8px] py-2 text-sm font-medium transition-colors ${role === 'student' ? 'bg-panel text-ink shadow-sm dark:bg-dark-panel dark:text-dark-ink' : 'text-ink-faint dark:text-dark-faint'}`}
            >
              Student
            </button>
            <button
              onClick={() => setRole('admin')}
              className={`rounded-[8px] py-2 text-sm font-medium transition-colors ${role === 'admin' ? 'bg-panel text-ink shadow-sm dark:bg-dark-panel dark:text-dark-ink' : 'text-ink-faint dark:text-dark-faint'}`}
            >
              Admin / Developer
            </button>
          </div>

          <h2 className="font-display text-2xl font-semibold text-ink dark:text-dark-ink">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="mt-1 text-sm text-ink-faint dark:text-dark-faint">
            {role === 'student' ? 'Track your dues, payments and session history.' : 'Manage payments, income and site settings.'}
          </p>

          <form onSubmit={handleSubmit} autoComplete="on" className="mt-6 space-y-3">
            {mode === 'signup' && (
              <Field icon={User} placeholder="Full name" autoComplete="name" value={form.name} onChange={update('name')} required />
            )}
            {mode === 'signup' && role === 'student' && (
              <Field icon={KeyRound} placeholder="Student ID (e.g. STU-2026-014)" value={form.studentId} onChange={update('studentId')} required />
            )}
            {mode === 'signup' && role === 'admin' && (
              <Field icon={User} placeholder="Username" autoComplete="username" value={form.username} onChange={update('username')} required />
            )}

            <LabeledField
              id="email" icon={Mail} label="Email address" type="email"
              autoComplete="email" value={form.email} onChange={update('email')} required
            />
            <LabeledField
              id="password" icon={Lock} label="Password" type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={form.password} onChange={update('password')} required minLength={6}
            />

            {mode === 'login' && (
              <div className="flex justify-end">
                <button type="button" onClick={() => setForgotOpen(true)} className="text-xs font-medium text-teal-600 hover:underline dark:text-teal-400">
                  Forgot password?
                </button>
              </div>
            )}

            {mode === 'signup' && role === 'admin' && (
              <Field icon={ShieldCheck} placeholder="Admin access code (from site developer)" value={form.accessCode} onChange={update('accessCode')} />
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-2 w-full rounded-chip bg-ink py-2.5 text-sm font-semibold text-paper transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-dark-ink dark:text-dark-bg"
            >
              {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-faint dark:text-dark-faint">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="font-medium text-teal-600 hover:underline dark:text-teal-400"
            >
              {mode === 'login' ? 'Create one' : 'Log in'}
            </button>
          </p>
        </div>
      </div>

      <ForgotPasswordModal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        role={role}
        resetPassword={resetPassword}
      />
    </div>
  )
}

function ForgotPasswordModal({ open, onClose, role, resetPassword }) {
  const [email, setEmail] = useState('')
  const [studentId, setStudentId] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) { setEmail(''); setStudentId(''); setName('') }
  }, [open])

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      if (role === 'admin') {
        // Admins have no one above them to ask, so this is self-service via
        // Firebase's own reset flow.
        await resetPassword(email)
        toast.success('Reset link sent — check your email.')
      } else {
        // Students go through their admin, who reviews the request and
        // triggers the same official reset email on their behalf.
        await submitPasswordResetRequest({ name, email, studentId })
        toast.success("Request sent — your admin will email you a reset link shortly.")
      }
      onClose()
    } catch (err) {
      toast.error(err?.message || 'Could not process that request.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={role === 'admin' ? 'Reset your password' : 'Ask your admin for help'}>
      <form onSubmit={submit} className="space-y-3">
        <p className="text-sm text-ink-faint dark:text-dark-faint">
          {role === 'admin'
            ? "We'll email you a secure link to set a new password."
            : "Submit this and your admin will send you a secure reset link — no need to remember anything else right now."}
        </p>
        {role === 'student' && (
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft dark:text-dark-soft">Full name</label>
            <input
              required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full rounded-chip border border-line px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none dark:border-dark-line dark:bg-dark-bg dark:text-dark-ink"
            />
          </div>
        )}
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft dark:text-dark-soft">Account email</label>
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-chip border border-line px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none dark:border-dark-line dark:bg-dark-bg dark:text-dark-ink"
          />
        </div>
        {role === 'student' && (
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft dark:text-dark-soft">Student ID</label>
            <input
              required value={studentId} onChange={(e) => setStudentId(e.target.value)}
              className="w-full rounded-chip border border-line px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none dark:border-dark-line dark:bg-dark-bg dark:text-dark-ink"
            />
          </div>
        )}
        <button disabled={busy} className="w-full rounded-chip bg-teal-500 py-2.5 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-50">
          {busy ? 'Sending…' : role === 'admin' ? 'Send reset link' : 'Send request to admin'}
        </button>
      </form>
    </Modal>
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
