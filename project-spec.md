# 🎫 Ticket Management System — Nuxt Project Specification

## Overview

A professional full-stack web application for managing support tickets, built with **Nuxt 3**. The app supports two user roles (Admin and Technician), full ticket lifecycle management, user management, statistics, and a real-time dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Nuxt 3 (Vue 3 + Composition API) |
| Styling | Tailwind CSS v3 |
| Icons | Lucide Vue Next (or Heroicons) |
| State Management | Pinia |
| Auth | Nuxt Auth Utils or custom JWT (cookie-based) |
| Database | Supabase (PostgreSQL) OR PrismaORM + PostgreSQL |
| Email | Resend API (for magic links) |
| UI Components | shadcn-vue OR Nuxt UI |
| Form Validation | Vee-Validate + Zod |
| Date Handling | date-fns |
| Charts (Stats page) | Chart.js via vue-chartjs |

> **Note to Claude**: feel free to adjust the stack if a better combination is available at the time of implementation. The key requirement is **Nuxt 3** as the framework. For the database, prefer Supabase for simplicity (auth + DB in one). If using Supabase, use the `@supabase/supabase-js` client.

---

## Design Direction

- **Aesthetic**: Clean, professional, utilitarian — inspired by Linear and Plane.so
- **Theme**: Light default; optional dark mode toggle
- **Font**: `DM Sans` (headings) + `Inter` (body) — load via Google Fonts or Fontsource
- **Primary Color**: Indigo (`#4F46E5`) with neutral gray backgrounds
- **Accent Colors**:
  - 🔴 Urgent: `red-600`
  - 🟡 To Be Worked: `amber-500`
  - 🔵 In Progress: `blue-600`
  - 🟢 Done: `green-600`
  - ⚫ Canceled: `gray-400`
- **Sidebar**: Fixed left sidebar, 240px wide, dark (`gray-900`) with white text and active item highlight
- **Cards**: White background, subtle border, soft shadow, rounded-lg
- **Ticket List**: Rows with left colored border based on urgency/status

---

## Project Structure

```
/
├── assets/
│   └── css/
│       └── main.css
├── components/
│   ├── layout/
│   │   ├── AppSidebar.vue
│   │   ├── AppHeader.vue
│   │   └── AppBreadcrumb.vue
│   ├── tickets/
│   │   ├── TicketCard.vue
│   │   ├── TicketRow.vue
│   │   ├── TicketStatusBadge.vue
│   │   ├── TicketUrgencyBadge.vue
│   │   └── TicketForm.vue
│   ├── users/
│   │   ├── UserRow.vue
│   │   └── UserForm.vue
│   ├── stats/
│   │   ├── StatCard.vue
│   │   └── BarChart.vue
│   └── ui/
│       ├── Modal.vue
│       ├── ConfirmDialog.vue
│       ├── Pagination.vue
│       └── FilterBar.vue
├── composables/
│   ├── useAuth.ts
│   ├── useTickets.ts
│   ├── useUsers.ts
│   └── useStats.ts
├── layouts/
│   ├── default.vue       ← authenticated layout with sidebar
│   └── auth.vue          ← login/reset layout (centered, no sidebar)
├── middleware/
│   ├── auth.ts           ← redirect to /login if not authenticated
│   └── admin.ts          ← redirect if not admin
├── pages/
│   ├── login.vue
│   ├── reset-password.vue
│   ├── set-password.vue  ← magic link landing page
│   ├── index.vue         ← Dashboard
│   ├── tickets/
│   │   ├── index.vue     ← Unassigned / open tickets
│   │   ├── my.vue        ← My tickets
│   │   └── new.vue       ← Create new ticket
│   ├── users/
│   │   └── index.vue     ← User management (admin only)
│   └── stats/
│       └── index.vue
├── server/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login.post.ts
│   │   │   ├── logout.post.ts
│   │   │   ├── reset-password.post.ts
│   │   │   └── set-password.post.ts
│   │   ├── tickets/
│   │   │   ├── index.get.ts
│   │   │   ├── index.post.ts
│   │   │   ├── [id].get.ts
│   │   │   ├── [id].put.ts
│   │   │   └── [id].delete.ts
│   │   ├── users/
│   │   │   ├── index.get.ts
│   │   │   ├── index.post.ts
│   │   │   ├── [id].put.ts
│   │   │   └── [id].patch.ts  ← lock/unlock
│   │   └── stats/
│   │       └── index.get.ts
│   └── utils/
│       ├── auth.ts
│       └── db.ts
├── stores/
│   ├── auth.ts
│   ├── tickets.ts
│   └── users.ts
├── types/
│   └── index.ts
├── nuxt.config.ts
├── tailwind.config.ts
└── .env.example
```

---

## Database Schema

### Table: `users`
```sql
id           UUID PRIMARY KEY DEFAULT gen_random_uuid()
name         VARCHAR(100) NOT NULL
family_name  VARCHAR(100) NOT NULL
email        VARCHAR(255) UNIQUE NOT NULL
password     TEXT NOT NULL                -- bcrypt hashed
role         VARCHAR(20) NOT NULL         -- 'admin' | 'technician'
is_locked    BOOLEAN DEFAULT false
reset_token  TEXT
reset_token_expires_at TIMESTAMP
created_at   TIMESTAMP DEFAULT now()
```

