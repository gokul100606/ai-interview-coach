import { Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { AuthLayout } from '@/layouts/AuthLayout'

import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'
import InterviewSetup from '@/pages/InterviewSetup'
import InterviewRoom from '@/pages/InterviewRoom'
import Report from '@/pages/Report'
import History from '@/pages/History'
import Profile from '@/pages/Profile'
import Settings from '@/pages/Settings'
import Bookmarks from '@/pages/Bookmarks'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
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
  )
}
