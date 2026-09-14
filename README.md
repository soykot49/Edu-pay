# EduPay — Student Payment Dashboard

A fully functional front-end for tracking student tuition payments: a **student portal** for
checking dues/paid history, and an **admin portal** for recording payments, tracking yearly
income/costing/profit, and getting live notifications the moment a student reports a payment.

Built with **React + Vite + Tailwind CSS**, **Firebase** (Auth + Firestore) for real accounts and
data storage, **Recharts** for the reports, **react-toastify** for alerts, **EmailJS** for due
reminder emails, **lucide-react** for icons, and a small **Three.js** scene on the login screen.

---

## 1. Install & run

```bash
npm install
cp .env.example .env      # then fill in the values (see below)
npm run dev                # http://localhost:5173
```

## 2. Set up Firebase (free tier is enough)

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
2. In your project: **Build → Authentication → Get started → Email/Password → Enable**.
3. **Build → Firestore Database → Create database** (start in production mode).
4. In **Project settings → General → Your apps**, click the web icon `</>` to register a web app,
   then copy the config values into `.env`:

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

5. In **Firestore → Rules**, paste the contents of `firestore.rules` (included in this project)
   and publish. This keeps students able to see only their own data, while admins can see and
   manage everything.

6. Set `VITE_ADMIN_SIGNUP_CODE` in `.env` to any secret string of your choice (e.g. a phrase only
   you and your co-developer know). Anyone creating an **Admin/Developer** account must enter this
   code — it stops random visitors from giving themselves admin access. Leave it blank to allow
   open admin signup (not recommended once you're live).

## 3. Set up EmailJS (free tier: 200 emails/month)

1. Create an account at [emailjs.com](https://www.emailjs.com) and add an **Email Service**
   (Gmail, Outlook, etc.).
2. Create an **Email Template** with these variables in the body: `{{to_name}}`, `{{to_email}}`,
   `{{student_id}}`, `{{due_amount}}`, `{{session}}`.
3. Copy your **Service ID**, **Template ID**, and **Public Key** into `.env`:

   ```
   VITE_EMAILJS_SERVICE_ID=...
   VITE_EMAILJS_TEMPLATE_ID=...
   VITE_EMAILJS_PUBLIC_KEY=...
   ```

Reminder emails go out two ways: automatically (once per admin session, to any student whose
outstanding balance is above `VITE_DUE_ALERT_THRESHOLD` and hasn't been reminded in 7 days), and
manually (the mail icon next to any student in the **Students** tab).

> A note on "fully automatic" reminders: since this is a front-end-only project, reminders fire
> when an admin has the dashboard open. For true background reminders that run even when nobody is
> logged in, add a scheduled **Firebase Cloud Function** (or any small cron job) that queries
> Firestore daily and calls the EmailJS REST API — happy to help you wire that up next.

## 4. How the accounts work

- **Students** sign up with full name, student ID, email and password. They can only see and edit
  their own record.
- **Admin / Developer** accounts require the access code above. Admins see every student, record
  payments and dues, run reports, and manage institutional costs.
- Firebase Auth needs an email for every account (both roles), which also doubles as where
  reminder emails are sent.

## 5. How payments flow

1. Admin adds a **due** (an invoice) to a student for a session, e.g. "Spring 2026 Tuition — 5000".
2. The student pays outside the app (bank transfer, cash, mobile banking, etc.), then clicks
   **Claim a payment** in their dashboard and logs the amount + a note (like a transaction ID).
3. This creates a live notification — the admin's bell badge updates instantly (Firestore realtime
   listener, no refresh) and a toast pops up.
4. Admin reviews and **Confirms** it, which updates the student's paid total and closes out the due.
5. Admin can also **record a payment directly** (already-confirmed) for cash-in-hand situations.

## 6. Reports

The **Reports** tab aggregates confirmed payments by year for income, lets you log institutional
costs (salaries, utilities, materials, etc.), and charts income vs. costing plus a profit trend —
all computed live from Firestore, no manual spreadsheet work.

## 7. Ideas to extend further

- **Real payment gateways**: Stripe for international cards, or bKash/Nagad/SSLCommerz if you're
  serving students in Bangladesh — either would replace the manual "claim a payment" step with an
  instant, verified transaction.
- **Cloud Functions** for: nightly automatic reminder emails, PDF receipt generation, and
  server-side validation of payment totals (right now totals trust the client + Firestore rules).
- **CSV export** of the ledger and reports for offline bookkeeping.
- **Roles for teachers/staff** with read-only access to their own class's payment status.
- **Push notifications** (web push) in addition to the in-app live bell, for admins who aren't
  currently on the dashboard.
- **Audit log** of who changed what, for multi-admin institutions.

## 8. Tech stack

React 18 · Vite · Tailwind CSS · Firebase (Auth + Firestore) · Recharts · react-toastify ·
@emailjs/browser · lucide-react · three.js · react-router-dom

## 9. Project structure

```
src/
  components/     Reusable UI: TopBar, StatCard, Modal, LiveBell, ThreeBackground, Illustrations
  context/        AuthContext (Firebase auth + role-aware profile)
  pages/          Login, StudentDashboard, AdminDashboard
  utils/          firestore.js (data access), emailReminder.js (EmailJS + formatting)
  firebase.js     Firebase app initialization
firestore.rules   Security rules — publish these in the Firebase console
```
