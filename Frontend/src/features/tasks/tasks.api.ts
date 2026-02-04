import { api } from "../../api/axios";
import type { Task } from "../../types/task";

export const getTasks = async(): Promise<Task[]> => {
    const res = await api.get('/tasks/')
    return res.data.data
}   