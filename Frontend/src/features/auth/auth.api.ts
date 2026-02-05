import { api } from "../../api/axios"
import type { AuthUser, UserRole } from "../../types/auth"

export const getMe = async (): Promise<AuthUser> => {
  const res = await api.get("/auth/me")
  return res.data.data
}

export const register = async (payload: {
  name: string
  email: string
  phone: string
  password: string
  role: UserRole
}): Promise<void> => {
  await api.post("/auth/register", payload)
}

export const makeTeam = async (developerId: number): Promise<void> => {
  await api.post(`/auth/team/${developerId}`)
}

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout")
}
