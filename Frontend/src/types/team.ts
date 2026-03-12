export interface TeamMember {
  id: number
  name: string
  email?: string
  phone?: string
  role?: string
}

export interface DeveloperOption {
  id: number
  name: string
  email?: string
  phone?: string
  is_in_team?: boolean
}
