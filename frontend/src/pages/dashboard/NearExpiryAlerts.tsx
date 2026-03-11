import { useEffect, useMemo, useState, useCallback } from 'react'
import { AlertTriangle, Clock4, Filter, Loader2, RefreshCw } from 'lucide-react'
import { getDonations, claimDonation, type Donation } from '../../services/api'
import { socketService } from '../../services/socket'
import { useTranslation } from 'react-i18next'

type AlertRow = {
  id: string
  food: string
  donor: string
  expiresInMinutes: number
  quantity: string
  status: string
}

export default function NearExpiryAlerts() {
  const [items, setItems] = useState<AlertRow[]>([])
  const [urgency, setUrgency] = useState<'all' | 'critical' | 'warning'>('all')
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)
  const { t } = useTranslation()

  const toAlertRow = (d: Donation): AlertRow | null => {
    const expiryDate = new Date(d.expiryTime)
    const minutesLeft = Math.round((expiryDate.getTime() - Date.now()) / 60000)
    if (minutesLeft <= 0) return null // already expired
    return {
      id: d.id,
      food: d.name,
      donor: d.donorName || 'Unknown Donor',
      expiresInMinutes: minutesLeft,
      quantity: `${d.quantity} ${d.unit || ''}`.trim(),
      status: d.status,
    }
  }

  const loadAlerts = useCallback(async () => {
    setLoading(true)
    try {
      const allDonations = await getDonations({ status: ['AVAILABLE', 'CLAIMED'] })
      const twoHoursMs = 2 * 60 * 60 * 1000
      const now = Date.now()
      const nearExpiry = allDonations
        .filter((d: Donation) => {
          const expiryMs = new Date(d.expiryTime).getTime()
          const remaining = expiryMs - now
          return remaining > 0 && remaining <= twoHoursMs
        })
        .map(toAlertRow)
        .filter((r: AlertRow | null): r is AlertRow => r !== null)
      setItems(nearExpiry)
    } catch (err) {
      console.error('Failed to load near-expiry alerts:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAlerts()

    // Listen for real-time near-expiry alerts from backend cron
    const unsubExpiry = socketService.onNearExpiryAlert((data) => {
      // When backend flags a donation as near-expiry, refresh the list
      loadAlerts()
      console.log('Near-expiry alert received:', data)
    })

    // Refresh countdown every minute
    const timer = setInterval(() => {
      setItems(prev => prev
        .map(item => ({ ...item, expiresInMinutes: item.expiresInMinutes - 1 }))
        .filter(item => item.expiresInMinutes > 0)
      )
    }, 60000)

    return () => {
      unsubExpiry()
      clearInterval(timer)
    }
  }, [loadAlerts])

  const handleClaim = async (id: string) => {
    setClaiming(id)
    try {
      await claimDonation(id)
      setItems(prev => prev.filter(item => item.id !== id))
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }, message?: string };
      alert(error?.response?.data?.message || error?.message || 'Failed to claim donation')
    } finally {
      setClaiming(null)
    }
  }

  const filtered = useMemo(() => {
    return items
      .filter((item) => {
        if (urgency === 'all') return true
        if (urgency === 'critical') return item.expiresInMinutes <= 60
        return item.expiresInMinutes > 60
      })
      .sort((a, b) => a.expiresInMinutes - b.expiresInMinutes)
  }, [items, urgency])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('nearExpiryAlerts')}</h1>
          <p className="text-slate-400 mt-1">{t('nearExpiryDesc')}</p>
        </div>
        <button onClick={loadAlerts} className="btn-secondary py-2 px-3 text-sm flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> {t('refresh')}
        </button>
      </div>

      <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-300">
          <Filter className="w-4 h-4 text-emerald-400" />
          {t('urgencyFilter')}
        </div>
        <div className="flex gap-2">
          {(['all', 'critical', 'warning'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setUrgency(f)}
              className={`px-3 py-1.5 rounded-md text-sm capitalize ${urgency === f ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300'}`}
            >
              {f === 'all' ? t('all') : f === 'critical' ? t('critical') : t('warning')}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((alert) => {
          const critical = alert.expiresInMinutes <= 60
          return (
            <div key={alert.id} className={`card p-4 border ${critical ? 'border-red-500/40' : 'border-amber-500/30'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${critical ? 'text-red-400' : 'text-amber-400'}`} />
                    {alert.food}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">{alert.quantity} • {alert.donor}</p>
                </div>
                <span className={`badge ${critical ? 'badge-danger' : 'badge-warning'} flex items-center gap-1`}>
                  <Clock4 className="w-3 h-3" />
                  {alert.expiresInMinutes} {t('minLabel')}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                {alert.status === 'AVAILABLE' && (
                  <button
                    type="button"
                    className="btn-primary py-2 px-3 text-sm"
                    disabled={claiming === alert.id}
                    onClick={() => handleClaim(alert.id)}
                  >
                    {claiming === alert.id ? t('claiming') : t('claimNow')}
                  </button>
                )}
                {alert.status === 'CLAIMED' && (
                  <span className="text-xs text-blue-400 bg-blue-500/10 px-3 py-2 rounded-md">{t('alreadyClaimedStatus')}</span>
                )}
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && <div className="card p-8 text-center text-slate-500">{t('noExpiringSoon')}</div>}
      </div>
    </div>
  )
}
