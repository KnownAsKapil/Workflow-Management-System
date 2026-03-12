import { useEffect, useState } from "react"
import type { TaskHistory } from "../types/history"
import { taskHistory } from "../features/tasks/taskHistory.api"

export default function TaskHistoryPage({ taskId }: { taskId: number }) {
  const [history, setHistory] = useState<TaskHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    taskHistory(taskId)
      .then(setHistory)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [taskId])

  if (loading) {
    return (
      <div className="text-sm text-slate-400 mt-2">
        Loading history...
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="mt-3 text-sm text-slate-500">
        No history available for this task.
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-950/45 p-4">
      <h4 className="mb-4 text-sm font-semibold text-slate-200">
        Task History
      </h4>

      <ol className="relative border-l border-slate-700/80 space-y-5">
        {history.map(entry => (
          <li key={entry.id} className="ml-4">
            <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_0_4px_rgba(8,47,73,0.55)]" />

            <div className="flex flex-col gap-1">
              <div className="text-sm text-slate-200">
                <span className="font-medium">
                  {entry.from_state ?? "START"}
                </span>
                <span className="mx-1 text-slate-400">-&gt;</span>
                <span className="font-medium">
                  {entry.to_state}
                </span>
              </div>

              <div className="text-xs text-slate-400">
                by {entry.actor_role} (ID: {entry.actor_id})
              </div>

              {entry.comment && (
                <div className="mt-1 rounded-xl bg-slate-950 px-3 py-2 text-xs text-slate-300">
                  {entry.comment}
                </div>
              )}

              <div className="text-[11px] text-slate-500">
                {new Date(entry.created_at).toLocaleString()}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
