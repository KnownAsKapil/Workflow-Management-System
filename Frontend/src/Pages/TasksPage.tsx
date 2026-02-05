// src/pages/TasksPage.tsx
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { createTask, deleteTask, getTasks } from "../features/tasks/tasks.api"
import type { Task, TaskState } from "../types/task"
import TaskHistoryPage from "./TaskHistory"
import { useAuth } from "../context/AuthContext"

export default function TasksPage() {
  const { user } = useAuth()
  const role = user?.role

  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const [stateFilter, setStateFilter] = useState<TaskState | "">("")
  const [loading, setLoading] = useState(false)

  const [newName, setNewName] = useState("")
  const [newInstruction, setNewInstruction] = useState("")
  const [newAssignedTo, setNewAssignedTo] = useState("")
  const [newComment, setNewComment] = useState("")

  console.log("TasksPage mounted")

  useEffect(() => {
    setLoading(true)
    getTasks(stateFilter || undefined)
      .then(setTasks)
      .catch(err => {
        console.error(err)
        setError("Failed to load tasks")
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredTasks = useMemo(() => tasks, [tasks])

  const handleCreateTask = async () => {
    if (role !== "Manager") return
    const assignedToId = Number(newAssignedTo)
    if (!newName.trim() || !newInstruction.trim() || !assignedToId) {
      setError("Name, instruction, and developer ID are required")
      return
    }
    setError(null)
    await createTask({
      name: newName.trim(),
      instruction: newInstruction.trim(),
      assigned_to: assignedToId,
      comment: newComment.trim() ? newComment.trim() : undefined,
    })
    const refreshed = await getTasks(stateFilter || undefined)
    setTasks(refreshed)
    setNewName("")
    setNewInstruction("")
    setNewAssignedTo("")
    setNewComment("")
  }

  const handleDeleteTask = async (taskId: number) => {
    if (role !== "Manager") return
    await deleteTask(taskId, newComment.trim() ? newComment.trim() : undefined)
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }

  if (error) {
    return (
      <div className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-4 py-3">
        {error}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-slate-300">Filter by state</label>
        <select
          value={stateFilter}
          onChange={e => setStateFilter(e.target.value as TaskState | "")}
          className="rounded-md bg-slate-900 border border-slate-700 p-2 text-slate-100"
        >
          <option value="">All</option>
          <option value="ASSIGNED">ASSIGNED</option>
          <option value="ONGOING">ONGOING</option>
          <option value="REVIEW">REVIEW</option>
          <option value="ACCEPTED">ACCEPTED</option>
        </select>
        <button
          onClick={() => {
            setLoading(true)
            getTasks(stateFilter || undefined)
              .then(setTasks)
              .catch(err => {
                console.error(err)
                setError("Failed to load tasks")
              })
              .finally(() => setLoading(false))
          }}
          className="px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-sm"
        >
          Apply
        </button>
        {loading && <span className="text-xs text-slate-400">Loading...</span>}
      </div>

      {/* Manager: Create Task */}
      {role === "Manager" && (
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">
            Create Task
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Name</label>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="rounded-md bg-slate-900 border border-slate-700 p-2 text-slate-100"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Developer ID</label>
              <input
                value={newAssignedTo}
                onChange={e => setNewAssignedTo(e.target.value)}
                className="rounded-md bg-slate-900 border border-slate-700 p-2 text-slate-100"
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs text-slate-400">Instruction</label>
              <textarea
                value={newInstruction}
                onChange={e => setNewInstruction(e.target.value)}
                className="min-h-[100px] rounded-md bg-slate-900 border border-slate-700 p-2 text-slate-100"
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs text-slate-400">
                Comment (optional)
              </label>
              <input
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="rounded-md bg-slate-900 border border-slate-700 p-2 text-slate-100"
              />
            </div>
          </div>
          <button
            onClick={handleCreateTask}
            className="mt-3 px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500"
          >
            Create
          </button>
        </div>
      )}

      {/* Tasks list */}
      {filteredTasks.map(task => (
        <div
          key={task.id}
          className="rounded-lg border border-slate-700 bg-slate-800 p-4"
        >
          <div className="flex items-start justify-between">
            {/* Task info */}
            <div className="flex flex-col gap-1">
              <h3 className="text-slate-100 font-medium">
                {task.name}
              </h3>

              <p className="text-sm text-slate-400">
                {task.instruction}
              </p>

              <div className="mt-1 flex gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                  State: {task.state}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                  Task ID: {task.id}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/tasks/${task.id}`}
                onClick={() => setSelectedTaskId(null)}
                className="text-sm px-3 py-1.5 rounded-md
                           bg-indigo-600 hover:bg-indigo-500 transition"
              >
                Open
              </Link>
              <button
                onClick={() => setSelectedTaskId(task.id)}
                className="text-sm px-3 py-1.5 rounded-md
                           bg-slate-700 hover:bg-slate-600 transition"
              >
                View History
              </button>
              {role === "Manager" && (
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-sm px-3 py-1.5 rounded-md
                             bg-red-600 hover:bg-red-500 transition"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Close history */}
      {selectedTaskId && (
        <button
          onClick={() => setSelectedTaskId(null)}
          className="self-start text-sm px-3 py-1.5 rounded-md
                     bg-slate-700 hover:bg-slate-600 transition"
        >
          Close History
        </button>
      )}

      {/* History panel */}
      {selectedTaskId && (
        <div className="mt-4">
          <TaskHistoryPage taskId={selectedTaskId} />
        </div>
      )}
    </div>
  )
}
