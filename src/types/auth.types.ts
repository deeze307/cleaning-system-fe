import type { Role } from './role.types'
import type { User } from './user.types'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  role: Role
  companyId?: string
}

export interface AuthResponse {
  access_token: string
  user: User
}