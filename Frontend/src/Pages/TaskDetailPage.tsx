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

  if (loading) return <div>Loading task...</div>
  if (!task) return <div>Task not found</div>

  return (
    <div className="flex flex-col gap-6">
      {/* Task metadata */}
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
        <h2 className="text-lg font-semibold text-slate-100">
          {task.name}
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          {task.instruction}
        </p>
        <div className="mt-2 text-xs text-slate-300">
          State: <span className="font-medium">{task.state}</span>
        </div>
      </div>

      {/* Task content */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-slate-300">Task Content</label>
        <textarea
          value={content}
          disabled={!canEditContent}
          onChange={e => setContent(e.target.value)}
          className="min-h-[140px] rounded-md bg-slate-900 border border-slate-700
                     p-3 text-slate-100 disabled:opacity-60"
          placeholder="Work on the task here..."
        />
      </div>

      {/* Manager edits */}
      {role === "Manager" && task.state !== "ACCEPTED" && (
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">
            Edit Task
          </h3>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="rounded-md bg-slate-900 border border-slate-700 p-2 text-slate-100"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Instruction</label>
              <textarea
                value={instruction}
                onChange={e => setInstruction(e.target.value)}
                className="min-h-[100px] rounded-md bg-slate-900 border border-slate-700 p-2 text-slate-100"
              />
            </div>
            <button
              onClick={handleSaveEdits}
              disabled={actionLoading}
              className="self-start px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Comment */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-slate-300">
          Comment (optional)
        </label>
        <input
          value={comment}
          onChange={e => setComment(e.target.value)}
          className="rounded-md bg-slate-900 border border-slate-700 p-2 text-slate-100"
          placeholder="Add a note for this action..."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        {/* Developer actions */}
        {role === "Developer" && task.state === "ASSIGNED" && (
          <button
            onClick={handleStartTask}
            disabled={actionLoading}
            className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500"
          >
            Start Task
          </button>
        )}

        {role === "Developer" && task.state === "ONGOING" && (
          <>
            <button
              onClick={handleSaveContent}
              disabled={actionLoading}
              className="px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600"
            >
              Save Content
            </button>
            <button
              onClick={handleSubmitForReview}
              disabled={actionLoading}
              className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500"
            >
              Submit for Review
            </button>
          </>
        )}

        {/* Manager actions */}
        {role === "Manager" && task.state === "REVIEW" && (
          <>
            <button
              onClick={handleAcceptTask}
              disabled={actionLoading}
              className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-500"
            >
              Accept
            </button>

            <button
              onClick={handleRejectTask}
              disabled={actionLoading}
              className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-500"
            >
              Send Back
            </button>
          </>
        )}
      </div>

      {/* History */}
      <TaskHistoryPage taskId={task.id} />
    </div>
  )
}
