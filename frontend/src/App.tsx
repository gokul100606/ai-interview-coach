import { Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { AuthLayout } from '@/layouts/AuthLayout'

import { lazy, Suspense } from 'react'

const Landing = lazy(() => import('@/pages/Landing'))
const Login = lazy(() => import('@/pages/Login'))
const Register = lazy(() => import('@/pages/Register'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const InterviewSetup = lazy(() => import('@/pages/InterviewSetup'))
const InterviewRoom = lazy(() => import('@/pages/InterviewRoom'))
const Report = lazy(() => import('@/pages/Report'))
const History = lazy(() => import('@/pages/History'))
const Profile = lazy(() => import('@/pages/Profile'))
const Settings = lazy(() => import('@/pages/Settings'))
const Bookmarks = lazy(() => import('@/pages/Bookmarks'))
const NotFound = lazy(() => import('@/pages/NotFound'))

export default function App() {
  return (
  <Suspense fallback={<div className="p-6">Loading...</div>}>
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<AppLayout title="Dashboard" />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
      <Route element={<AppLayout title="New interview" />}>
        <Route path="/interview/setup" element={<InterviewSetup />} />
      </Route>
      <Route element={<AppLayout title="Interview room" />}>
        <Route path="/interview/:id" element={<InterviewRoom />} />
      </Route>
      <Route element={<AppLayout title="Final report" />}>
        <Route path="/report/:id" element={<Report />} />
      </Route>
      <Route element={<AppLayout title="History" />}>
        <Route path="/history" element={<History />} />
      </Route>
      <Route element={<AppLayout title="Bookmarks" />}>
        <Route path="/bookmarks" element={<Bookmarks />} />
      </Route>
      <Route element={<AppLayout title="Profile" />}>
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route element={<AppLayout title="Settings" />}>
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
        </Routes>
  </Suspense>
)
}
