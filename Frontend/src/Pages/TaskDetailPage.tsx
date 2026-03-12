// src/Pages/TaskDetailPage.tsx
import { useParams } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import type { Task } from "../types/task"
import TaskHistoryPage from "./TaskHistory"
import { useAuth } from "../context/AuthContext"
import {
  editTask,
  getTask,
  reviewTask,
  startTask,
  submitTask,
} from "../features/tasks/tasks.api"

export default function TaskDetailPage() {
  const { user } = useAuth()
  const role = user?.role

  const { id } = useParams<{ id: string }>()
  const taskId = Number(id)

  const [task, setTask] = useState<Task | null>(null)
  const [content, setContent] = useState("")
  const [name, setName] = useState("")
  const [instruction, setInstruction] = useState("")
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Fetch task
  useEffect(() => {
    if (!taskId) return

    getTask(taskId)
      .then(data => {
        setTask(data)
        setContent(data.content ?? "")
        setName(data.name ?? "")
        setInstruction(data.instruction ?? "")
      })
      .finally(() => setLoading(false))
  }, [taskId])

  /* ---------------- ACTION HANDLERS ---------------- */

  const handleStartTask = async () => {
    if (!task) return
    setActionLoading(true)

    const updated = await startTask(task.id, comment || undefined)
    setTask(updated)

    setActionLoading(false)
  }

  const handleSubmitForReview = async () => {
    if (!task) return
    setActionLoading(true)

    // Save content before submitting
    await editTask(task.id, { content })
    const updated = await submitTask(task.id, comment || undefined)
    setTask(updated)

    setActionLoading(false)
  }

  const handleAcceptTask = async () => {
    if (!task) return
    setActionLoading(true)

    const updated = await reviewTask(task.id, {
      state: "ACCEPTED",
      comment: comment || undefined,
    })
    setTask(updated)

    setActionLoading(false)
  }

  const handleRejectTask = async () => {
    if (!task) return
    setActionLoading(true)

    const updated = await reviewTask(task.id, {
      state: "ONGOING",
      comment: comment || undefined,
    })
    setTask(updated)

    setActionLoading(false)
  }

  const handleSaveEdits = async () => {
    if (!task) return
    setActionLoading(true)

    const updated = await editTask(task.id, {
      name: name.trim() ? name : undefined,
      instruction: instruction.trim() ? instruction : undefined,
      content: content.trim() ? content : undefined,
      comment: comment || undefined,
    })
    setTask(prev => (prev ? { ...prev, ...updated } : updated))
    setActionLoading(false)
  }

  const handleSaveContent = async () => {
    if (!task) return
    setActionLoading(true)
    const updated = await editTask(task.id, {
      content: content.trim() ? content : undefined,
      comment: comment || undefined,
    })
    setTask(prev => (prev ? { ...prev, ...updated } : updated))
    setActionLoading(false)
  }

  const canEditContent = useMemo(() => {
    if (!task) return false
    if (role === "Developer") return task.state === "ONGOING"
    if (role === "Manager") return task.state !== "ACCEPTED"
    return false
  }, [role, task])

  /* ---------------- RENDER ---------------- */

  if (loading) return <div className="page-enter text-sm text-slate-400">Loading task...</div>
  if (!task) return <div className="page-enter text-sm text-slate-400">Task not found</div>

  return (
    <div className="page-enter flex flex-col gap-6">
      <div className="panel p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-100">
              {task.name}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              {task.instruction}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="status-pill">State {task.state}</span>
            <span className="status-pill">
              Assignee {task.assigned_to_name ?? "Developer"} (#{task.assigned_to})
            </span>
          </div>
        </div>
      </div>

      <div className="panel p-5 md:p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <label className="text-sm text-slate-300">Task Content</label>
          <span className="text-xs text-slate-500">
            {canEditContent ? "Editable in current state" : "Read-only in current state"}
          </span>
        </div>
        <textarea
          value={content}
          disabled={!canEditContent}
          onChange={e => setContent(e.target.value)}
          className="field-input min-h-[140px] p-3 disabled:opacity-60"
          placeholder="Work on the task here..."
        />
      </div>

      {role === "Manager" && task.state !== "ACCEPTED" && (
        <div className="panel p-5 md:p-6">
          <h3 className="mb-3 text-lg font-semibold text-slate-200">
            Edit Task
          </h3>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="field-label">Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="field-input"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="field-label">Instruction</label>
              <textarea
                value={instruction}
                onChange={e => setInstruction(e.target.value)}
                className="field-input min-h-[100px]"
              />
            </div>
            <button
              onClick={handleSaveEdits}
              disabled={actionLoading}
              className="self-start btn-base btn-primary"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      <div className="panel p-5 md:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-300">
              Comment (optional)
            </label>
            <input
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="field-input"
              placeholder="Add a note for this action..."
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            {role === "Developer" && task.state === "ASSIGNED" && (
              <button
                onClick={handleStartTask}
                disabled={actionLoading}
                className="btn-base btn-primary"
              >
                Start Task
              </button>
            )}

            {role === "Developer" && task.state === "ONGOING" && (
              <>
                <button
                  onClick={handleSaveContent}
                  disabled={actionLoading}
                  className="btn-base btn-muted"
                >
                  Save Content
                </button>
                <button
                  onClick={handleSubmitForReview}
                  disabled={actionLoading}
                  className="btn-base btn-primary"
                >
                  Submit for Review
                </button>
              </>
            )}

            {role === "Manager" && task.state === "REVIEW" && (
              <>
                <button
                  onClick={handleAcceptTask}
                  disabled={actionLoading}
                  className="btn-base btn-success"
                >
                  Accept
                </button>

                <button
                  onClick={handleRejectTask}
                  disabled={actionLoading}
                  className="btn-base btn-danger"
                >
                  Send Back
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="panel p-5 md:p-6">
        <TaskHistoryPage taskId={task.id} />
      </div>
    </div>
  )
}
