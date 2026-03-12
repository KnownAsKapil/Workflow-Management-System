import { api } from "../../api/axios"
import type { DeveloperOption, TeamMember } from "../../types/team"

export const getTeamMembers = async (): Promise<TeamMember[]> => {
  const res = await api.get("/team")
  return res.data.data
}

export const getDevelopers = async (): Promise<DeveloperOption[]> => {
  const res = await api.get("/team/developers")
  return res.data.data
}
