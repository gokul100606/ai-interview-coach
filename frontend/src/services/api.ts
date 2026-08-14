import axios from 'axios'

// Centralized Axios client — the ONLY place baseURL/credentials/interceptors
// are configured. All service files import this instead of calling axios directly.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // send/receive the httpOnly auth cookie (axios's equivalent of fetch's credentials: 'include')
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Let AuthContext handle redirect-to-login; avoid importing router here.
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }
    return Promise.reject(error)
  },
)

/**
 * Turns an Axios error from our API into a message safe to show directly in
 * the UI. The backend's error middleware always responds with
 * { success: false, message, errors? } — prefer the first field-level
 * validation error (e.g. "Enter a valid email address") when present,
 * since it's more actionable than the generic "Validation failed" wrapper.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: { field: string; message: string }[] } | undefined
    if (data?.errors?.length) {
      return data.errors[0].message
    }
    if (data?.message) {
      return data.message
    }
    if (error.request && !error.response) {
      return "Can't reach the server right now. Please try again."
    }
  }
  return fallback
}