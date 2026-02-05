// src/types/auth.ts
export type UserRole = "Manager" | "Developer"

export interface AuthUser {
  name: string
  email: string
  phone: string
  role: UserRole
}
