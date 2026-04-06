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
  description?: string | null
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

export interface DashboardStats {
  unassigned: number
  to_be_worked: number
  in_progress: number
  by_technician?: TechnicianStats[]
}

export interface TechnicianStats {
  user: Pick<User, 'id' | 'name' | 'family_name'>
  to_be_worked: number
  in_progress: number
  done: number
  canceled: number
}
