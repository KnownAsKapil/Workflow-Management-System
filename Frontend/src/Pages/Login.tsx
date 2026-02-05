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
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-slate-100">
          Flow Management System
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Login to access your dashboard
        </p>
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-400">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="
            px-3 py-2 rounded-md
            bg-slate-900 border border-slate-700
            text-slate-100 placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-indigo-500
          "
        />
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-400">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="********"
          className="
            px-3 py-2 rounded-md
            bg-slate-900 border border-slate-700
            text-slate-100 placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-indigo-500
          "
        />
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleLogin}
        disabled={loading}
        className="
          mt-2 px-4 py-2 rounded-md
          bg-indigo-600 hover:bg-indigo-500
          transition
          disabled:opacity-60 disabled:cursor-not-allowed
        "
      >
        {loading ? "Signing in..." : "Login"}
      </button>

      <div className="text-xs text-slate-400 text-center">
        Need an account?{" "}
        <Link className="text-indigo-400 hover:underline" to="/register">
          Register
        </Link>
      </div>
    </div>
  )
}