### Table: `tickets`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
customer_name   VARCHAR(255) NOT NULL
type            VARCHAR(50) NOT NULL      -- 'Bug' | 'Fixes' | 'Improvement' | 'Info' | 'Typo' | 'Other'
is_urgent       BOOLEAN DEFAULT false
status          VARCHAR(50) DEFAULT 'to_be_worked'  -- 'to_be_worked' | 'in_progress' | 'done' | 'canceled'
assigned_to     UUID REFERENCES users(id) ON DELETE SET NULL
created_by      UUID REFERENCES users(id)
created_at      TIMESTAMP DEFAULT now()
updated_at      TIMESTAMP DEFAULT now()
```

---

## Types (TypeScript)

```typescript
// types/index.ts

export type UserRole = 'admin' | 'technician'

export type TicketType = 'Bug' | 'Fixes' | 'Improvement' | 'Info' | 'Typo' | 'Other'

export type TicketStatus = 'to_be_worked' | 'in_progress' | 'done' | 'canceled'

export interface User {
  id: string
  name: string
  family_name: string
  email: string
  role: UserRole
  is_locked: boolean
  created_at: string
}

export interface Ticket {
  id: string
  customer_name: string
  type: TicketType
  is_urgent: boolean
  status: TicketStatus
  assigned_to?: string | null
  assignee?: User | null
  created_by: string
  creator?: User | null
  created_at: string
  updated_at: string
}

export interface Stats {
  todo: number
  in_progress: number
  done: number
  canceled: number
}
```

---

## Pages & Features

### `/login`
- Layout: `auth.vue` (centered card, app logo on top)
- Fields: Email, Password
- Submit button: "Sign In"
- Link below: "Forgot your password?" → `/reset-password`
- On success: redirect to `/` (dashboard)
- On error: show inline error message (wrong credentials / account locked)

### `/reset-password`
- Layout: `auth.vue`
- Field: Email
- Submit button: "Send Reset Link"
- Logic:
  - Check if email exists in DB
  - Generate a secure token, save to `users.reset_token` with 1h expiry
  - Send email via Resend with magic link: `https://yourdomain.com/set-password?token=XXX`
  - Show success message regardless (do not leak if email exists)

### `/set-password?token=XXX`
- Layout: `auth.vue`
- Fields: New Password, Confirm Password
- Validate token (exists + not expired)
- On success: update password, clear token, redirect to `/login`

---

### `/` — Dashboard
- Layout: `default.vue`
- Middleware: `auth`
- **Cards row** (3 cards):
  1. 🔴 Unassigned tickets (global — same for everyone)
  2. 🟡 "To Be Worked" tickets assigned to me (tech) or all (admin)
  3. 🔵 "In Progress" tickets assigned to me (tech) or all (admin)
- Each card: large number, label, subtle colored left border or top bar
- Admin sees extra row: same 3 metrics but broken down per technician (simple table or mini-cards)

---

### `/tickets` — Open & Unassigned Tickets
- Middleware: `auth`
- Shows tickets where `assigned_to IS NULL` and status = `to_be_worked`
- **List view** (table or card list):
  - Columns: #ID, Customer, Type badge, Urgent badge, Status badge, Created date, Actions
  - Action: "Open" → modal or page with ticket detail
  - In detail: "Assign to me" button (technician)
  - Admin: "Assign to..." dropdown (list of technicians)
  - Admin: can also change urgency and edit all fields
- Sort by: created_at DESC by default
- Filter by: Type, Urgent

### `/tickets/new` — Create Ticket
- Form fields:
  - Customer Name (text, required)
  - Type (select: Bug / Fixes / Improvement / Info / Typo / Other)
  - Urgent (toggle or checkbox: Yes/No)
  - Status: locked to "To Be Worked" on creation (shown as readonly info)
- Submit button: "Create Ticket"
- On success: redirect to `/tickets` with success toast

### `/tickets/my` — My Tickets
- Middleware: `auth`
- **Technician**: shows tickets where `assigned_to = currentUser.id` and status NOT IN (`done`, `canceled`)
- **Admin**: shows ALL assigned tickets, can filter by technician (dropdown)
- **Filters**: Status (multi-select), Urgent (yes/no)
- **Styled list**:
  - Urgent + In Progress → red bold row with left red border
  - Urgent + To Be Worked → orange bold row with left orange border
  - In Progress (not urgent) → blue left border
  - To Be Worked → amber left border
  - Use `font-semibold` and background tints for urgent rows
- Clicking a ticket opens detail modal: edit status, urgency, assignment (admin only)

---

### `/users` — User Management
- Middleware: `auth` + `admin`
- Table with columns: Name, Family Name, Email, Role, Status (Active/Locked), Actions
- **Actions per row**:
  - Edit (pencil icon) → opens modal with editable fields: name, family_name, email
  - Lock/Unlock (toggle icon) → `PATCH /api/users/:id` to flip `is_locked`
