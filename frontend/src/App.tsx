import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import DashboardLayout from './layouts/DashboardLayout'
import DonorHome from './pages/dashboard/DonorHome'
import NGODashboard from './pages/dashboard/NGODashboard'
import AddFood from './pages/dashboard/AddFood'
import DiscoveryMap from './pages/dashboard/DiscoveryMap'
import History from './pages/dashboard/History'
import Impact from './pages/dashboard/Impact'
import Notifications from './pages/dashboard/Notifications'
import Profile from './pages/dashboard/Profile'
import VolunteerDashboard from './pages/dashboard/VolunteerDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import AccessibilitySettings from './pages/AccessibilitySettings'

function useAuth() {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  return { isAuthenticated: !!token, user }
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  return <>{children}</>
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  if (isAuthenticated) {
    const dest = user?.role === 'ADMIN' ? '/admin-dashboard' : '/dashboard'
    return <Navigate to={dest} replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
        <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
        <Route path="/accessibility" element={<AccessibilitySettings />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardLayout /></ProtectedRoute>
        }>
          <Route index element={<DonorHome />} />
          <Route path="ngo" element={<NGODashboard />} />
          <Route path="add" element={<AddFood />} />
          <Route path="map" element={<DiscoveryMap />} />
          <Route path="volunteer" element={<VolunteerDashboard />} />
          <Route path="history" element={<History />} />
          <Route path="impact" element={<Impact />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="accessibility" element={<AccessibilitySettings />} />
        </Route>
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute><AdminDashboard /></ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}