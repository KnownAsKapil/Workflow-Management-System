import { api } from "./axios"

let isRefreshing = false
let pending: (() => void)[] = []

api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config

    if (err.response?.status === 401 && !original._retry) {
      original._retry = true

      if (isRefreshing) {
        return new Promise(resolve => {
          pending.push(() => resolve(api(original)))
        })
      }

      isRefreshing = true

      try {
        await api.post("/auth/refresh")
        pending.forEach(cb => cb())
        pending = []
        return api(original)
      } catch (refreshErr) {
        pending = []
        window.location.href = "/login"
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(err)
  }
)
