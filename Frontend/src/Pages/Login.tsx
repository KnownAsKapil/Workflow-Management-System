// src/Pages/Login.tsx
import { useState } from "react"
import { api } from "../api/axios"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Login() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    try {
      setLoading(true)
      setError(null)

      await api.post("/auth/login", { email, password })
      await refreshUser()

      // SPA navigation after successful login
      navigate("/tasks", { replace: true })
    } catch (err) {
      console.error(err)
      setError("Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page-enter min-h-[78vh] flex items-center justify-center px-4">
      <div className="panel w-full max-w-md p-6 md:p-8">
        <div className="flex flex-col gap-5">
          <div className="text-center">
            <h1 className="mt-1 text-3xl md:text-4xl font-bold text-slate-50 leading-tight">
              Flow Management System
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
              Sign in to continue.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="field-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="field-input"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="field-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="********"
              className="field-input"
            />
          </div>

          {error && (
            <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/25 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="mt-1 btn-base btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/35 px-4 py-3 text-center text-xs text-slate-400">
            Need an account?{" "}
            <Link className="text-cyan-300 hover:text-cyan-200 hover:underline" to="/register">
              Register
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
