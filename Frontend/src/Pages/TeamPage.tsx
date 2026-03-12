import { useEffect, useState } from "react"
import { makeTeam } from "../features/auth/auth.api"
import { getDevelopers } from "../features/team/team.api"
import type { DeveloperOption } from "../types/team"

export default function TeamPage() {
  const [developerId, setDeveloperId] = useState("")
  const [developers, setDevelopers] = useState<DeveloperOption[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingDevelopers, setLoadingDevelopers] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    getDevelopers()
      .then(setDevelopers)
      .catch(err => {
        console.error(err)
        setMessage("Failed to load developers list")
      })
      .finally(() => setLoadingDevelopers(false))
  }, [])

  const handleAssign = async () => {
    const id = Number(developerId)
    if (!id) {
      setMessage("Developer ID is required")
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      await makeTeam(id)
      setMessage("Team updated successfully")
      setDeveloperId("")
    } catch (err) {
      console.error(err)
      setMessage("Failed to update team")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-enter panel p-5 md:p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-slate-100">
            Team Assignment
          </h3>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Assign a developer to your team.
          </p>
        </div>
        <span className="status-pill">{developers.length} developers</span>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
        <div className="flex flex-col gap-3">
          <label className="field-label">Select Developer</label>
          <select
            value={developerId}
            onChange={e => setDeveloperId(e.target.value)}
            className="field-input"
            disabled={loadingDevelopers}
          >
            <option value="">
              {loadingDevelopers ? "Loading developers..." : "Choose developer"}
            </option>
            {developers.map(dev => (
              <option key={dev.id} value={dev.id}>
                #{dev.id} - {dev.name}{dev.is_in_team ? " (In your team)" : ""}
              </option>
            ))}
          </select>
          <button
            onClick={handleAssign}
            disabled={loading}
            className="btn-base btn-primary"
          >
            {loading ? "Updating..." : "Assign"}
          </button>
          {message && (
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
              {message}
            </div>
          )}
        </div>

        {!loadingDevelopers && developers.length > 0 && (
          <div className="rounded-2xl border border-slate-700/70 bg-slate-950/50 px-4 py-4">
            <p className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-500">
              Available Developers
            </p>
            <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {developers.map(dev => (
                <li
                  key={dev.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-950/55 px-3 py-3 text-sm transition duration-200 hover:border-cyan-500/30"
                >
                  <span className="text-slate-200">{dev.name}</span>
                  <span className="text-slate-400">#{dev.id}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
