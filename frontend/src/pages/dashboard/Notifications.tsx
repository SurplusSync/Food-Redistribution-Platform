import { useEffect, useState, type ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { getNotifications, markNotificationRead, markAllNotificationsRead, type Notification } from '../../services/api'
import { socketService } from '../../services/socket'
import { Bell, CheckCircle, AlertTriangle, MapPin, Package } from 'lucide-react'

export default function Notifications() {
    const { t } = useTranslation()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'unread'>('all')

    useEffect(() => {
        loadNotifications()

        // Subscribe to real-time notifications
        const unsubNotif = socketService.onNotification((data) => {
            const mapped: Notification = {
                ...data,
                type: (['food_claimed', 'pickup_assigned', 'delivery_confirmed', 'near_expiry', 'new_food_nearby'].includes(data.type)
                    ? data.type
                    : 'new_food_nearby') as Notification['type'],
                createdAt: new Date(data.createdAt),
            };
            setNotifications(prev => [mapped, ...prev]);
        });

        return () => {
            unsubNotif();
        };
    }, [])

    const loadNotifications = async () => {
        setLoading(true)
        try {
            const data = await getNotifications()
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
        await markAllNotificationsRead()
        setNotifications(notifications.map(n => ({ ...n, read: true })))
    }

    const filtered = filter === 'all'
        ? notifications
        : notifications.filter(n => !n.read)

    const unreadCount = notifications.filter(n => !n.read).length

    const getIcon = (type: Notification['type']) => {
        const icons: Record<Notification['type'], ReactElement> = {
            food_claimed: <Package className="w-5 h-5 text-emerald-400" />,
            pickup_assigned: <MapPin className="w-5 h-5 text-blue-400" />,
            delivery_confirmed: <CheckCircle className="w-5 h-5 text-green-400" />,
            near_expiry: <AlertTriangle className="w-5 h-5 text-amber-400" />,
            new_food_nearby: <Bell className="w-5 h-5 text-purple-400" />,
        }
        return icons[type] || <Bell className="w-5 h-5 text-gray-500 dark:text-slate-400" />
    }

    const formatTime = (date: Date) => {
        const now = new Date()
        const diff = now.getTime() - new Date(date).getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)

        if (minutes < 1) return t('justNow')
        if (minutes < 60) return t('minutesAgo', { count: minutes })
        if (hours < 24) return t('hoursAgo', { count: hours })
        return t('daysAgo', { count: days })
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">{t('notifications')}</h1>
                <p className="text-gray-500 dark:text-slate-500">{t('stayUpdated')}</p>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        {t('all')}
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'unread'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        {t('unread')} {unreadCount > 0 ? `(${unreadCount})` : ''}
                    </button>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        className="text-sm text-emerald-400 hover:text-emerald-300"
                    >
                        {t('markAllRead')}
                    </button>
                )}
            </div>

            {/* Notifications List */}
            <div className="space-y-2">
                {loading ? (
                    <div className="text-center py-12 text-gray-500 dark:text-slate-500">{t('loadingNotifications')}</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12">
                        <Bell className="w-12 h-12 text-gray-700 dark:text-slate-300 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-slate-500">
                            {filter === 'unread' ? t('noUnreadNotifications') : t('noNotificationsYet')}
                        </p>
                    </div>
                ) : (
                    filtered.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-4 rounded-lg border transition-all ${notification.read
                                ? 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800'
                                : 'bg-white/80 dark:bg-slate-900/50 border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-lg ${notification.read ? 'bg-gray-100 dark:bg-slate-800' : 'bg-gray-200 dark:bg-slate-800/80'
                                    }`}>
                                    {getIcon(notification.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4 mb-1">
                                        <h3 className={`font-medium ${notification.read ? 'text-gray-700 dark:text-slate-300' : 'text-gray-900 dark:text-white'
                                            }`}>
                                            {notification.title}
                                        </h3>
                                        <span className="text-xs text-gray-500 dark:text-slate-500 whitespace-nowrap">
                                            {formatTime(notification.createdAt)}
                                        </span>
                                    </div>
                                    <p className={`text-sm ${notification.read ? 'text-gray-500 dark:text-slate-500' : 'text-gray-500 dark:text-slate-400'
                                        }`}>
                                        {notification.message}
                                    </p>

                                    {!notification.read && (
                                        <button
                                            onClick={() => handleMarkRead(notification.id)}
                                            className="mt-3 text-xs text-emerald-400 hover:text-emerald-300"
                                        >
                                            {t('markAsRead')}
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