import { useEffect, useState } from "react"
import type { TaskHistory } from "../types/history"
import { getAllHistory } from "../features/tasks/taskHistory.api"

export default function HistoryPage() {
  const [history, setHistory] = useState<TaskHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllHistory()
      .then(setHistory)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="page-enter text-sm text-slate-400">Loading history...</div>
  }

  if (history.length === 0) {
    return (
      <div className="page-enter panel p-6 text-center text-sm text-slate-500">
        No history available yet.
      </div>
    )
  }

  return (
    <div className="page-enter panel p-5 md:p-6">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-slate-100">
            History
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            View task updates in chronological order.
          </p>
        </div>
        <span className="status-pill">{history.length} events</span>
      </div>

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
                Task ID: {entry.task_id} | {entry.actor_role}
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

