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
    return <div className="page-enter text-sm text-slate-400">Loading...</div>
  }

  if (error) {
    return (
      <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
        {error}
      </div>
    )
  }

  return (
    <div className="page-enter panel p-5 md:p-6">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-slate-100">
            Team Members
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            Current developers in your team.
          </p>
        </div>
        <span className="status-pill">{members.length} developers</span>
      </div>

      {members.length === 0 ? (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/35 px-4 py-5 text-sm text-slate-500">
          No developers found.
        </div>
      ) : (
        <ul className="space-y-2">
          {members.map(member => (
            <li
              key={member.id}
              className="flex items-center justify-between rounded-lg bg-slate-950/70 border border-slate-700/80 px-3 py-2 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-500/40"
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
