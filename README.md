# 🧸 Little Steps — Trusted 24×7 Childcare Platform

A full-stack MERN web application connecting parents with verified daycare centres and crèches offering round-the-clock, transparent, and flexible childcare services.

---

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Demo Logins](#demo-logins)
- [API Reference](#api-reference)
- [PRD Coverage](#prd-coverage)
- [Screenshots](#screenshots)

---

## Overview

Little Steps addresses a growing gap in childcare infrastructure:

- Parents working night / shift jobs cannot find 24×7 centres
- No centralised platform shows real-time slot availability
- Caregiver verification is opaque and word-of-mouth
- Pricing is hidden until the last moment

This platform provides **three role-based dashboards** (Parent, Provider, Admin) with a complete booking, subscription, and verification workflow.

---

## Features

### 👨‍👩‍👧 Parent
| Feature | Status |
|---|---|
| Secure registration & login (JWT) | ✅ |
| Search nearby centres by city | ✅ |
| Filter: 24×7, age group, timing, max price | ✅ |
| View centre details, caregiver profiles, safety measures | ✅ |
| Book slots (hourly / daily / monthly) | ✅ |
| Monthly subscription management | ✅ |
| Booking history & status tracking | ✅ |
| Leave star-rating feedback after completion | ✅ |

### 🏫 Childcare Provider
| Feature | Status |
|---|---|
| Provider registration (admin approval flow) | ✅ |
| Create & manage centre details | ✅ |
| Set hourly / daily / monthly pricing | ✅ |
| Accept or reject booking requests | ✅ |
| Mark bookings as completed | ✅ |
| Capacity tracking (overbooking prevention) | ✅ |
| Earnings analytics | ✅ |

### 🛡 Admin
| Feature | Status |
|---|---|
| Approve / reject provider accounts | ✅ |
| Verify centre documents & certifications | ✅ |
| Platform KPIs dashboard | ✅ |
| Monitor all bookings | ✅ |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Vite, Axios |
| Backend | Node.js, Express.js (ES Modules) |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Styling | Custom CSS Design System (no UI lib dependency) |
| Deployment | Vercel (frontend) / Railway or Render (backend) |

---

## Folder Structure

```
little-steps/
├── client/                  # React frontend (Vite)
│   ├── public/
│   └── src/
│       ├── api/             # Axios client
│       ├── components/      # Navbar, UI helpers, CenterCard
│       ├── context/         # AuthContext (JWT state)
│       ├── pages/           # Landing, Auth, Search, CenterDetail,
│       │                    # ParentDashboard, ProviderDashboard, AdminDashboard
│       └── styles/          # Global CSS design system
│
└── server/                  # Node/Express backend
    └── src/
        ├── config/          # MongoDB connection
        ├── controllers/     # auth, center, booking, subscription, admin
        ├── middleware/       # JWT protect + role authorize
        ├── models/          # User, Center, Caregiver, Booking, Subscription
        ├── routes/          # REST route definitions
        └── seed/            # Demo data seeder
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local) OR MongoDB Atlas free cluster

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/little-steps.git
cd little-steps
```

### 2. Set up the backend
```bash
cd server
cp .env.example .env
# Edit .env — paste your MongoDB URI and set JWT_SECRET
npm install
```

**`.env` file:**
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/little_steps
JWT_SECRET=your_super_secret_key_here
```

### 3. Seed the database with demo data
```bash
npm run seed
```

This creates:
- 1 admin, 1 parent, 2 providers (with demo logins below)
- 4 childcare centres (3 verified, 1 pending)
- Caregivers with certifications

### 4. Start the backend
```bash
npm run dev          # nodemon (development)
# OR
npm start            # plain node (production)
```
Backend runs at **http://localhost:5000**

### 5. Set up and start the frontend
```bash
cd ../client
npm install
npm run dev
```
Frontend runs at **http://localhost:5173**  
(Vite proxies `/api` → `localhost:5000` automatically)

---

## Demo Logins

| Role | Email | Password |
|---|---|---|
| 👨‍👩‍👧 Parent | parent@littlesteps.com | parent123 |
| 🏫 Provider | provider@littlesteps.com | provider123 |
| 🛡 Admin | admin@littlesteps.com | admin123 |

> Quick-fill buttons are also available on the Login page.

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register parent or provider |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | Bearer | Get current user |

### Centres
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/centers` | — | Search + filter centres |
| GET | `/api/centers/:id` | — | Centre detail |
| POST | `/api/centers` | Provider | Create centre |
| PUT | `/api/centers/:id` | Provider | Update centre |
| GET | `/api/centers/mine/list` | Provider | My centres |

**Search query params:** `city`, `q`, `is24x7`, `ageGroup`, `timing`, `planType`, `maxPrice`

### Bookings
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/bookings` | Parent | Create booking request |
| GET | `/api/bookings/mine` | Parent | My booking history |
| POST | `/api/bookings/:id/feedback` | Parent | Leave rating |
| GET | `/api/bookings/provider` | Provider | Incoming requests |
| PUT | `/api/bookings/:id/status` | Provider | Accept / reject / complete |

### Subscriptions
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/subscriptions` | Parent | Subscribe to monthly plan |
| GET | `/api/subscriptions/mine` | Parent | My subscriptions |
| PUT | `/api/subscriptions/:id/cancel` | Parent | Cancel subscription |

### Admin
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/users/pending` | Admin | Pending provider accounts |
| PUT | `/api/admin/users/:id/status` | Admin | Approve / reject user |
| GET | `/api/admin/centers/pending` | Admin | Centres awaiting verification |
| PUT | `/api/admin/centers/:id/verify` | Admin | Verify / reject centre |
| GET | `/api/admin/analytics` | Admin | Platform KPIs |
| GET | `/api/admin/bookings` | Admin | All bookings |

---

## PRD Coverage

| PRD Requirement | Implemented |
|---|---|
| Secure auth + role-based access | ✅ JWT, bcrypt, roles: parent/provider/admin |
| Search with filters (24×7, age group, timing, price) | ✅ Query params on `/api/centers` |
| View centre details, caregiver profiles, safety | ✅ CenterDetail page |
| Book hourly / daily / monthly slots | ✅ Booking model + controller |
| Subscription management | ✅ Subscription model, create/cancel |
| Booking history & notifications (toast) | ✅ |
| Provider: manage centre, pricing, availability | ✅ ProviderDashboard |
| Provider: accept/reject bookings | ✅ |
| Provider: earnings analytics | ✅ |
| Admin: approve users & providers | ✅ |
| Admin: verify documents & certifications | ✅ |
| Admin: platform analytics & KPIs | ✅ booking conversion, utilization, subs |
| Overbooking prevention (Reliability NFR) | ✅ availableSlots virtual + capacity check |
| Page load < 3s (Performance NFR) | ✅ Vite build, lazy data fetching |
| Role-based access control (Security NFR) | ✅ `protect` + `authorize` middleware |
| Mobile-first responsive UI (Usability NFR) | ✅ CSS grid/flex, responsive breakpoints |
| Multi-city support (Scalability NFR) | ✅ city filter on all queries |
| Caregiver verification workflow | ✅ Admin verifies centres + caregivers |
| Feedback & ratings | ✅ Post-completion star rating |
| Payments | 🔜 Future phase (per PRD) |
| Native mobile app | 🔜 Future phase (per PRD) |
| Live CCTV streaming | 🔜 Future phase (per PRD) |

---

## Deployment (Quick Guide)

### Frontend → Vercel
```bash
cd client
npm run build
# Push to GitHub → import on vercel.com → done
```

### Backend → Render / Railway
1. Create a new Web Service pointing to `/server`
2. Set env vars: `MONGO_URI` (Atlas), `JWT_SECRET`, `PORT`
3. Build command: `npm install`
4. Start command: `npm start`

### MongoDB Atlas (Free tier)
1. Create cluster at cloud.mongodb.com
2. Add DB user + whitelist `0.0.0.0/0`
3. Copy connection string → paste in `MONGO_URI`

---

*Built as part of the Little Steps PRD project · Unified Mentor*
