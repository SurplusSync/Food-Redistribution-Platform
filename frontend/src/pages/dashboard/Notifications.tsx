import { useEffect, useState } from 'react'
import { getNotifications, markNotificationRead, type Notification } from '../../services/api'
import { Bell, CheckCircle, AlertTriangle, MapPin, Package } from 'lucide-react'

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'unread'>('all')

    const user = JSON.parse(localStorage.getItem('user') || '{}')

    useEffect(() => {
        loadNotifications()
    }, [])

    const loadNotifications = async () => {
        setLoading(true)
        try {
            const data = await getNotifications(user.id)
            setNotifications(data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
        } finally {
            setLoading(false)
        }
    }

    const handleMarkRead = async (id: string) => {
        await markNotificationRead(id)
        setNotifications(notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
        ))
    }

    const handleMarkAllRead = async () => {
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
        await Promise.all(unreadIds.map(id => markNotificationRead(id)))
        setNotifications(notifications.map(n => ({ ...n, read: true })))
    }

    const filtered = filter === 'all' 
        ? notifications 
        : notifications.filter(n => !n.read)

    const unreadCount = notifications.filter(n => !n.read).length

    const getIcon = (type: Notification['type']) => {
        const icons = {
            food_claimed: <Package className="w-5 h-5 text-emerald-400" />,
            pickup_assigned: <MapPin className="w-5 h-5 text-blue-400" />,
            delivery_confirmed: <CheckCircle className="w-5 h-5 text-green-400" />,
            near_expiry: <AlertTriangle className="w-5 h-5 text-amber-400" />,
            new_food_nearby: <Bell className="w-5 h-5 text-purple-400" />,
        }
        return icons[type] || <Bell className="w-5 h-5 text-slate-400" />
    }

    const formatTime = (date: Date) => {
        const now = new Date()
        const diff = now.getTime() - new Date(date).getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)

        if (minutes < 1) return 'Just now'
        if (minutes < 60) return `${minutes}m ago`
        if (hours < 24) return `${hours}h ago`
        return `${days}d ago`
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-white mb-1">Notifications</h1>
                <p className="text-slate-500">Stay updated on your donations and deliveries</p>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === 'all'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === 'unread'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                    >
                        Unread {unreadCount > 0 && `(${unreadCount})`}
                    </button>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        className="text-sm text-emerald-400 hover:text-emerald-300"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Notifications List */}
            <div className="space-y-2">
                {loading ? (
                    <div className="text-center py-12 text-slate-500">Loading notifications...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12">
                        <Bell className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-500">
                            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                        </p>
                    </div>
                ) : (
                    filtered.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-4 rounded-lg border transition-all ${
                                notification.read
                                    ? 'bg-slate-900 border-slate-800'
                                    : 'bg-slate-900/50 border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-lg ${
                                    notification.read ? 'bg-slate-800' : 'bg-slate-800/80'
                                }`}>
                                    {getIcon(notification.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4 mb-1">
                                        <h3 className={`font-medium ${
                                            notification.read ? 'text-slate-300' : 'text-white'
                                        }`}>
                                            {notification.title}
                                        </h3>
                                        <span className="text-xs text-slate-500 whitespace-nowrap">
                                            {formatTime(notification.createdAt)}
                                        </span>
                                    </div>
                                    <p className={`text-sm ${
                                        notification.read ? 'text-slate-500' : 'text-slate-400'
                                    }`}>
                                        {notification.message}
                                    </p>

                                    {!notification.read && (
                                        <button
                                            onClick={() => handleMarkRead(notification.id)}
                                            className="mt-3 text-xs text-emerald-400 hover:text-emerald-300"
                                        >
                                            Mark as read
                                        </button>
                                    )}
                                </div>

                                {!notification.read && (
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-2" />
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}