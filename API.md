# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All authenticated endpoints require a valid JWT token in an HTTP-only cookie named `auth_token`.

### Rate Limits
- **Login**: 5 requests per 15 minutes per IP
- **Password Reset**: 3 requests per 15 minutes per IP
- **General API**: 100 requests per minute per IP

---

## Auth Endpoints

### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "Admin1234!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "name": "Alice",
    "family_name": "Admin",
    "email": "admin@example.com",
    "role": "admin",
    "is_locked": false,
    "created_at": "2026-04-03T10:00:00.000Z"
  }
}
```

**Errors:**
- `400` - Email and password are required
- `401` - Invalid credentials
- `403` - Account is locked
- `429` - Too many requests

---

### POST /api/auth/logout
Logout current user (clears auth cookie).

**Response (200):**
```json
{
  "message": "Logged out"
}
```

---

### GET /api/auth/me
Get current authenticated user.

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "name": "Alice",
    "family_name": "Admin",
    "email": "admin@example.com",
    "role": "admin",
    "is_locked": false,
    "created_at": "2026-04-03T10:00:00.000Z"
  }
}
```

**Errors:**
- `401` - Unauthorized

---

### POST /api/auth/reset-password
Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "If the email exists, a reset link has been sent."
}
```

**Errors:**
- `400` - Email is required
- `429` - Too many requests

---

### POST /api/auth/set-password
Set new password using reset token.

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "NewPassword123!"
}
```

**Response (200):**
```json
{
  "message": "Password updated successfully"
}
```

**Errors:**
- `400` - Token and password are required / Password too short
- `401` - Invalid or expired token

---

## Ticket Endpoints

### GET /api/tickets
List tickets with optional filters.

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 20)
- `status` (string) - Filter by status: `to_be_worked`, `in_progress`, `done`, `canceled`
- `type` (string) - Filter by type: `Bug`, `Fixes`, `Improvement`, `Info`, `Typo`, `Other`
- `urgent` (boolean) - Filter by urgency: `true`, `false`
- `unassigned` (boolean) - Show only unassigned tickets: `true`
- `assigned_to` (uuid) - Filter by assigned user ID
- `created_by` (uuid) - Filter by creator user ID

