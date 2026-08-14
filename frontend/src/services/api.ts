import axios from 'axios'

// Centralized Axios client — the ONLY place baseURL/credentials/interceptors
// are configured. All service files import this instead of calling axios directly.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // send httpOnly auth cookie
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
