
export type UserRole = "Manager" | "Developer"

export interface User {
  id: number
  role: UserRole
}
