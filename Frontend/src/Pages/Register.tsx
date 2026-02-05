import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { register } from "../features/auth/auth.api"
import type { UserRole } from "../types/auth"

export default function Register() {
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("Developer")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleRegister = async () => {
    setError(null)
    setSuccess(null)
    if (!name || !email || !phone || !password) {
      setError("All fields are required")
      return
    }
    setLoading(true)
    try {
      await register({ name, email, phone, password, role })
      setSuccess("Account created. You can log in now.")
      setTimeout(() => navigate("/login"), 800)
    } catch (err) {
      console.error(err)
      setError("Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-slate-100">
          Create Account
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Register a Manager or Developer
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-400">Name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="px-3 py-2 rounded-md bg-slate-900 border border-slate-700 text-slate-100"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-400">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="px-3 py-2 rounded-md bg-slate-900 border border-slate-700 text-slate-100"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-400">Phone</label>
        <input
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="px-3 py-2 rounded-md bg-slate-900 border border-slate-700 text-slate-100"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-400">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="px-3 py-2 rounded-md bg-slate-900 border border-slate-700 text-slate-100"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-400">Role</label>
        <select
          value={role}
          onChange={e => setRole(e.target.value as UserRole)}
          className="px-3 py-2 rounded-md bg-slate-900 border border-slate-700 text-slate-100"
        >
          <option value="Developer">Developer</option>
          <option value="Manager">Manager</option>
        </select>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-md px-3 py-2">
          {success}
        </div>
      )}

      <button
        onClick={handleRegister}
        disabled={loading}
        className="mt-2 px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 transition disabled:opacity-60"
      >
        {loading ? "Creating..." : "Create Account"}
      </button>
    </div>
  )
}
