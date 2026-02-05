import { useState } from "react"
import { makeTeam } from "../features/auth/auth.api"

export default function TeamPage() {
  const [developerId, setDeveloperId] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

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
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
      <h3 className="text-sm font-semibold text-slate-200 mb-3">
        Assign Developer to Team
      </h3>
      <div className="flex flex-col gap-2 max-w-sm">
        <label className="text-xs text-slate-400">Developer ID</label>
        <input
          value={developerId}
          onChange={e => setDeveloperId(e.target.value)}
          className="rounded-md bg-slate-900 border border-slate-700 p-2 text-slate-100"
        />
        <button
          onClick={handleAssign}
          disabled={loading}
          className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500"
        >
          {loading ? "Updating..." : "Assign"}
        </button>
        {message && (
          <div className="text-xs text-slate-300">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
