// src/pages/TasksPage.tsx
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  createTask,
  deleteTask,
  getDeletedTasks,
  getTasks,
  recoverTask,
} from "../features/tasks/tasks.api"
import type { Task, TaskState } from "../types/task"
import TaskHistoryPage from "./TaskHistory"
import { useAuth } from "../context/AuthContext"

export default function TasksPage() {
  const { user } = useAuth()
  const role = user?.role

  const [tasks, setTasks] = useState<Task[]>([])
  const [deletedTasks, setDeletedTasks] = useState<Task[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const [stateFilter, setStateFilter] = useState<TaskState | "">("")
  const [loading, setLoading] = useState(false)
  const [deletedLoading, setDeletedLoading] = useState(false)
  const [recoveringId, setRecoveringId] = useState<number | null>(null)

  const [newName, setNewName] = useState("")
  const [newInstruction, setNewInstruction] = useState("")
  const [newAssignedTo, setNewAssignedTo] = useState("")
  const [newComment, setNewComment] = useState("")

  const refreshActiveTasks = async (state?: TaskState | "") => {
    setLoading(true)
    await getTasks(state || undefined)
      .then(setTasks)
      .catch(err => {
        console.error(err)
        setError("Failed to load tasks")
      })
      .finally(() => setLoading(false))
  }

  const refreshDeletedTasks = async () => {
    setDeletedLoading(true)
    await getDeletedTasks()
      .then(setDeletedTasks)
      .catch(err => {
        console.error(err)
        setError("Failed to load deleted tasks")
      })
      .finally(() => setDeletedLoading(false))
  }

  useEffect(() => {
    void refreshActiveTasks(stateFilter)
    void refreshDeletedTasks()
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
    await refreshActiveTasks(stateFilter)
    setNewName("")
    setNewInstruction("")
    setNewAssignedTo("")
    setNewComment("")
  }

  const handleDeleteTask = async (taskId: number) => {
    if (role !== "Manager") return
    await deleteTask(taskId, newComment.trim() ? newComment.trim() : undefined)
    setTasks(prev => prev.filter(task => task.id !== taskId))
    await refreshDeletedTasks()
  }

  const handleRecoverTask = async (taskId: number) => {
    if (role !== "Manager") return
    try {
      setRecoveringId(taskId)
      await recoverTask(taskId, newComment.trim() ? newComment.trim() : undefined)
      await refreshDeletedTasks()
      await refreshActiveTasks(stateFilter)
    } catch (err) {
      console.error(err)
      setError("Failed to recover task")
    } finally {
      setRecoveringId(null)
    }
  }

  if (error) {
    return (
      <div className="page-enter text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
        {error}
      </div>
    )
  }

  return (
    <div className="page-enter flex flex-col gap-5">
      <section className="panel p-5 md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-semibold text-slate-50 md:text-3xl">
              Tasks
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              View and manage active and deleted tasks.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(0,14rem)_auto]">
            <div>
              <label className="field-label">Filter by state</label>
              <select
                value={stateFilter}
                onChange={e => setStateFilter(e.target.value as TaskState | "")}
                className="field-input mt-1 min-w-44"
              >
                <option value="">All</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="ONGOING">ONGOING</option>
                <option value="REVIEW">REVIEW</option>
                <option value="ACCEPTED">ACCEPTED</option>
              </select>
            </div>
            <button
              onClick={() => {
                void refreshActiveTasks(stateFilter)
                void refreshDeletedTasks()
              }}
              className="btn-base btn-muted sm:self-end"
            >
              Refresh Board
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="status-pill">Active {tasks.length}</span>
          <span className="status-pill">Deleted {deletedTasks.length}</span>
          {loading && <span className="status-pill text-cyan-200">Syncing active tasks</span>}
          {deletedLoading && <span className="status-pill text-cyan-200">Syncing archive</span>}
        </div>
      </section>

      {role === "Manager" && (
        <section className="panel p-5 md:p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-100">Create Task</h3>
              <p className="text-sm text-slate-400">
                Add a new task.
              </p>
            </div>
            <span className="status-pill">Manager Control</span>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="field-label">Name</label>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="field-input"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="field-label">Developer ID</label>
              <input
                value={newAssignedTo}
                onChange={e => setNewAssignedTo(e.target.value)}
                className="field-input"
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="field-label">Instruction</label>
              <textarea
                value={newInstruction}
                onChange={e => setNewInstruction(e.target.value)}
                className="field-input min-h-[120px]"
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="field-label">Comment (optional)</label>
              <input
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="field-input"
              />
            </div>
          </div>
          <button
            onClick={handleCreateTask}
            className="mt-4 btn-base btn-primary"
          >
            Create Task
          </button>
        </section>
      )}

      <section className="grid gap-4">
        {filteredTasks.length === 0 && !loading ? (
          <div className="panel p-6 text-center">
            <h3 className="text-lg font-semibold text-slate-100">No active tasks found</h3>
            <p className="mt-2 text-sm text-slate-400">
              Adjust the state filter or create a new task to populate the board.
            </p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <article
              key={task.id}
              className="panel p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-100">{task.name}</h3>
                    <span className="status-pill">{task.state}</span>
                  </div>

                  <p className="max-w-3xl text-sm leading-6 text-slate-400">
                    {task.instruction}
                  </p>

                  <div className="mt-1 flex flex-wrap gap-2 text-xs">
                    <span className="status-pill">Task ID #{task.id}</span>
                    <span className="status-pill">
                      Assignee {task.assigned_to_name ?? "Developer"} (#{task.assigned_to})
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    to={`/tasks/${task.id}`}
                    onClick={() => setSelectedTaskId(null)}
                    className="btn-base btn-primary"
                  >
                    Open
                  </Link>
                  <button
                    onClick={() => setSelectedTaskId(task.id)}
                    className="btn-base btn-muted"
                  >
                    View History
                  </button>
                  {role === "Manager" && (
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="btn-base btn-danger"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="panel p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-100">Deleted Tasks</h3>
            <p className="text-sm text-slate-400">
              Restore deleted tasks if needed.
            </p>
          </div>
          <span className="status-pill">Archive</span>
        </div>

        {deletedTasks.length === 0 ? (
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 px-4 py-5 text-sm text-slate-500">
            No deleted tasks found.
          </div>
        ) : (
          <div className="space-y-3">
            {deletedTasks.map(task => (
              <div
                key={task.id}
                className="rounded-2xl border border-slate-700/70 bg-slate-950/55 px-4 py-4 transition duration-200 hover:border-cyan-500/30 hover:bg-slate-950/70"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-slate-100">{task.name}</p>
                      <span className="status-pill">{task.state}</span>
                    </div>
                    <p className="text-sm text-slate-400">{task.instruction}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="status-pill">Task ID #{task.id}</span>
                      <span className="status-pill">
                        Assignee {task.assigned_to_name ?? "Developer"} (#{task.assigned_to})
                      </span>
                    </div>
                  </div>

                  {role === "Manager" && (
                    <button
                      onClick={() => handleRecoverTask(task.id)}
                      disabled={recoveringId === task.id}
                      className="btn-base btn-success disabled:opacity-60"
                    >
                      {recoveringId === task.id ? "Recovering..." : "Recover"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedTaskId && (
        <div className="panel p-4 md:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-100">
                Task History
              </h3>
              <p className="text-sm text-slate-400">
                Task #{selectedTaskId}
              </p>
            </div>
            <button
              onClick={() => setSelectedTaskId(null)}
              className="btn-base btn-muted"
            >
              Close History
            </button>
          </div>

          <TaskHistoryPage taskId={selectedTaskId} />
        </div>
      )}
    </div>
  )
}
