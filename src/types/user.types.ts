import type { Role } from "./role.types"

export interface User {
  id: string
  email: string
  name: string
  role: Role
  companyId?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

export interface CreateUserData {
  email: string
  password: string
  name: string
  role: Role
  companyId?: string
  isActive?: boolean
}

export interface UpdateUserData {
  name?: string
  role?: Role
  companyId?: string
  isActive?: boolean
}