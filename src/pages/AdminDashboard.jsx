import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import {
  Bar, BarChart, CartesianGrid, Legend, Line, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import {
  BadgeDollarSign, CheckCircle2, ClipboardList, LayoutGrid, Mail, PlusCircle,
  Receipt, Search, TrendingUp, Users, Wallet2,
} from 'lucide-react'
import TopBar from '../components/TopBar'
import StatCard from '../components/StatCard'
import Modal from '../components/Modal'
import LiveBell from '../components/LiveBell'
import { IllustrationEmpty } from '../components/Illustrations'
import {
  addCost, addDue, confirmPendingPayment, listenCosts, listenNotifications,
  listenStudents, listenTransactions, markNotificationRead, recordPaymentByAdmin, setLastReminder,
} from '../utils/firestore'
import { formatCurrency, formatDate, sendDueReminder } from '../utils/emailReminder'

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'reports', label: 'Reports', icon: TrendingUp },
]

const REMINDER_THRESHOLD = Number(import.meta.env.VITE_DUE_ALERT_THRESHOLD || 2000)

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview')
  const [students, setStudents] = useState([])
  const [txs, setTxs] = useState([])
  const [notifications, setNotifications] = useState([])
  const [costs, setCosts] = useState([])
  const [dueModal, setDueModal] = useState(null) // student or null
  const [payModal, setPayModal] = useState(null)
  const [costModalOpen, setCostModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [remindedOnce, setRemindedOnce] = useState(false)

  useEffect(() => {
    const u1 = listenStudents(setStudents)
    const u2 = listenTransactions(setTxs)
    const u3 = listenNotifications((list) => {
      setNotifications((prev) => {
        if (prev.length && list.length && list[0].id !== prev[0]?.id && !list[0].read) {
          toast.info(`${list[0].studentName} claims a payment of ${formatCurrency(list[0].amount)}`, { icon: '💳' })
        }
        return list
      })
    })
    const u4 = listenCosts(setCosts)
    return () => { u1(); u2(); u3(); u4() }
  }, [])

  // One gentle automatic pass per admin session: email students who are well
  // over the due threshold and haven't been reminded in the last 7 days.
  useEffect(() => {
    if (remindedOnce || students.length === 0) return
    setRemindedOnce(true)
    const now = Date.now()
    const overdue = students.filter((s) => {
      const outstanding = (s.totalDue || 0) - (s.totalPaid || 0)
      if (outstanding < REMINDER_THRESHOLD) return false
      const last = s.lastReminderAt?.toDate ? s.lastReminderAt.toDate().getTime() : 0
      return now - last > 7 * 24 * 60 * 60 * 1000
    })
    overdue.forEach(async (s) => {
      try {
        await sendDueReminder({ name: s.name, email: s.email, studentId: s.studentId, dueAmount: (s.totalDue || 0) - (s.totalPaid || 0), session: s.currentSession })
        await setLastReminder(s.id)
      } catch {
        // EmailJS likely not configured yet — silent no-op so the dashboard still works.
      }
    })
  }, [students, remindedOnce])

  const pending = useMemo(() => txs.filter((t) => t.type === 'payment' && t.status === 'pending'), [txs])
  const totalIncome = useMemo(() => txs.filter((t) => t.type === 'payment' && t.status === 'confirmed').reduce((s, t) => s + t.amount, 0), [txs])
  const totalOutstanding = useMemo(() => students.reduce((s, st) => s + Math.max((st.totalDue || 0) - (st.totalPaid || 0), 0), 0), [students])

  async function handleConfirm(tx) {
    try {
      await confirmPendingPayment({ txId: tx.id, studentUid: tx.studentUid, amount: tx.amount })
      const notif = notifications.find((n) => n.txId === tx.id)
      if (notif) await markNotificationRead(notif.id)
      toast.success(`Confirmed ${formatCurrency(tx.amount)} from ${tx.studentName}`)
    } catch (err) {
      toast.error(err.message || 'Could not confirm payment.')
    }
  }

  function openNotification(n) {
    const tx = txs.find((t) => t.id === n.txId)
    if (tx) setPayModal({ ...tx, confirmOnly: true })
  }

  const filteredStudents = students.filter((s) =>
    (s.name || '').toLowerCase().includes(search.toLowerCase()) || (s.studentId || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-paper lg:flex">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-line bg-panel/60 lg:block">
        <div className="flex h-16 items-center gap-2 border-b border-line px-6">
          <span className="flex h-8 w-8 items-center justify-center rounded-chip bg-teal-50 text-teal-600"><Wallet2 size={17} /></span>
          <span className="font-display text-base font-semibold text-ink">EduPay Admin</span>
        </div>
        <nav className="space-y-1 p-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex w-full items-center gap-2.5 rounded-chip px-3 py-2.5 text-sm font-medium transition-colors ${
                tab === t.id ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-line/40'
              }`}
            >
              <t.icon size={17} />
              {t.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <TopBar
          title="Admin dashboard"
          subtitle={`${students.length} students · ${pending.length} awaiting confirmation`}
          right={<LiveBell notifications={notifications} onOpenTx={openNotification} />}
        />

        {/* Mobile tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-line bg-panel px-4 py-2 lg:hidden">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-chip px-3 py-1.5 text-sm font-medium ${tab === t.id ? 'bg-ink text-paper' : 'text-ink-soft'}`}
            >
              <t.icon size={15} />{t.label}
            </button>
          ))}
        </div>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {tab === 'overview' && (
            <OverviewTab
              students={students} totalIncome={totalIncome} totalOutstanding={totalOutstanding}
              pending={pending} txs={txs} onConfirm={handleConfirm}
            />
          )}
          {tab === 'students' && (
            <StudentsTab
              students={filteredStudents} search={search} setSearch={setSearch}
              onAddDue={setDueModal} onRecordPayment={setPayModal}
            />
          )}
          {tab === 'reports' && <ReportsTab txs={txs} costs={costs} onAddCost={() => setCostModalOpen(true)} />}
        </main>
      </div>

      <AddDueModal student={dueModal} onClose={() => setDueModal(null)} />
      <RecordPaymentModal tx={payModal} onClose={() => setPayModal(null)} onConfirm={handleConfirm} />
      <AddCostModal open={costModalOpen} onClose={() => setCostModalOpen(false)} />
    </div>
  )
}

