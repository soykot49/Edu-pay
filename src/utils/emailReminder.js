import emailjs from '@emailjs/browser'

// Sends a due-balance reminder email to a student via EmailJS.
// Configure your EmailJS service, template and public key in .env (see .env.example).
// Suggested template variables to add in your EmailJS template:
//   {{to_name}} {{to_email}} {{student_id}} {{due_amount}} {{session}}
export async function sendDueReminder({ name, email, studentId, dueAmount, session }) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

  if (!serviceId || !templateId || !publicKey) {
    throw new Error('EmailJS is not configured yet. Add your keys to .env — see .env.example.')
  }

  return emailjs.send(
    serviceId,
    templateId,
    {
      to_name: name,
      to_email: email,
      student_id: studentId,
      due_amount: dueAmount,
      session: session || 'current session',
    },
    { publicKey }
  )
}

export function formatCurrency(n) {
  const val = Number(n || 0)
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
}

export function formatDate(ts) {
  if (!ts) return '—'
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}
