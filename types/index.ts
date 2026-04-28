export type UserRole = 'super_admin' | 'admin' | 'member'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type ProjectMemberRole = 'owner' | 'member'

export interface User {
  id: string
  name: string
  family_name: string
  email: string
  role: UserRole
  is_locked: boolean
  created_at: string
}

export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  role: ProjectMemberRole
  joined_at: string
  user: Pick<User, 'id' | 'name' | 'family_name' | 'email'>
}

export interface Column {
  id: string
  project_id: string
  name: string
  order: number
  created_at: string
  tasks: Task[]
}

export interface Task {
  id: string
  project_id: string
  column_id: string
  title: string
  description?: string | null
  priority: TaskPriority
  assigned_to?: string | null
  assignee?: Pick<User, 'id' | 'name' | 'family_name'> | null
  created_by: string
  creator?: Pick<User, 'id' | 'name' | 'family_name'>
  due_date?: string | null
  order: number
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  description?: string | null
  created_by: string
  created_at: string
  updated_at: string
  creator?: Pick<User, 'id' | 'name' | 'family_name'>
  members: ProjectMember[]
  columns: Column[]
  _count?: { tasks: number; columns: number }
}
