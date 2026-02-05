// inceptor.ts (or wherever interceptor lives)
import { api } from "./axios"

let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any) => {
  failedQueue.forEach(promise => promise.reject(error))
  failedQueue = []
}

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // 1️⃣ No response → network error
    if (!error.response) {
      return Promise.reject(error)
    }

    const status = error.response.status
    const url = originalRequest.url as string

    // 2️⃣ DO NOT refresh for auth endpoints
    if (
      status === 401 &&
      (
        url.includes("/auth/login") ||
        url.includes("/auth/me") ||
        url.includes("/auth/refresh")
      )
    ) {
      return Promise.reject(error)
    }

    // 3️⃣ Only try refresh once
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((_, reject) => {
          failedQueue.push({ reject })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await api.post("/auth/refresh")
        isRefreshing = false
        return api.request(originalRequest)
      } catch (refreshError) {
        isRefreshing = false
        processQueue(refreshError)
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
