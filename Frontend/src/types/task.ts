export type TaskState = "ASSIGNED" | "ONGOING" | "REVIEW" | "ACCEPTED"

export interface Task {
  id: number
  name: string
  instruction: string
  content: string
  state: TaskState
  created_by: number
  assigned_to: number
  created_at: string
  updated_at: string
}