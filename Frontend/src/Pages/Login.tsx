import { useState } from "react"
import { api } from "../api/axios"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleLogin() {
    try {
      await api.post("/auth/login", {
        email,
        password,
      })

      // cookies are now set by backend
      window.location.reload()
    } catch (err) {
      console.error("Login failed", err)
    }
  }

  return (
    <>
      <input
        type="text"
        placeholder="email"
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="password"
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Submit</button>
    </>
  )
}
