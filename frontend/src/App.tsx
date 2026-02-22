import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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

export default function App() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAuthenticated = !!localStorage.getItem('token');

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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          isAuthenticated && user?.role === 'ADMIN'
            ? <Navigate to="/admin-dashboard" replace />
            : <DashboardLayout />
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
        </Route>
        <Route
          path="/admin-dashboard"
          element={
            isAuthenticated && user?.role === 'ADMIN' ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  )
}