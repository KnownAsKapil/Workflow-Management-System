// src/routes/ProtectedRoute.tsx
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import type { JSX } from "react"

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: JSX.Element
  allowedRoles: ("Developer" | "Manager")[]
}) {
  const { user, loading } = useAuth()

  // 🔑 CRITICAL
  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/tasks" replace />
  }

  return children
}
