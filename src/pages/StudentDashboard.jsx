import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { CheckCircle2, Clock3, CreditCard, HandCoins, Send, Wallet } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import TopBar from '../components/TopBar'
import StatCard from '../components/StatCard'
import Modal from '../components/Modal'
import { listenStudent, listenTransactions, submitPaymentByStudent } from '../utils/firestore'
import { formatCurrency, formatDate } from '../utils/emailReminder'
import { IllustrationAllClear, IllustrationDueAlert, IllustrationEmpty } from '../components/Illustrations'

const STATUS_STYLES = {
  confirmed_payment: 'bg-teal-50 text-teal-600 dark:bg-teal-400/10 dark:text-teal-400',
  pending: 'bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400',
  due: 'bg-rose-50 text-rose-500 dark:bg-rose-400/10 dark:text-rose-400',
}

export default function StudentDashboard() {
  const { user, profile } = useAuth()
  const [student, setStudent] = useState(profile)
  const [txs, setTxs] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ amount: '', session: '', note: '' })
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!user) return
    const unsub1 = listenStudent(user.uid, setStudent)
    const unsub2 = listenTransactions(setTxs, user.uid)
    return () => { unsub1(); unsub2() }
  }, [user])

  const totalDue = student?.totalDue || 0
  const totalPaid = student?.totalPaid || 0
  const outstanding = Math.max(totalDue - totalPaid, 0)

  async function handleClaimPayment(e) {
    e.preventDefault()
    if (!form.amount || Number(form.amount) <= 0) return toast.error('Enter a valid amount.')
    setBusy(true)
    try {
      await submitPaymentByStudent({
        studentUid: user.uid,
        studentId: student.studentId,
        studentName: student.name,
        amount: Number(form.amount),
        session: form.session || student.currentSession || '',
        note: form.note,
      })
      toast.success("Payment claim sent — it'll show as pending until admin confirms it.")
      setModalOpen(false)
      setForm({ amount: '', session: '', note: '' })
    } catch (err) {
      toast.error(err.message || 'Could not submit payment.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper dark:bg-dark-bg">
      <TopBar
        title={`Hi, ${student?.name?.split(' ')[0] || 'there'}`}
        subtitle={`Student ID: ${student?.studentId || '—'}`}
        right={
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-chip bg-teal-500 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-600"
          >
            <Send size={15} />
            <span className="hidden sm:inline">Claim a payment</span>
            <span className="sm:hidden">Pay</span>
          </button>
        }
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Alert banner */}
        <div className="bento-card mb-6 flex flex-col items-center gap-4 p-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-4 text-center sm:text-left">
            {outstanding > 0 ? <IllustrationDueAlert className="h-16 w-16 shrink-0" /> : <IllustrationAllClear className="h-16 w-16 shrink-0" />}
            <div>
              <p className="font-display text-lg font-semibold text-ink dark:text-dark-ink">
                {outstanding > 0 ? `You have ${formatCurrency(outstanding)} due` : "You're all caught up"}
              </p>
              <p className="text-sm text-ink-faint dark:text-dark-faint">
                {outstanding > 0
                  ? 'Make a payment and claim it below — your admin will confirm it shortly.'
                  : 'No outstanding balance for your current session. Nice work.'}
              </p>
            </div>
          </div>
          {outstanding > 0 && (
            <button
              onClick={() => { setForm((f) => ({ ...f, amount: String(outstanding) })); setModalOpen(true) }}
              className="w-full shrink-0 rounded-chip bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:opacity-90 dark:bg-dark-ink dark:text-dark-bg sm:w-auto"
            >
              Pay {formatCurrency(outstanding)}
            </button>
          )}
        </div>

        {/* Bento stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard icon={Wallet} label="Total due" value={formatCurrency(totalDue)} tone="rose" hint="Lifetime invoiced" />
          <StatCard icon={CheckCircle2} label="Total paid" value={formatCurrency(totalPaid)} tone="teal" hint="Lifetime confirmed" />
          <StatCard icon={HandCoins} label="Outstanding balance" value={formatCurrency(outstanding)} tone={outstanding > 0 ? 'amber' : 'teal'} hint={student?.currentSession || 'Current session'} className="sm:col-span-2 lg:col-span-1" />
        </div>

        {/* Ledger */}
        <div className="bento-card mt-6 overflow-hidden">
          <div className="flex items-center justify-between border-b border-line dark:border-dark-line px-5 py-4 sm:px-6">
            <h3 className="font-display text-base font-semibold text-ink dark:text-dark-ink">Payment & due history</h3>
            <CreditCard size={18} className="text-ink-faint dark:text-dark-faint" />
          </div>

          {txs.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
              <IllustrationEmpty />
              <p className="text-sm text-ink-faint dark:text-dark-faint">Nothing here yet — your dues and payments will appear as soon as they're recorded.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="text-xs text-ink-faint dark:text-dark-faint">
                    <th className="px-5 py-3 font-medium sm:px-6">Date</th>
                    <th className="px-5 py-3 font-medium sm:px-6">Session</th>
                    <th className="px-5 py-3 font-medium sm:px-6">Type</th>
                    <th className="px-5 py-3 text-right font-medium sm:px-6">Amount</th>
                    <th className="px-5 py-3 text-right font-medium sm:px-6">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {txs.map((t) => (
                    <tr key={t.id} className="border-t border-line/70 dark:border-dark-line/70">
                      <td className="px-5 py-3.5 text-ink-soft dark:text-dark-soft sm:px-6">{formatDate(t.createdAt)}</td>
                      <td className="px-5 py-3.5 text-ink-soft dark:text-dark-soft sm:px-6">{t.session || '—'}</td>
                      <td className="px-5 py-3.5 capitalize text-ink-soft dark:text-dark-soft sm:px-6">{t.type === 'due' ? 'Invoice / due' : 'Payment'}</td>
                      <td className="px-5 py-3.5 text-right font-medium text-ink dark:text-dark-ink sm:px-6">{formatCurrency(t.amount)}</td>
                      <td className="px-5 py-3.5 text-right sm:px-6">
                        <StatusChip type={t.type} status={t.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Claim a payment">
        <form onSubmit={handleClaimPayment} className="space-y-3">
          <p className="text-sm text-ink-faint dark:text-dark-faint">
            Already paid via bank transfer, cash or mobile banking? Log it here — your admin gets notified instantly and confirms it.
          </p>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft dark:text-dark-soft">Amount paid</label>
            <input
              type="number" min="1" required value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              className="w-full rounded-chip border border-line dark:border-dark-line bg-paper dark:bg-dark-bg text-ink dark:text-dark-ink px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
              placeholder="e.g. 500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft dark:text-dark-soft">Session</label>
            <input
              value={form.session} onChange={(e) => setForm((f) => ({ ...f, session: e.target.value }))}
              className="w-full rounded-chip border border-line dark:border-dark-line bg-paper dark:bg-dark-bg text-ink dark:text-dark-ink px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
              placeholder="e.g. Spring 2026"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft dark:text-dark-soft">Note (optional)</label>
            <input
              value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              className="w-full rounded-chip border border-line dark:border-dark-line bg-paper dark:bg-dark-bg text-ink dark:text-dark-ink px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
              placeholder="e.g. Paid via bKash, TrxID 8XJ22K"
            />
          </div>
          <button disabled={busy} type="submit" className="w-full rounded-chip bg-teal-500 py-2.5 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-50">
            {busy ? 'Submitting…' : 'Submit claim'}
          </button>
        </form>
      </Modal>
    </div>
  )
}

function StatusChip({ type, status }) {
  if (type === 'due') {
    return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES.due}`}>Due</span>
  }
  if (status === 'pending') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES.pending}`}>
        <Clock3 size={12} /> Pending
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES.confirmed_payment}`}>
      <CheckCircle2 size={12} /> Confirmed
    </span>
  )
}
