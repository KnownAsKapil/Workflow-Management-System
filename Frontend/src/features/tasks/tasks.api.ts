import { api } from "../../api/axios"
import type { Task, TaskState } from "../../types/task"

export const getTasks = async (
  state?: TaskState
): Promise<Task[]> => {
  const res = await api.get("/tasks/", {
    params: state ? { state } : undefined,
  })
  return res.data.data
}

export const getTask = async (taskId: number): Promise<Task> => {
  const res = await api.get(`/tasks/${taskId}`)
  return res.data.data
}

export const createTask = async (payload: {
  name: string
  instruction: string
  assigned_to: number
  comment?: string
}): Promise<void> => {
  await api.post("/tasks/", payload)
}

export const deleteTask = async (
  taskId: number,
  comment?: string
): Promise<void> => {
  await api.delete(`/tasks/${taskId}`, {
    data: comment ? { comment } : undefined,
  })
}

export const editTask = async (
  taskId: number,
  payload: {
    name?: string
    instruction?: string
    content?: string
    comment?: string
  }
): Promise<Task> => {
  const res = await api.patch(`/tasks/${taskId}`, payload)
  return res.data.data
}

export const startTask = async (
  taskId: number,
  comment?: string
): Promise<Task> => {
  const res = await api.patch(`/tasks/${taskId}/start`, comment ? { comment } : {})
  return res.data.data
}

export const submitTask = async (
  taskId: number,
  comment?: string
): Promise<Task> => {
  const res = await api.patch(`/tasks/${taskId}/submit`, comment ? { comment } : {})
  return res.data.data
}

export const reviewTask = async (
  taskId: number,
  payload: { state: "ACCEPTED" | "ONGOING"; comment?: string }
): Promise<Task> => {
  const res = await api.patch(`/tasks/${taskId}/review`, payload)
  return res.data.data
}
