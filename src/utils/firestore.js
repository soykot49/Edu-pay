import {
  addDoc,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'

// ---------- Students ----------
export function listenStudents(cb) {
  const q = query(collection(db, 'students'), orderBy('name', 'asc'))
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
}

export function listenStudent(uid, cb) {
  return onSnapshot(doc(db, 'students', uid), (snap) => cb(snap.exists() ? { id: snap.id, ...snap.data() } : null))
}

export async function setLastReminder(uid) {
  await updateDoc(doc(db, 'students', uid), { lastReminderAt: serverTimestamp() })
}

// ---------- Transactions (dues + payments ledger) ----------
export function listenTransactions(cb, studentUid = null) {
  const base = collection(db, 'transactions')
  const q = studentUid
    ? query(base, where('studentUid', '==', studentUid), orderBy('createdAt', 'desc'))
    : query(base, orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
}

export async function addDue({ studentUid, studentId, studentName, amount, session, note }) {
  await addDoc(collection(db, 'transactions'), {
    studentUid, studentId, studentName, amount, session, note: note || '',
    type: 'due', status: 'confirmed', createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'students', studentUid), { totalDue: increment(amount) })
}

export async function recordPaymentByAdmin({ studentUid, studentId, studentName, amount, session, note }) {
  await addDoc(collection(db, 'transactions'), {
    studentUid, studentId, studentName, amount, session, note: note || '',
    type: 'payment', status: 'confirmed', createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'students', studentUid), { totalPaid: increment(amount) })
}

export async function submitPaymentByStudent({ studentUid, studentId, studentName, amount, session, note }) {
  const txRef = await addDoc(collection(db, 'transactions'), {
    studentUid, studentId, studentName, amount, session, note: note || '',
    type: 'payment', status: 'pending', createdAt: serverTimestamp(),
  })
  await addDoc(collection(db, 'notifications'), {
    txId: txRef.id, studentUid, studentId, studentName, amount, session,
    kind: 'payment_pending', read: false, createdAt: serverTimestamp(),
  })
  return txRef.id
}

export async function confirmPendingPayment({ txId, studentUid, amount }) {
  await updateDoc(doc(db, 'transactions', txId), { status: 'confirmed', confirmedAt: serverTimestamp() })
  await updateDoc(doc(db, 'students', studentUid), { totalPaid: increment(amount) })
}

// ---------- Notifications ----------
export function listenNotifications(cb) {
  const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
}

export async function markNotificationRead(id) {
  await updateDoc(doc(db, 'notifications', id), { read: true })
}

// ---------- Costs (institutional expenses) ----------
export function listenCosts(cb) {
  const q = query(collection(db, 'costs'), orderBy('date', 'desc'))
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
}

export async function addCost({ title, category, amount, date }) {
  const year = new Date(date).getFullYear()
  await addDoc(collection(db, 'costs'), { title, category, amount, date, year, createdAt: serverTimestamp() })
}

// ---------- Password reset requests (student → admin assisted flow) ----------
// A student who forgets their password can't reset it themselves without
// being logged in, and self-service reset emails are easy to miss or lose
// trust in. Instead they submit a request here; an admin reviews it and
// sends them Firebase's official reset email with one click.
export async function submitPasswordResetRequest({ name, email, studentId }) {
  await addDoc(collection(db, 'passwordResetRequests'), {
    name, email, studentId: studentId || '', status: 'pending', createdAt: serverTimestamp(),
  })
}

export function listenPasswordResetRequests(cb) {
  const q = query(collection(db, 'passwordResetRequests'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
}

export async function resolvePasswordResetRequest(id) {
  await updateDoc(doc(db, 'passwordResetRequests', id), { status: 'resolved', resolvedAt: serverTimestamp() })
}
