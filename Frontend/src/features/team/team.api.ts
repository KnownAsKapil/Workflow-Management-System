import { api } from "../../api/axios"
import type { TeamMember } from "../../types/team"

export const getTeamMembers = async (): Promise<TeamMember[]> => {
  const res = await api.get("/team")
  return res.data.data
}
