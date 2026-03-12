// src/App.tsx
import "./App.css"

import { Routes, Route, Navigate, NavLink } from "react-router-dom"
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

  if (loading) {
    return (
      <div className="app-shell subtle-grid flex min-h-screen items-center justify-center px-4">
        <div className="panel page-enter w-full max-w-md p-8 text-center">
          <h1 className="mt-5 text-3xl font-semibold text-slate-50">
            Flow Management System
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Loading your session.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-300" />
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-400 [animation-delay:120ms]" />
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-sky-400 [animation-delay:240ms]" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell subtle-grid text-slate-100">
      {user && (
        <header className="shell-header">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
            <div className="shell-brand">
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold text-slate-100">{user.name}</span>
                <span className="status-pill border-cyan-400/20 bg-cyan-500/10 text-cyan-200">
                  {user.role}
                </span>
              </div>
            </div>

            <nav className="flex flex-wrap gap-2 text-sm">
              <NavLink
                to="/tasks"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "nav-link-active" : ""}`
                }
              >
                Tasks
              </NavLink>
              <NavLink
                to="/history"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "nav-link-active" : ""}`
                }
              >
                History
              </NavLink>
              {user.role === "Manager" && (
                <>
                  <NavLink
                    to="/team"
                    className={({ isActive }) =>
                      `nav-link ${isActive ? "nav-link-active" : ""}`
                    }
                  >
                    Team
                  </NavLink>
                  <NavLink
                    to="/team-members"
                    className={({ isActive }) =>
                      `nav-link ${isActive ? "nav-link-active" : ""}`
                    }
                  >
                    Team Members
                  </NavLink>
                </>
              )}
              <button
                onClick={logout}
                className="nav-link"
              >
                Logout
              </button>
            </nav>
          </div>
        </header>
      )}

      <main className="app-main mx-auto max-w-6xl px-4 py-6 md:py-8">
        <Routes>
          <Route
            path="/login"
            element={
              user ? <Navigate to="/tasks" replace /> : <Login />
            }
          />
          <Route path="/register" element={<Register />} />

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
