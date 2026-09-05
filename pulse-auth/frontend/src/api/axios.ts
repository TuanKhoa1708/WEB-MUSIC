import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { getToken, removeToken } from '@/utils/token'
import type { ApiErrorResponse } from '@/types/auth'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Request interceptor ──────────────────────────────────────────────────────
// Automatically attach Bearer token if present in storage.
// If body is FormData (file upload), delete the default Content-Type so that
// axios/browser can auto-set multipart/form-data with the correct boundary.
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // When sending FormData, remove the default application/json Content-Type
    // so axios automatically sets multipart/form-data with the proper boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error),
)

// ─── Response interceptor ─────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (!error.response) {
      // Network / CORS / server unreachable
      return Promise.reject(new Error('Network error. Please check your connection.'))
    }

    const { status, data } = error.response

    switch (status) {
      case 401:
        // Invalid or expired token — clear storage and send to login
        removeToken()
        if (window.location.pathname !== '/') {
          window.location.href = '/'
        }
        return Promise.reject(new Error(data?.message ?? 'Session expired. Please sign in again.'))

      case 403:
        return Promise.reject(new Error(data?.message ?? 'You do not have permission to perform this action.'))

      case 422:
      case 400:
        return Promise.reject(new Error(data?.message ?? 'Invalid request data.'))

      case 500:
      default:
        return Promise.reject(new Error(data?.message ?? 'Server error. Please try again later.'))
    }
  },
)

export default axiosInstance
