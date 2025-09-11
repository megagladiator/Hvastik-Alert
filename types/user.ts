export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export enum UserStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  PENDING = 'pending'
}

export interface User {
  id: string
  email: string
  created_at: string
  last_sign_in?: string
  email_confirmed: boolean
  status: UserStatus
  role: UserRole
  pets_count?: number
  chats_count?: number
  location?: string
  phone?: string
  name?: string
}

export interface UserStats {
  total_users: number
  active_users: number
  blocked_users: number
  new_users_today: number
  new_users_this_week: number
  new_users_this_month: number
}

export interface UserFilters {
  search: string
  role: UserRole | 'all'
  status: UserStatus | 'all'
  date_from?: string
  date_to?: string
}