- **Add User button** (top right) → modal form:
  - Name, Family Name, Email, Role (Admin / Technician)
  - Auto-generate temporary password OR send magic link for first login
- Role badge: Admin = indigo, Technician = gray

---

### `/stats` — Statistics
- Middleware: `auth`

#### Section 1 — Current tickets (stat cards)
- "To Do" count
- "In Progress" count
- **Tech**: only his tickets
- **Admin**: global counts

#### Section 2 — Completed in period (bar chart or table)
- Date range picker (from / to)
- Count of Done and Canceled tickets in that range
- **Tech**: only his tickets
- **Admin**: global counts

#### Section 3 — Admin only
- "By Technician" table:
  - Columns: Technician, To Do, In Progress
- "Done/Canceled by Technician" in period (same date range as Section 2):
  - Columns: Technician, Done, Canceled

---

## Sidebar Menu

```
🏠  Dashboard          /
🎫  Tickets            /tickets
➕  New Ticket         /tickets/new
📋  My Tickets         /tickets/my
📊  Stats              /stats
👥  Users              /users        ← admin only
```

- Icons from `lucide-vue-next`
- Active item: white text + indigo background pill or left border
- Bottom of sidebar: user avatar + name + logout button

---

## Auth & Session

- Use **HTTP-only cookies** for session token (JWT or opaque token)
- `useAuth()` composable:
  ```typescript
  const { user, login, logout, isAdmin, isTechnician } = useAuth()
  ```
- Middleware `auth.ts`: if no valid session → redirect to `/login`
- Middleware `admin.ts`: if `user.role !== 'admin'` → redirect to `/`
- Server-side: validate session on every API route via `utils/auth.ts` helper

---

## API Routes

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | Validate credentials, set session cookie |
| POST | `/api/auth/logout` | Clear session cookie |
| POST | `/api/auth/reset-password` | Generate token, send email |
| POST | `/api/auth/set-password` | Validate token, update password |

### Tickets
| Method | Path | Description |
|---|---|---|
| GET | `/api/tickets` | List tickets (with filters via query params) |
| POST | `/api/tickets` | Create new ticket |
| GET | `/api/tickets/:id` | Get ticket detail |
| PUT | `/api/tickets/:id` | Update ticket (admin full, tech limited) |
| DELETE | `/api/tickets/:id` | Delete (admin only) |

### Users
| Method | Path | Description |
|---|---|---|
| GET | `/api/users` | List users (admin only) |
| POST | `/api/users` | Create user (admin only) |
| PUT | `/api/users/:id` | Edit user (admin only) |
| PATCH | `/api/users/:id` | Lock/unlock user (admin only) |

### Stats
| Method | Path | Description |
|---|---|---|
| GET | `/api/stats` | Returns stats object based on role + query params |

---

## Environment Variables

```env
# .env.example

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# OR if using Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT / Session
JWT_SECRET=your-jwt-secret-min-32-chars

# Email (Resend)
RESEND_API_KEY=re_xxxx
FROM_EMAIL=noreply@yourdomain.com

# App
APP_URL=http://localhost:3000
```

---

## UI/UX Details

### Toast Notifications
- Use a simple composable `useToast()` to show success/error messages
- Position: top-right
- Auto-dismiss after 4 seconds

### Modals
- Use `<Modal>` component with Teleport to `body`
- Confirm before locking a user or deleting a ticket

### Pagination
- All lists: 20 items per page
- Simple prev/next with page number

### Responsive
- Sidebar collapses to icons-only on `md` breakpoint
- Tables become cards on mobile

### Empty States
- Each list has an empty state with an illustration (SVG) and a CTA button

---

## Notes for Implementation

1. **Role enforcement must happen server-side** — never trust the client role alone
2. **Locked users** cannot log in — check `is_locked` in the login API
3. **Technicians cannot**:
   - Assign tickets to others
   - Access `/users`
   - See other technicians' stats
4. **When a ticket is assigned**, update `assigned_to` and set status to `to_be_worked` if it was previously unassigned
5. **Magic link tokens** must be single-use and expire after 1 hour
6. Use **optimistic UI** where possible (update local state before server confirms)
7. All forms must show field-level validation errors
8. Add a **loading state** to all async actions (buttons disable + spinner)

---

## Seed Data (for development)

Create a seed script at `server/scripts/seed.ts`:

```typescript
// One admin user
{ name: 'Alice', family_name: 'Admin', email: 'admin@example.com', password: 'Admin1234!', role: 'admin' }

// Two technicians
{ name: 'Bob', family_name: 'Tech', email: 'bob@example.com', password: 'Tech1234!', role: 'technician' }
{ name: 'Carol', family_name: 'Tech', email: 'carol@example.com', password: 'Tech1234!', role: 'technician' }

// 10 sample tickets with mixed types, urgency, and statuses
```

---

*End of specification. Implement this project fully as described above. All pages, components, and API routes should be functional and production-ready.*
