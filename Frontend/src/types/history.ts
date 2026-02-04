
import type { TaskState } from "./task"

export interface TaskHistory {
  id: number
  task_id: number
  from_state: TaskState | null
  to_state: TaskState
  actor_id: number
  actor_role: "Manager" | "Developer"
  comment: string | null
  created_at: string
}
