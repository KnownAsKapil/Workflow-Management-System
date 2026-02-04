// src/pages/TasksPage.tsx
import { useEffect, useState } from "react"
import { getTasks } from "../features/tasks/tasks.api.ts"
import type { Task } from "../types/task.ts"

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getTasks()
      .then(setTasks)
      .catch((err) => {
        console.error(err)
        setError("Failed to load tasks")
      })
  }, [])

  if (error) return <div>{error}</div>

  return (
    <pre className="text-sm">
      {JSON.stringify(tasks, null, 2)}
    </pre>
  )
}
