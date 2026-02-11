# 🌍 The Station

Personal finance & freelance dashboard — built with Next.js, Supabase, Plaid, and Resend

A private, all-in-one web app to manage your bank account, track freelance projects, monitor subscriptions, and visualize your finances — designed as a PWA for mobile use

## ✨ Features

### 💰 Budget

- **Bank sync** via Plaid — automatic transaction import
- **Transaction history** with search, filters by category
- **Subscription manager** with renewal reminders (via Resend email)
- **Budget graphs** — monthly income vs expenses, category breakdown

### 💼 Freelance

- **Project tracker** — Kanban board with 6 status columns (Relation → Done)
- **Portfolio** — catalog of delivered sites with tech stack, GitHub/live links
- **Income dashboard** — monthly revenue chart, yearly comparison, tax declaration link
- **Client management** — per-project client tracking

### 🔐 Auth

- Email/password login with whitelist
- Google & GitHub OAuth
- Middleware-protected routes

### 🎨 Design

- Modern dark theme
- Responsive layout with sidebar navigation
- Smooth transitions and micro-animations
- PWA-ready (Add to Home Screen)

## 🛠 Tech Stack

| Layer     | Tech                               |
| --------- | ---------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack) |
| Styling   | Tailwind CSS 4                     |
| Auth      | NextAuth v5 (beta)                 |
| Database  | Supabase (PostgreSQL)              |
| Banking   | Plaid API                          |
| Email     | Resend                             |
| Charts    | Recharts                           |
| Icons     | Lucide React                       |
| Deploy    | Vercel + GitHub Actions            |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm
- A [Supabase](https://supabase.com) project
- A [Plaid](https://dashboard.plaid.com) account (sandbox for dev)
- A [Resend](https://resend.com) API key

### Installation

```bash
# Clone
git clone https://github.com/B0TAstro/The-Station.git
cd The-Station

# Install
npm install

# Setup environment
cp .env.example .env.local
# Fill in your keys in .env.local

# Run
npm run dev
```

### Environment Variables

See `.env.example` for the full list. Key variables:

| Variable            | Description                                     |
| ------------------- | ----------------------------------------------- |
| `NEXTAUTH_SECRET`   | Auth encryption key (`openssl rand -base64 32`) |
| `ALLOWED_EMAIL`     | Whitelisted email(s) for login                  |
| `SUPABASE_URL`      | Supabase project URL                            |
| `SUPABASE_ANON_KEY` | Supabase anonymous key                          |
| `PLAID_CLIENT_ID`   | Plaid client ID                                 |
| `PLAID_SECRET`      | Plaid secret key                                |
| `RESEND_API_KEY`    | Resend API key for email reminders              |

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/login/        # Login page
│   ├── (dashboard)/         # Protected dashboard
│   │   ├── budget/
│   │   │   ├── transactions/
│   │   │   ├── subscriptions/
│   │   │   └── graph/
│   │   └── freelance/
│   │       ├── portfolio/
│   │       ├── income/
│   │       └── projects/
│   └── api/auth/            # NextAuth API routes
├── components/
│   ├── ui/                  # Card, Button, Badge, Input
│   └── layout/              # Sidebar, Header
├── lib/                     # Supabase, Plaid, Resend clients
└── types/                   # TypeScript types
```

---

## 🗺 Roadmap

### Phase 1 — Data Integration _(next)_

- [ ] Supabase tables setup (transactions, subscriptions, projects, portfolio)
- [ ] Plaid Link integration — connect real bank accounts
- [ ] Store Plaid access tokens securely in Supabase
- [ ] Fetch and display real transactions from Plaid
- [ ] CRUD operations for subscriptions (add, edit, delete)
- [ ] CRUD operations for freelance projects
- [ ] CRUD operations for portfolio sites

### Phase 2 — Notifications & Automation

- [ ] Subscription renewal email reminders via Resend
- [ ] Configurable reminder delays (3, 5, 7 days before)
- [ ] Monthly budget summary email
- [ ] Freelance invoice reminders (relance status)

### Phase 3 — Advanced Features

- [ ] Transaction auto-categorization (rules-based)
- [ ] Budget goals and savings targets
- [ ] Freelance revenue forecasting
- [ ] Multi-currency support
- [ ] CSV/PDF export for transactions and income

### Phase 4 — PWA & Mobile

- [ ] Service Worker for offline support
- [ ] Push notifications for reminders
- [ ] Optimized mobile responsive layout
- [ ] Add to Home Screen prompt

### Phase 5 — Polish

- [ ] Data visualization improvements (more chart types)
- [ ] Dark/light theme toggle
- [ ] Onboarding flow for first-time users
- [ ] Settings page (profile, notification preferences)
- [ ] Rate limiting and security hardening

## 🚢 Deployment

Deployed on **Vercel** via GitHub Actions.

- **Push to `main`** → automatic production deploy
- **Pull requests** → preview deploy with unique URL

## 📄 License

Private project — not open source
