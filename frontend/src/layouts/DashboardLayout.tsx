import { useEffect, useState } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, PlusCircle, Map, History, LogOut, Bell, TrendingUp, User, Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getNotifications, addNotification } from "../services/api";
import { socketService } from "../services/socket";

export default function DashboardLayout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userRole = (user.role || 'donor').toLowerCase()

  useEffect(() => {
    // Redirect to role-specific dashboard
    if (location.pathname === '/dashboard') {
      setIsRedirecting(true)
      if (userRole === 'ngo') {
        navigate('/dashboard/ngo', { replace: true })
      } else if (userRole === 'volunteer') {
        navigate('/dashboard/volunteer', { replace: true })
      } else {
        // Donor stays at /dashboard
        setIsRedirecting(false)
      }
    } else {
      // Not on /dashboard, so we're not redirecting
      setIsRedirecting(false)
    }
  }, [userRole, location.pathname, navigate])

  useEffect(() => {
    // Initialize socket connection
    socketService.connect();

    // Load initial notification count
    loadNotifications()

    // Listen for real-time notifications
    const unsubNotif = socketService.onNotification((data) => {
      addNotification(data);
      // Update unread count
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      unsubNotif();
    };
  }, [])

  const loadNotifications = async () => {
    try {
      const notifications = await getNotifications(user.id)
      setUnreadCount(notifications.filter(n => !n.read).length)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  const logout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  const navLinks = [
    { to: userRole === 'ngo' ? '/dashboard/ngo' : '/dashboard', icon: LayoutDashboard, label: t('dashboard'), roles: ['donor', 'ngo', 'volunteer'] },
    { to: '/dashboard/add', icon: PlusCircle, label: t('addFood'), roles: ['donor'] },
    { to: '/dashboard/map', icon: Map, label: t('discover'), roles: ['donor', 'ngo', 'volunteer'] },
    { to: '/dashboard/history', icon: History, label: t('history'), roles: ['donor', 'ngo', 'volunteer'] },
    { to: '/dashboard/impact', icon: TrendingUp, label: t('impact'), roles: ['donor', 'ngo', 'volunteer'] },
  ].filter(link => link.roles.includes(userRole))

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  const getRoleColor = () => {
    const colors = {
      donor: 'from-emerald-500 to-emerald-600',
      ngo: 'from-blue-500 to-blue-600',
      volunteer: 'from-purple-500 to-purple-600'
    }
    return colors[userRole as keyof typeof colors] || 'from-emerald-500 to-emerald-600'
  }

  const getRoleLabel = () => {
    const labels: Record<string, string> = {
      donor: t('donor'),
      ngo: t('ngo'),
      volunteer: t('volunteer')
    }
    return labels[userRole] || t('user')
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="sidebar flex flex-col">
        {/* Logo */}
        <div className="sidebar-header">
          <div className="flex items-center gap-3">
            <div className="logo-icon">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                Surplus<span className="text-emerald-400">Sync</span>
              </h1>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/80 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRoleColor()} flex items-center justify-center text-sm font-bold text-white shadow-lg`}>
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user.organizationName || user.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-500">{getRoleLabel()}</p>
            </div>
            {user.verified && (
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-item ${isActive(link.to) ? 'nav-item-active' : 'nav-item-inactive'
                }`}
            >
              <link.icon className="w-5 h-5" />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-gray-200 dark:border-slate-800 space-y-1">
          <Link
            to="/dashboard/notifications"
            className={`nav-item relative ${isActive('/dashboard/notifications') ? 'nav-item-active' : 'nav-item-inactive'
              }`}
          >
            <Bell className="w-5 h-5" />
            <span>{t('notifications')}</span>
            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          <Link
            to="/dashboard/profile"
            className={`nav-item ${isActive('/dashboard/profile') ? 'nav-item-active' : 'nav-item-inactive'
              }`}
          >
            <User className="w-5 h-5" />
            <span>{t('profile')}</span>
          </Link>

          <Link
            to="/dashboard/accessibility"
            className={`nav-item ${isActive('/dashboard/accessibility') ? 'nav-item-active' : 'nav-item-inactive'
              }`}
          >
            <Languages className="w-5 h-5" />
            <span>{t('accessibilitySettings')}</span>
          </Link>

          <button
            onClick={logout}
            className="nav-item nav-item-inactive w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            <span>{t('signOut')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content p-8">
        <div className="max-w-7xl mx-auto">
          {isRedirecting ? (
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 animate-pulse mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-slate-400">Loading...</p>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </main>
    </div>
  )
}