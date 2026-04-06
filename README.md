# 🎫 Ticket Management System

A professional full-stack ticket management system built with **Nuxt 3**, featuring real-time updates, role-based access control, and a modern UI.

![Nuxt 3](https://img.shields.io/badge/Nuxt-3.x-00DC82?logo=nuxt.js)
![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?logo=prisma)

## ✨ Features

### Core Functionality
- 🎟️ **Ticket Management** - Create, assign, update, and track support tickets
- 👥 **User Management** - Admin controls for managing team members
- 📊 **Real-time Updates** - Server-Sent Events (SSE) for live ticket updates
- 🔐 **Role-Based Access** - Admin and Technician roles with different permissions
- 📈 **Statistics Dashboard** - Visual analytics and performance metrics
- 🌍 **Internationalization** - English and Italian language support
- 🌓 **Dark Mode** - Full dark theme support

### Security
- 🔒 JWT-based authentication with HTTP-only cookies
- 🛡️ Rate limiting on all critical endpoints
- 🔑 Password reset via email with secure tokens
- 👮 Role-based authorization on API routes
- 🚫 Account locking for security

### UX Features
- ⚡ Debounced filters for smooth performance
- 🔗 URL-persisted filters (shareable filtered views)
- 🧹 Clear all filters button
- 💀 Skeleton loaders for better perceived performance
- 📱 Fully responsive design

## 🚀 Quick Start

### Prerequisites
- Node.js 22.x
- PostgreSQL database
- SMTP server (for email functionality)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ag-backend-challenge
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/tickets"
JWT_SECRET="your-secret-key-min-32-chars"
SMTP_HOST="smtp.example.com"
SMTP_PORT=465
SMTP_USER="your-email@example.com"
SMTP_PASS="your-password"
FROM_EMAIL="noreply@example.com"
APP_URL="http://localhost:3000"
```

4. **Start PostgreSQL** (using Docker)
```bash
docker-compose up -d
```

5. **Run database migrations**
```bash
npm run db:migrate
```

6. **Seed the database** (optional - creates demo users and tickets)
```bash
npm run db:seed
```

7. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:3000`

### Default Users (after seeding)
- **Admin**: `admin@example.com` / `Admin1234!`
- **Technician 1**: `bob@example.com` / `Tech1234!`
- **Technician 2**: `carol@example.com` / `Tech1234!`

## 📁 Project Structure

```
├── app/
│   ├── components/       # Vue components
│   │   ├── layout/      # Sidebar, header
│   │   ├── tickets/     # Ticket-related components
│   │   ├── ui/          # Reusable UI components
│   │   └── stats/       # Statistics components
│   ├── composables/     # Vue composables
│   ├── layouts/         # Page layouts
│   ├── middleware/      # Route middleware
│   ├── pages/           # Application pages
│   ├── plugins/         # Nuxt plugins
│   └── stores/          # Pinia stores
├── server/
│   ├── api/             # API endpoints
│   │   ├── auth/       # Authentication
│   │   ├── tickets/    # Ticket CRUD
│   │   ├── users/      # User management
│   │   └── stats/      # Statistics
│   ├── middleware/      # Server middleware
│   ├── routes/          # Custom routes (SSE)
│   └── utils/           # Server utilities
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── migrations/      # Database migrations
│   └── seed.ts          # Seed data
└── i18n/
    └── locales/         # Translation files
```

## 🎯 User Roles

### Admin
- Full access to all tickets
- Create, edit, delete any ticket
- Assign tickets to any technician
- Manage users (create, edit, lock/unlock)
- View global statistics
- See all technicians' workload

### Technician
- View unassigned tickets
- Assign tickets to themselves
- Update status of their own tickets
- View their own statistics
- Cannot manage users
- Cannot delete tickets

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/login              # Login
POST   /api/auth/logout             # Logout
GET    /api/auth/me                 # Get current user
POST   /api/auth/reset-password     # Request password reset
POST   /api/auth/set-password       # Set new password
```

### Tickets
```
GET    /api/tickets                 # List tickets (with filters)
POST   /api/tickets                 # Create ticket
GET    /api/tickets/:id             # Get ticket details
PUT    /api/tickets/:id             # Update ticket
DELETE /api/tickets/:id             # Delete ticket (admin only)
```

### Users
```
GET    /api/users                   # List users (admin only)
POST   /api/users                   # Create user (admin only)
PUT    /api/users/:id               # Update user (admin only)
PATCH  /api/users/:id               # Lock/unlock user (admin only)
```

### Statistics
```
GET    /api/dashboard               # Dashboard stats
GET    /api/stats                   # Detailed statistics
```

### Real-time
```
GET    /sse                         # Server-Sent Events stream
```

## 🛡️ Security Features

### Rate Limiting
- **Login**: 5 attempts per 15 minutes
- **Password Reset**: 3 attempts per 15 minutes
- **SSE Connections**: 10 per hour
- **General API**: 100 requests per minute

### Authentication
- JWT tokens with 7-day expiration
- HTTP-only cookies (XSS protection)
- Secure flag in production
- SameSite: Lax

### Authorization
- Server-side role checks on all protected routes
- SSE broadcasts filtered by user role and ticket ownership
- Locked users cannot log in

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Nuxt 3 (Vue 3 + Composition API) |
| Styling | Tailwind CSS v3 |
| Icons | Lucide Vue Next |
| State | Pinia |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (jsonwebtoken) |
| Email | Nodemailer |
| Validation | Zod + Vee-Validate |
| Charts | Chart.js + vue-chartjs |
| i18n | @nuxtjs/i18n |

## 📜 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with demo data
npm run db:reset     # Reset database (caution!)
```

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | Secret for JWT signing (min 32 chars) | - |
| `SMTP_HOST` | SMTP server hostname | localhost |
| `SMTP_PORT` | SMTP server port | 587 |
| `SMTP_USER` | SMTP username | - |
| `SMTP_PASS` | SMTP password | - |
| `FROM_EMAIL` | Sender email address | noreply@tickets.local |
| `APP_URL` | Application URL | http://localhost:3000 |

## 🐳 Docker Support

Start PostgreSQL with Docker Compose:

```bash
docker-compose up -d
```

The `docker-compose.yml` includes:
- PostgreSQL 15
- Persistent volume for data
- Port 5432 exposed

## 📝 Database Schema

### Users Table
- `id` (UUID, PK)
- `name`, `family_name`, `email`
- `password` (bcrypt hashed)
- `role` (admin | technician)
- `is_locked` (boolean)
- `reset_token`, `reset_token_expires_at`
- `created_at`

### Tickets Table
- `id` (UUID, PK)
- `customer_name`, `description`
- `type` (Bug | Fixes | Improvement | Info | Typo | Other)
- `is_urgent` (boolean)
- `status` (to_be_worked | in_progress | done | canceled)
- `assigned_to` (FK to users)
- `created_by` (FK to users)
- `created_at`, `updated_at`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Built with [Nuxt 3](https://nuxt.com/)
- UI inspired by [Linear](https://linear.app/) and [Plane](https://plane.so/)
- Icons by [Lucide](https://lucide.dev/)
