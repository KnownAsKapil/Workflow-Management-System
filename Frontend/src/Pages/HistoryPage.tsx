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
    return <div className="text-sm text-slate-400">Loading history...</div>
  }

  if (history.length === 0) {
    return (
      <div className="text-sm text-slate-500">
        No history available yet.
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
      <h3 className="text-sm font-semibold text-slate-200 mb-3">
        My History
      </h3>
      <ol className="relative border-l border-slate-700 space-y-4">
        {history.map(entry => (
          <li key={entry.id} className="ml-4">
            <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-indigo-500" />
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
                Task ID: {entry.task_id} • {entry.actor_role}
              </div>
              {entry.comment && (
                <div className="text-xs text-slate-300 bg-slate-900 rounded px-2 py-1 mt-1">
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
