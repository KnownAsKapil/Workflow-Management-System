import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
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
    <section className="page-enter min-h-[78vh] flex items-center justify-center px-4">
      <div className="panel w-full max-w-2xl p-6 md:p-8">
        <div className="flex flex-col gap-5">
          <div className="text-center">
            <h1 className="mt-1 text-3xl md:text-4xl font-bold text-slate-50 leading-tight">
              Flow Management System
            </h1>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-400">
              Create an account.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="field-label">Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="field-input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="field-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="field-input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="field-label">Phone</label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="field-input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="field-label">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="field-input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="field-label">Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                className="field-input"
              >
                <option value="Developer">Developer</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
          </div>
          {error && (
            <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/25 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-green-300 bg-green-500/10 border border-green-500/25 rounded-lg px-3 py-2">
              {success}
            </div>
          )}

          <button
            onClick={handleRegister}
            disabled={loading}
            className="mt-1 btn-base btn-primary disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

          <div className="text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-cyan-300 hover:text-cyan-200 hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
