import { useEffect, useState } from "react"
import { getTeamMembers } from "../features/team/team.api"
import type { TeamMember } from "../types/team"

export default function TeamMembersPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getTeamMembers()
      .then(setMembers)
      .catch(err => {
        console.error(err)
        setError("Failed to load team members")
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-sm text-slate-400">Loading...</div>
  }

  if (error) {
    return (
      <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
        {error}
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
      <h3 className="text-sm font-semibold text-slate-200 mb-2">
        Team Developers
      </h3>
      <p className="text-xs text-slate-400 mb-3">
        Loaded from the team endpoint.
      </p>
      {members.length === 0 ? (
        <div className="text-sm text-slate-500">No developers found.</div>
      ) : (
        <ul className="space-y-2">
          {members.map(member => (
            <li
              key={member.id}
              className="flex items-center justify-between rounded-md bg-slate-900 px-3 py-2 text-sm"
            >
              <span className="text-slate-200">
                {member.name}
              </span>
              <span className="text-slate-300">#{member.id}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