**Response (200):**
```json
{
  "tickets": [
    {
      "id": "uuid",
      "customer_name": "John Doe",
      "description": "Login button not working",
      "type": "Bug",
      "is_urgent": true,
      "status": "to_be_worked",
      "assigned_to": null,
      "created_by": "uuid",
      "created_at": "2026-04-06T10:00:00.000Z",
      "updated_at": "2026-04-06T10:00:00.000Z",
      "assignee": null,
      "creator": {
        "id": "uuid",
        "name": "Alice",
        "family_name": "Admin",
        "email": "admin@example.com",
        "role": "admin"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Errors:**
- `401` - Unauthorized

---

### POST /api/tickets
Create a new ticket.

**Request Body:**
```json
{
  "customer_name": "John Doe",
  "description": "Login button not working on mobile",
  "type": "Bug",
  "is_urgent": true,
  "assigned_to": "uuid" // Optional, admin only
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "customer_name": "John Doe",
  "description": "Login button not working on mobile",
  "type": "Bug",
  "is_urgent": true,
  "status": "to_be_worked",
  "assigned_to": null,
  "created_by": "uuid",
  "created_at": "2026-04-06T10:00:00.000Z",
  "updated_at": "2026-04-06T10:00:00.000Z",
  "assignee": null,
  "creator": { /* user object */ }
}
```

**Errors:**
- `400` - Customer name is required / Invalid ticket type
- `401` - Unauthorized

---

### GET /api/tickets/:id
Get ticket details by ID.

**Response (200):**
```json
{
  "id": "uuid",
  "customer_name": "John Doe",
  "description": "Login button not working",
  "type": "Bug",
  "is_urgent": true,
  "status": "in_progress",
  "assigned_to": "uuid",
  "created_by": "uuid",
  "created_at": "2026-04-06T10:00:00.000Z",
  "updated_at": "2026-04-06T11:30:00.000Z",
  "assignee": { /* user object */ },
  "creator": { /* user object */ }
}
```

**Errors:**
- `401` - Unauthorized
- `404` - Ticket not found

---

### PUT /api/tickets/:id
Update a ticket.

**Admin can update:**
- `customer_name`, `description`, `type`, `is_urgent`, `status`, `assigned_to`

**Technician can:**
- Assign unassigned ticket to themselves
- Update status of their own tickets

**Request Body (Admin):**
```json
{
  "customer_name": "Jane Doe",
  "description": "Updated description",
  "type": "Improvement",
  "is_urgent": false,
  "status": "in_progress",
  "assigned_to": "uuid"
}
```

**Request Body (Technician - assign to self):**
```json
{
  "assigned_to": "my-user-id"
}
```

**Request Body (Technician - update status):**
```json
{
  "status": "done"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "customer_name": "Jane Doe",
  // ... updated ticket object
}
```

**Errors:**
- `400` - Invalid ticket type / Invalid status
- `401` - Unauthorized
- `403` - You can only update your own tickets (technician)
- `404` - Ticket not found

---

### DELETE /api/tickets/:id
Delete a ticket (admin only).

**Response (200):**
```json
{
  "ok": true
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Forbidden (not admin)
- `404` - Ticket not found

---

## User Endpoints

All user endpoints require admin role.

### GET /api/users
List all users.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Alice",
    "family_name": "Admin",
    "email": "admin@example.com",
    "role": "admin",
    "is_locked": false,
    "created_at": "2026-04-03T10:00:00.000Z"
  }
]
```

**Errors:**
- `401` - Unauthorized
- `403` - Forbidden (not admin)

---

### POST /api/users
Create a new user.

**Request Body:**
```json
{
  "name": "Bob",
  "family_name": "Tech",
  "email": "bob@example.com",
  "role": "technician"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "name": "Bob",
    "family_name": "Tech",
    "email": "bob@example.com",
    "role": "technician",
    "is_locked": false,
    "created_at": "2026-04-06T10:00:00.000Z"
  },
  "message": "User created. A setup email has been sent."
}
```

**Errors:**
- `400` - Validation errors
- `401` - Unauthorized
- `403` - Forbidden (not admin)
- `409` - Email already exists

---

### PUT /api/users/:id
Update user details.

**Request Body:**
```json
{
  "name": "Robert",
  "family_name": "Technician",
  "email": "robert@example.com",
  "role": "admin"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Robert",
  "family_name": "Technician",
  "email": "robert@example.com",
  "role": "admin",
  "is_locked": false,
  "created_at": "2026-04-03T10:00:00.000Z"
}
```

**Errors:**
- `400` - Validation errors
- `401` - Unauthorized
- `403` - Forbidden (not admin)
- `404` - User not found

---

### PATCH /api/users/:id
Lock or unlock a user account.

**Request Body:**
```json
{
  "is_locked": true
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Bob",
  "family_name": "Tech",
  "email": "bob@example.com",
  "role": "technician",
  "is_locked": true,
  "created_at": "2026-04-03T10:00:00.000Z"
}
```

**Errors:**
- `400` - is_locked field is required
- `401` - Unauthorized
- `403` - Forbidden (not admin)
- `404` - User not found

---

## Statistics Endpoints

### GET /api/dashboard
Get dashboard statistics.

**Response (200) - Admin:**
```json
{
  "unassigned": 5,
  "todo": 12,
  "in_progress": 8,
  "by_technician": [
    {
      "user": {
        "id": "uuid",
        "name": "Bob",
        "family_name": "Tech"
      },
      "to_be_worked": 3,
      "in_progress": 2,
      "done": 15,
      "canceled": 1
    }
  ]
}
```

**Response (200) - Technician:**
```json
{
  "unassigned": 5,
  "todo": 3,
  "in_progress": 2
}
```

**Errors:**
- `401` - Unauthorized

---

### GET /api/stats
Get detailed statistics with date range.

**Query Parameters:**
- `from` (ISO date) - Start date for completed tickets
- `to` (ISO date) - End date for completed tickets

**Response (200) - Admin:**
```json
{
  "current": {
    "to_be_worked": 12,
    "in_progress": 8
  },
  "completed": {
    "done": 45,
    "canceled": 3
  },
  "by_technician": [
    {
      "user": { /* user object */ },
      "to_be_worked": 3,
      "in_progress": 2,
      "done": 15,
      "canceled": 1
    }
  ]
}
```

**Response (200) - Technician:**
```json
{
  "current": {
    "to_be_worked": 3,
    "in_progress": 2
  },
  "completed": {
    "done": 15,
    "canceled": 1
  }
}
```

**Errors:**
- `401` - Unauthorized

---

## Real-time Updates (SSE)

### GET /sse
Server-Sent Events stream for real-time ticket updates.

**Authentication:** Required (JWT cookie)

**Rate Limit:** 10 connections per hour per user

**Event Types:**
- `connected` - Initial connection confirmation
- `ticket:created` - New ticket created
- `ticket:updated` - Ticket updated
- `ticket:deleted` - Ticket deleted

**Event Format:**
```
data: {"type":"ticket:created","data":{...ticket object...}}

data: {"type":"ticket:updated","data":{...ticket object...}}

data: {"type":"ticket:deleted","data":{"id":"uuid"}}
```

**Filtering:**
- **Admins** receive all events
- **Technicians** receive events for:
  - Unassigned tickets
  - Tickets assigned to them
  - Tickets created by them

**Connection:**
```javascript
const eventSource = new EventSource('/sse')

eventSource.onmessage = (event) => {
  const { type, data } = JSON.parse(event.data)
  console.log(type, data)
}

eventSource.onerror = () => {
  eventSource.close()
  // Reconnect logic
}
```

**Errors:**
- `401` - Unauthorized
- `429` - Too many connections

---

## Error Response Format

All errors follow this format:

```json
{
  "statusCode": 400,
  "statusMessage": "Validation error message"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate email)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error
