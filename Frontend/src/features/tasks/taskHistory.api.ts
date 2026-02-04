import type { TaskHistory } from "../../types/history"
import { api } from "../../api/axios"

export const taskHistory = async(taskId: number): Promise<TaskHistory[]> => {
    const res = await api.get(`/task/history/${taskId}`)

    return res.data.data
}