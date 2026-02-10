import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import DashboardLayout from './layouts/DashboardLayout'
import DonorHome from './pages/dashboard/DonorHome'
import AddFood from './pages/dashboard/AddFood'
import DiscoveryMap from './pages/dashboard/DiscoveryMap'
import History from './pages/dashboard/History'
import Impact from './pages/dashboard/Impact'
import Notifications from './pages/dashboard/Notifications'
import Profile from './pages/dashboard/Profile'
import VolunteerDashboard from './pages/dashboard/VolunteerDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DonorHome />} />
          <Route path="add" element={<AddFood />} />
          <Route path="map" element={<DiscoveryMap />} />
          <Route path="volunteer" element={<VolunteerDashboard />} />
          <Route path="history" element={<History />} />
          <Route path="impact" element={<Impact />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}