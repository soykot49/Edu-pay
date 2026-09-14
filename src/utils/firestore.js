import {
  addDoc,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
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
  const batch = writeBatch(db)
  const txRef = doc(collection(db, 'transactions'))
  batch.set(txRef, {
    studentUid, studentId, studentName, amount, session, note: note || '',
    type: 'due', status: 'confirmed', createdAt: serverTimestamp(),
  })
  batch.update(doc(db, 'students', studentUid), {
    totalDue: incrementAmount(amount),
    currentSession: session,
  })
  await batch.commit()
}

export async function recordPaymentByAdmin({ studentUid, studentId, studentName, amount, session, note }) {
  const batch = writeBatch(db)
  const txRef = doc(collection(db, 'transactions'))
  batch.set(txRef, {
    studentUid, studentId, studentName, amount, session, note: note || '',
    type: 'payment', status: 'confirmed', createdAt: serverTimestamp(),
  })
  batch.update(doc(db, 'students', studentUid), { totalPaid: incrementAmount(amount) })
  await batch.commit()
}

export async function submitPaymentByStudent({ studentUid, studentId, studentName, amount, session, note }) {
  const batch = writeBatch(db)
  const txRef = doc(collection(db, 'transactions'))
  batch.set(txRef, {
    studentUid, studentId, studentName, amount, session, note: note || '',
    type: 'payment', status: 'pending', createdAt: serverTimestamp(),
  })
  const notificationRef = doc(collection(db, 'notifications'))
  batch.set(notificationRef, {
    txId: txRef.id, studentUid, studentId, studentName, amount, session,
    kind: 'payment_pending', read: false, createdAt: serverTimestamp(),
  })
  await batch.commit()
  return txRef.id
}

export async function confirmPendingPayment({ txId, studentUid, amount }) {
  await runTransaction(db, async (transaction) => {
    const txRef = doc(db, 'transactions', txId)
    const studentRef = doc(db, 'students', studentUid)
    const txSnap = await transaction.get(txRef)
    const studentSnap = await transaction.get(studentRef)

    if (!txSnap.exists() || txSnap.data().status !== 'pending') {
      throw new Error('This payment has already been confirmed or no longer exists.')
    }
    if (!studentSnap.exists()) {
      throw new Error('The student record could not be found.')
    }

    transaction.update(txRef, { status: 'confirmed', confirmedAt: serverTimestamp() })
    transaction.update(studentRef, { totalPaid: incrementAmount(amount) })
  })
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

function incrementAmount(amount) {
  return increment(amount)
}