function OverviewTab({ students, totalIncome, totalOutstanding, pending, txs, onConfirm }) {
  const recent = txs.slice(0, 8)
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Active students" value={students.length} tone="ink" />
        <StatCard icon={BadgeDollarSign} label="Confirmed income" value={formatCurrency(totalIncome)} tone="teal" />
        <StatCard icon={Wallet2} label="Total outstanding" value={formatCurrency(totalOutstanding)} tone="rose" />
        <StatCard icon={ClipboardList} label="Awaiting confirmation" value={pending.length} tone="amber" hint="Student-claimed payments" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="bento-card p-5 sm:p-6 lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-ink">Awaiting confirmation</h3>
            <span className="text-xs text-ink-faint">{pending.length} pending</span>
          </div>
          {pending.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <IllustrationEmpty className="h-20 w-20" />
              <p className="text-sm text-ink-faint">Nothing waiting on you right now.</p>
            </div>
          ) : (
            <ul className="divide-y divide-line/70">
              {pending.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{t.studentName} <span className="text-ink-faint">· {t.studentId}</span></p>
                    <p className="text-xs text-ink-faint">{t.session || 'No session noted'} · {formatDate(t.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-display text-sm font-semibold text-ink">{formatCurrency(t.amount)}</span>
                    <button onClick={() => onConfirm(t)} className="rounded-chip bg-teal-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-600">
                      Confirm
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bento-card p-5 sm:p-6 lg:col-span-2">
          <h3 className="mb-3 font-display text-base font-semibold text-ink">Recent activity</h3>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-faint">No activity yet.</p>
          ) : (
            <ul className="space-y-3">
              {recent.map((t) => (
                <li key={t.id} className="flex items-start gap-2.5 text-sm">
                  <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${t.type === 'due' ? 'bg-rose-400' : t.status === 'pending' ? 'bg-amber-400' : 'bg-teal-500'}`} />
                  <div className="min-w-0">
                    <p className="truncate text-ink-soft">
                      <span className="font-medium text-ink">{t.studentName}</span>{' '}
                      {t.type === 'due' ? 'was invoiced' : t.status === 'pending' ? 'claims a payment of' : 'paid'} {formatCurrency(t.amount)}
                    </p>
                    <p className="text-xs text-ink-faint">{formatDate(t.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function StudentsTab({ students, search, setSearch, onAddDue, onRecordPayment }) {
  return (
    <div className="bento-card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <h3 className="font-display text-base font-semibold text-ink">Students</h3>
        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or ID"
            className="w-full rounded-chip border border-line bg-paper py-2 pl-9 pr-3 text-sm focus:border-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {students.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-14 text-center">
          <IllustrationEmpty />
          <p className="text-sm text-ink-faint">No students match yet — they'll appear once they sign up.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="text-xs text-ink-faint">
                <th className="px-5 py-3 font-medium sm:px-6">Student</th>
                <th className="px-5 py-3 font-medium sm:px-6">Session</th>
                <th className="px-5 py-3 text-right font-medium sm:px-6">Due</th>
                <th className="px-5 py-3 text-right font-medium sm:px-6">Paid</th>
                <th className="px-5 py-3 text-right font-medium sm:px-6">Outstanding</th>
                <th className="px-5 py-3 text-right font-medium sm:px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const outstanding = Math.max((s.totalDue || 0) - (s.totalPaid || 0), 0)
                return (
                  <tr key={s.id} className="border-t border-line/70">
                    <td className="px-5 py-3.5 sm:px-6">
                      <p className="font-medium text-ink">{s.name}</p>
                      <p className="text-xs text-ink-faint">{s.studentId} · {s.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-ink-soft sm:px-6">{s.currentSession || '—'}</td>
                    <td className="px-5 py-3.5 text-right text-ink-soft sm:px-6">{formatCurrency(s.totalDue)}</td>
                    <td className="px-5 py-3.5 text-right text-ink-soft sm:px-6">{formatCurrency(s.totalPaid)}</td>
                    <td className={`px-5 py-3.5 text-right font-medium sm:px-6 ${outstanding > 0 ? 'text-rose-500' : 'text-teal-600'}`}>{formatCurrency(outstanding)}</td>
                    <td className="px-5 py-3.5 sm:px-6">
                      <div className="flex justify-end gap-1.5">
                        <IconAction label="Add due" onClick={() => onAddDue(s)} icon={Receipt} />
                        <IconAction label="Record payment" onClick={() => onRecordPayment({ student: s })} icon={PlusCircle} />
                        <IconAction
                          label="Email reminder"
                          icon={Mail}
                          onClick={async () => {
                            try {
                              await sendDueReminder({ name: s.name, email: s.email, studentId: s.studentId, dueAmount: outstanding, session: s.currentSession })
                              await setLastReminder(s.id)
                              toast.success(`Reminder sent to ${s.name}`)
                            } catch (err) {
                              toast.error(err.message)
                            }
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function IconAction({ label, icon: Icon, onClick }) {
  return (
    <button onClick={onClick} title={label} aria-label={label} className="rounded-chip border border-line p-2 text-ink-faint hover:border-teal-400/60 hover:text-teal-600">
      <Icon size={15} />
    </button>
  )
}

function ReportsTab({ txs, costs, onAddCost }) {
  const byYear = useMemo(() => {
    const map = {}
    txs.filter((t) => t.type === 'payment' && t.status === 'confirmed').forEach((t) => {
      const year = t.createdAt?.toDate ? t.createdAt.toDate().getFullYear() : new Date().getFullYear()
      map[year] = map[year] || { year: String(year), income: 0, cost: 0 }
      map[year].income += t.amount
    })
    costs.forEach((c) => {
      const year = c.year || new Date(c.date).getFullYear()
      map[year] = map[year] || { year: String(year), income: 0, cost: 0 }
      map[year].cost += c.amount
    })
    return Object.values(map).sort((a, b) => a.year.localeCompare(b.year)).map((r) => ({ ...r, profit: r.income - r.cost }))
  }, [txs, costs])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Yearly income vs. costing">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byYear}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EFEDE3" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#7C8394' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#7C8394' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E7E5DD', fontSize: 13 }} formatter={(v) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="income" name="Income" fill="#1F8A70" radius={[6, 6, 0, 0]} />
              <Bar dataKey="cost" name="Costing" fill="#E2A73E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Profit trend">
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={byYear}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EFEDE3" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#7C8394' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#7C8394' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E7E5DD', fontSize: 13 }} formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="profit" name="Profit" fill="#161A23" radius={[6, 6, 0, 0]} barSize={28} />
              <Line type="monotone" dataKey="profit" stroke="#1F8A70" strokeWidth={2} dot={{ r: 4 }} name="Trend" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="bento-card p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-ink">Institutional costs</h3>
          <button onClick={onAddCost} className="flex items-center gap-1.5 rounded-chip bg-ink px-3 py-2 text-xs font-semibold text-paper hover:opacity-90">
            <PlusCircle size={14} /> Add cost
          </button>
        </div>
        {costs.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-faint">No costs logged yet — add salaries, utilities, materials and more to see true profit.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="text-xs text-ink-faint">
                  <th className="py-2 font-medium">Title</th>
                  <th className="py-2 font-medium">Category</th>
                  <th className="py-2 font-medium">Date</th>
                  <th className="py-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {costs.map((c) => (
                  <tr key={c.id} className="border-t border-line/70">
                    <td className="py-2.5 text-ink">{c.title}</td>
                    <td className="py-2.5 text-ink-soft">{c.category}</td>
                    <td className="py-2.5 text-ink-soft">{c.date}</td>
                    <td className="py-2.5 text-right font-medium text-ink">{formatCurrency(c.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="bento-card p-5 sm:p-6">
      <h3 className="mb-2 font-display text-base font-semibold text-ink">{title}</h3>
      {children}
    </div>
  )
}

function AddDueModal({ student, onClose }) {
  const [form, setForm] = useState({ amount: '', session: '', note: '' })
  const [busy, setBusy] = useState(false)
  useEffect(() => { if (student) setForm({ amount: '', session: student.currentSession || '', note: '' }) }, [student])

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await addDue({ studentUid: student.id, studentId: student.studentId, studentName: student.name, amount: Number(form.amount), session: form.session, note: form.note })
      toast.success(`Added ${formatCurrency(form.amount)} due for ${student.name}`)
      onClose()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={!!student} onClose={onClose} title={`Add due — ${student?.name || ''}`}>
      <form onSubmit={submit} className="space-y-3">
        <LabeledInput label="Amount" type="number" min="1" required value={form.amount} onChange={(v) => setForm((f) => ({ ...f, amount: v }))} />
        <LabeledInput label="Session" required value={form.session} onChange={(v) => setForm((f) => ({ ...f, session: v }))} placeholder="e.g. Spring 2026" />
        <LabeledInput label="Note (optional)" value={form.note} onChange={(v) => setForm((f) => ({ ...f, note: v }))} placeholder="e.g. Tuition, 3rd installment" />
        <button disabled={busy} className="w-full rounded-chip bg-ink py-2.5 text-sm font-semibold text-paper hover:opacity-90 disabled:opacity-50">
          {busy ? 'Adding…' : 'Add due'}
        </button>
      </form>
    </Modal>
  )
}

function RecordPaymentModal({ tx, onClose, onConfirm }) {
  const [form, setForm] = useState({ amount: '', session: '', note: '' })
  const [busy, setBusy] = useState(false)
  const student = tx?.student
  useEffect(() => { if (student) setForm({ amount: '', session: student.currentSession || '', note: '' }) }, [student])

  if (tx?.confirmOnly) {
    return (
      <Modal open={!!tx} onClose={onClose} title="Confirm student payment">
        <div className="space-y-3 text-sm">
          <p className="text-ink-soft">
            <span className="font-medium text-ink">{tx.studentName}</span> ({tx.studentId}) claims a payment of{' '}
            <span className="font-semibold text-ink">{formatCurrency(tx.amount)}</span> for {tx.session || 'this session'}.
          </p>
          {tx.note && <p className="rounded-chip bg-paper p-3 text-ink-faint">Note: {tx.note}</p>}
          <button
            onClick={async () => { await onConfirm(tx); onClose() }}
            className="w-full rounded-chip bg-teal-500 py-2.5 text-sm font-semibold text-white hover:bg-teal-600"
          >
            Confirm payment
          </button>
        </div>
      </Modal>
    )
  }

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await recordPaymentByAdmin({ studentUid: student.id, studentId: student.studentId, studentName: student.name, amount: Number(form.amount), session: form.session, note: form.note })
      toast.success(`Recorded ${formatCurrency(form.amount)} from ${student.name}`)
      onClose()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={!!tx && !tx.confirmOnly} onClose={onClose} title={`Record payment — ${student?.name || ''}`}>
      <form onSubmit={submit} className="space-y-3">
        <LabeledInput label="Amount received" type="number" min="1" required value={form.amount} onChange={(v) => setForm((f) => ({ ...f, amount: v }))} />
        <LabeledInput label="Session" required value={form.session} onChange={(v) => setForm((f) => ({ ...f, session: v }))} placeholder="e.g. Spring 2026" />
        <LabeledInput label="Note (optional)" value={form.note} onChange={(v) => setForm((f) => ({ ...f, note: v }))} placeholder="e.g. Cash at front desk" />
        <button disabled={busy} className="w-full rounded-chip bg-teal-500 py-2.5 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-50">
          {busy ? 'Saving…' : 'Record payment'}
        </button>
      </form>
    </Modal>
  )
}

function AddCostModal({ open, onClose }) {
  const [form, setForm] = useState({ title: '', category: 'Salaries', amount: '', date: new Date().toISOString().slice(0, 10) })
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await addCost({ title: form.title, category: form.category, amount: Number(form.amount), date: form.date })
      toast.success('Cost logged')
      onClose()
      setForm({ title: '', category: 'Salaries', amount: '', date: new Date().toISOString().slice(0, 10) })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add institutional cost">
      <form onSubmit={submit} className="space-y-3">
        <LabeledInput label="Title" required value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} placeholder="e.g. Staff salaries — March" />
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft">Category</label>
          <select
            value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="w-full rounded-chip border border-line px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
          >
            {['Salaries', 'Utilities', 'Materials', 'Maintenance', 'Marketing', 'Other'].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <LabeledInput label="Amount" type="number" min="1" required value={form.amount} onChange={(v) => setForm((f) => ({ ...f, amount: v }))} />
        <LabeledInput label="Date" type="date" required value={form.date} onChange={(v) => setForm((f) => ({ ...f, date: v }))} />
        <button disabled={busy} className="w-full rounded-chip bg-ink py-2.5 text-sm font-semibold text-paper hover:opacity-90 disabled:opacity-50">
          {busy ? 'Saving…' : 'Add cost'}
        </button>
      </form>
    </Modal>
  )
}

function LabeledInput({ label, onChange, ...props }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-ink-soft">{label}</label>
      <input {...props} onChange={(e) => onChange(e.target.value)} className="w-full rounded-chip border border-line px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none" />
    </div>
  )
}
