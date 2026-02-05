// src/App.tsx
import "./App.css"

import { Routes, Route, Navigate, Link } from "react-router-dom"
import Login from "./Pages/Login"
import Register from "./Pages/Register"
import TasksPage from "./Pages/TasksPage"
import TaskDetailPage from "./Pages/TaskDetailPage"
import ProtectedRoute from "./routes/ProtectedRoute"
import { useAuth } from "./context/AuthContext"
import HistoryPage from "./Pages/HistoryPage"
import TeamPage from "./Pages/TeamPage"
import TeamMembersPage from "./Pages/TeamMembersPage"

function App() {
  const { user, loading, logout } = useAuth()

  // CRITICAL: block routing until auth is resolved
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-200">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      {user && (
        <header className="border-b border-slate-700 bg-slate-800">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-3">
            <div className="text-sm">
              {user.name}
              <span className="ml-2 text-xs px-2 py-0.5 rounded bg-indigo-600/20 text-indigo-400">
                {user.role}
              </span>
            </div>

            <nav className="flex flex-wrap gap-2 text-sm">
              <Link
                to="/tasks"
                className="px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600"
              >
                Tasks
              </Link>
              <Link
                to="/history"
                className="px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600"
              >
                History
              </Link>
              {user.role === "Manager" && (
                <>
                  <Link
                    to="/team"
                    className="px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600"
                  >
                    Team
                  </Link>
                  <Link
                    to="/team-members"
                    className="px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600"
                  >
                    Team Members
                  </Link>
                </>
              )}
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600"
              >
                Logout
              </button>
            </nav>
          </div>
        </header>
      )}

      {/* Routes */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          {/* Public */}
          <Route
            path="/login"
            element={
              user ? <Navigate to="/tasks" replace /> : <Login />
            }
          />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
          <Route
            path="/tasks"
            element={
              <ProtectedRoute allowedRoles={["Developer", "Manager"]}>
                <TasksPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/history"
            element={
              <ProtectedRoute allowedRoles={["Developer", "Manager"]}>
                <HistoryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/team"
            element={
              <ProtectedRoute allowedRoles={["Manager"]}>
                <TeamPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team-members"
            element={
              <ProtectedRoute allowedRoles={["Manager"]}>
                <TeamMembersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tasks/:id"
            element={
              <ProtectedRoute allowedRoles={["Developer", "Manager"]}>
                <TaskDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route
            path="*"
            element={
              <Navigate to={user ? "/tasks" : "/login"} replace />
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default App
