import type { TaskHistory } from "../../types/history"
import { api } from "../../api/axios"

export const taskHistory = async(taskId: number): Promise<TaskHistory[]> => {
    const res = await api.get(`/tasks/history/${taskId}`)

    return res.data.data
}

export const getAllHistory = async (): Promise<TaskHistory[]> => {
  const res = await api.get("/tasks/history")
  return res.data.data
}
