<div align="center">

# EduPay

**A clear, real-time ledger for student fees — one portal for students, one for admins.**

[![React](https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-lightgrey.svg)](#license)

</div>

---

## What this is

EduPay is a front-end web app that replaces the spreadsheet-and-WhatsApp routine many small
schools, coaching centers and tutoring businesses use to track tuition. It gives every student a
clear personal view of what they've paid and what they still owe, and gives admins a live,
central place to record payments, chase overdue balances, and see whether the institution is
actually profitable — without touching a spreadsheet.

It's a real, working project — not a mockup. Authentication and data are backed by **Firebase**
(free tier is enough to run it), so information persists properly across devices and sessions
instead of living only in your browser's local storage.

## Who it's for

| Use case | How EduPay helps |
|---|---|
| A coaching center or tutoring business with a handful of staff | Admins log dues and payments in seconds; no more chasing paper receipts. |
| A small school or academy billing by term/session | Track "Spring 2026," "Batch 3," etc. as sessions, per student. |
| Founders who want to see the business side clearly | Yearly income, costing and profit charts, computed live from real transactions. |
| Students/guardians who want transparency | A student logs in and instantly sees their own due/paid history — no need to ask the office. |
| A developer learning full-stack patterns | A clean example of role-based auth, a Firestore data model, and real-time listeners in a modern React app. |

## Feature tour

**Student portal**
- Sign up with name, student ID, email and password
- At-a-glance outstanding balance, with a plain-language "all caught up" or "you have X due" banner
- Full ledger: every due and payment, with date, session and status
- "Claim a payment" — log a bank transfer, cash or mobile-banking payment with a note (e.g. a transaction ID); it's marked *pending* until admin confirms

**Admin / developer portal**
- Secret access-code gate on admin signup, so random visitors can't grant themselves admin rights
- **Overview** — total students, confirmed income, total outstanding, payments awaiting confirmation, and a live activity feed
- **Students** — search, add a due/invoice, record a payment directly, or send a one-click due-reminder email
- **Reports** — yearly income vs. costing bar chart and a profit trend chart, plus a place to log institutional costs (salaries, utilities, materials, etc.)
- **Live notifications** — a sticky, blurred, always-visible bell that updates the instant a student claims a payment (Firestore real-time listener — no page refresh needed), with a toast pop-up too

**Across the app**
- Automatic due-reminder emails (via EmailJS) for students whose balance crosses a threshold you set, plus manual per-student reminders
- Fully responsive bento-grid layout, from small phones to wide desktop screens
- Hand-built SVG illustrations for empty states and due alerts — no emoji, no stock art
- A single quiet Three.js animation on the login screen; everything else stays calm and functional
- Toast notifications for every action (success and error) via react-toastify

## Technology used

| Layer | Choice | Why |
|---|---|---|
| UI framework | **React 18** (Vite) | Fast dev server, component-based UI |
| Styling | **Tailwind CSS** | Utility-first styling, consistent design tokens |
| Routing | **react-router-dom** | Role-protected routes (`/student`, `/admin`) |
| Auth + database | **Firebase** (Authentication + Firestore) | Real accounts and real-time data, free tier, no backend server to run yourself |
| Charts | **Recharts** | Yearly income/costing/profit visualizations |
| Notifications | **react-toastify** | In-app success/error/live-update toasts |
| Email | **EmailJS** (`@emailjs/browser`) | Sends due-reminder emails straight from the browser, no server needed |
| Icons | **lucide-react** | Consistent line icons throughout (no emoji) |
| 3D/animation | **three.js** | The login screen's animated wireframe |

## Project structure

```
edupay/
├─ src/
│  ├─ components/        TopBar, StatCard, Modal, LiveBell, ThreeBackground, Illustrations, ProtectedRoute
│  ├─ context/            AuthContext.jsx — Firebase auth + role-aware profile
│  ├─ pages/               Login.jsx, StudentDashboard.jsx, AdminDashboard.jsx
│  ├─ utils/                firestore.js (data access), emailReminder.js (EmailJS + formatting)
│  ├─ styles/              index.css — Tailwind layers + shared classes
│  ├─ firebase.js         Firebase app initialization
│  ├─ App.jsx               Routes + toast container
│  └─ main.jsx              App entry point
├─ firestore.rules         Security rules — publish these in the Firebase console
├─ .env.example             Template for all required environment variables
├─ tailwind.config.js
├─ vite.config.js
└─ package.json
```

## Getting started

### Prerequisites
- [Node.js](https://nodejs.org) 18 or newer, and npm
- A free [Firebase](https://firebase.google.com) account
- A free [EmailJS](https://www.emailjs.com) account (optional, only needed for reminder emails)

### 1. Install dependencies

```bash
npm install
```

### 2. Create your environment file

```bash
cp .env.example .env
```

You'll fill this in over the next two steps.

### 3. Set up Firebase

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project** (the free Spark plan is enough).
2. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable.**
3. **Build → Firestore Database → Create database** (start in production mode, pick any region).
4. **Project settings → General → Your apps → </> (Web)** to register a web app. Copy the config values it gives you into `.env`:

   ```env
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_AUTH_DOMAIN=
   VITE_FIREBASE_PROJECT_ID=
   VITE_FIREBASE_STORAGE_BUCKET=
   VITE_FIREBASE_MESSAGING_SENDER_ID=
   VITE_FIREBASE_APP_ID=
   ```

5. Open **Firestore → Rules**, replace the contents with what's in [`firestore.rules`](./firestore.rules), and **Publish**. This is what keeps a student's data private to them while giving admins full visibility.

6. Pick a secret phrase and set it as `VITE_ADMIN_SIGNUP_CODE` in `.env`. Anyone signing up as **Admin / Developer** in the app must enter this code — it's what stops a random visitor from granting themselves admin access. Share this phrase only with people you trust to manage the dashboard.

### 4. Set up EmailJS (optional, for reminder emails)

1. Create a free account at [emailjs.com](https://www.emailjs.com) and connect an **Email Service** (Gmail, Outlook, etc.).
2. Create an **Email Template** that uses these variables somewhere in its body: `{{to_name}}`, `{{to_email}}`, `{{student_id}}`, `{{due_amount}}`, `{{session}}`.
3. Copy your **Service ID**, **Template ID** and **Public Key** into `.env`:

   ```env
   VITE_EMAILJS_SERVICE_ID=
   VITE_EMAILJS_TEMPLATE_ID=
   VITE_EMAILJS_PUBLIC_KEY=
   ```

4. Optionally set the balance that triggers an automatic reminder:

   ```env
   VITE_DUE_ALERT_THRESHOLD=2000
   ```

If you skip this step, the app still works fully — reminder emails will just show a friendly
error instead of sending until you configure it.

### 5. Run it

```bash
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`). Create a student account from the
**Student** tab, and an admin account from the **Admin / Developer** tab using your access code.

### 6. Build for production

```bash
npm run build
```

This outputs a static `dist/` folder you can deploy anywhere that serves static files — Firebase
Hosting, Vercel, Netlify, GitHub Pages, etc.

## How payments actually flow

1. **Admin adds a due** — an invoice for a student, tied to a session (e.g. "Spring 2026 Tuition — 5000").
2. **Student pays** outside the app (bank transfer, cash, mobile banking) and clicks **Claim a payment**, logging the amount and an optional note (like a transaction ID).
3. This instantly creates a **live notification** — the admin's bell updates in real time and a toast appears, with no page refresh.
4. **Admin confirms** the claim, which updates the student's paid total and clears the due.
5. For in-person payments, admin can also **record a payment directly** — it's confirmed immediately, no student claim needed.

## Where to take it next

- **Real payment gateways** — Stripe for card payments, or bKash / Nagad / SSLCommerz if you're serving students in Bangladesh, to replace the manual claim-and-confirm step with instant, verified transactions.
- **Firebase Cloud Functions** for reminder emails that run on a nightly schedule even when no admin is logged in, and for server-side validation of payment totals.
- **CSV export** of the ledger and yearly reports for offline bookkeeping or your accountant.
- **Read-only staff/teacher roles** scoped to their own class or batch.
- **Web push notifications** for admins who aren't currently on the dashboard.
- **An audit log** of who changed what, useful once more than one admin is managing the books.

## Security notes

- All access control is enforced by `firestore.rules`, not just the UI — students genuinely
  cannot read another student's data even if they try to query Firestore directly.
- The admin access code is a lightweight deterrent, not a substitute for real access management.
  For a production institution, consider moving admin invitations to a Cloud Function that emails
  a one-time signup link instead.
- Never commit your real `.env` file — `.gitignore` already excludes it.

## License

MIT — do whatever you'd like with this, attribution appreciated but not required.
