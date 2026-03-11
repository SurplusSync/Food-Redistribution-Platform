import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getDonations, type Donation } from '../../services/api'
import { socketService } from '../../services/socket'
import { PlusCircle, Map, Clock, TrendingUp, AlertTriangle, X, Image as ImageIcon, Shield, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'

export default function DonorHome() {
  const { t } = useTranslation()
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const load = async () => {
    setLoading(true)
    try {
      const data = await getDonations({ 
        role: 'donor',
        userId: user.id 
      })
      setDonations(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()

    const unsubscribeCreated = socketService.onDonationCreated(() => {
      load()
    })

    const unsubscribeClaimed = socketService.onDonationClaimed(() => {
      load()
    })

    return () => {
      unsubscribeCreated()
      unsubscribeClaimed()
    }
  }, [])

  const activeCount = donations.filter((d) => d.status === 'AVAILABLE').length
  const claimedCount = donations.filter((d) => d.status === 'CLAIMED').length
  const deliveredCount = donations.filter((d) => d.status === 'DELIVERED').length

  const getTimeRemaining = (expiryTime: Date) => {
    const now = new Date()
    const remaining = new Date(expiryTime).getTime() - now.getTime()
    if (remaining <= 0) return { hours: 0, minutes: 0, urgent: true, expired: true }
    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    return { hours, minutes, urgent: hours < 3, expired: false }
  }

  const urgentDonations = donations.filter(d => {
    if (d.status !== 'AVAILABLE') return false
    const time = getTimeRemaining(d.expiryTime)
    return time.urgent && !time.expired
  })

  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      AVAILABLE: 'bg-emerald-500/10 text-emerald-400',
      CLAIMED: 'bg-amber-500/10 text-amber-400',
      DELIVERED: 'bg-slate-500/10 text-gray-500 dark:text-slate-400',
      EXPIRED: 'bg-red-500/10 text-red-400',
    }
    return styles[status] || styles.AVAILABLE
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return t('goodMorning')
    if (hour < 18) return t('goodAfternoon')
    return t('goodEvening')
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {getGreeting()}, {user.name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-gray-500 dark:text-slate-500 mt-1">
          {t('manageDonations')}
        </p>
      </div>

      {/* Urgent Alerts */}
      {urgentDonations.length > 0 && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-400 mb-1">{t('urgentExpiring')}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                You have {urgentDonations.length} donation{urgentDonations.length > 1 ? 's' : ''} expiring within 3 hours
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl text-emerald-400">●</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 uppercase">
              {t('active')}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">{t('yourListings')}</p>
          <p className="text-3xl font-semibold text-emerald-400">{activeCount}</p>
          {urgentDonations.length > 0 && (
            <p className="text-xs text-red-400 mt-2">
              {t('expiringSoon', { count: urgentDonations.length })}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl text-amber-400">◷</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 uppercase">
              {t('inTransit')}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">{t('pendingPickup')}</p>
          <p className="text-3xl font-semibold text-amber-400">{claimedCount}</p>
        </div>

        <div className="rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-100/50 dark:bg-slate-800/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl text-gray-500 dark:text-slate-400">✓</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-500/10 text-gray-500 dark:text-slate-400 uppercase">
              {t('complete')}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">{t('delivered')}</p>
          <p className="text-3xl font-semibold text-gray-500 dark:text-slate-400">{deliveredCount}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link
          to="/dashboard/map"
          className="group p-6 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-gray-300 dark:border-slate-700 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-slate-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              <Map className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('discoveryMap')}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {t('viewDonationsOnMap')}
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard/impact"
          className="group p-6 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-gray-300 dark:border-slate-700 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-slate-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('yourImpact')}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">{t('seeDifference')}</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-medium text-gray-900 dark:text-white">
            {t('recentDonations')}
          </h2>
          <Link to="/dashboard/history" className="text-sm text-emerald-400 hover:text-emerald-300">
            {t('viewAll')}
          </Link>
        </div>

        {loading && (
          <div className="p-8 text-center text-gray-500 dark:text-slate-500">{t('loading')}</div>
        )}

        {!loading && donations.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-slate-500 mb-4">
              {t('noDonationsYet')}
            </p>
            <Link
              to="/dashboard/add"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              {t('addFirstDonation')}
            </Link>
          </div>
        )}

        <div className="divide-y divide-gray-200 dark:divide-slate-800">
          {donations.slice(0, 5).map((donation) => {
            const timeLeft = getTimeRemaining(donation.expiryTime)
            return (
              <div key={donation.id} className="p-4 hover:bg-gray-100/50 dark:bg-slate-800/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                      donation.status === 'AVAILABLE' ? 'bg-emerald-500/10' : 
                      donation.status === 'CLAIMED' ? 'bg-amber-500/10' : 'bg-gray-100 dark:bg-slate-800'
                    }`}>
                      {donation.foodType === 'cooked' && '🍛'}
                      {donation.foodType === 'raw' && '🥬'}
                      {donation.foodType === 'packaged' && '📦'}
                      {donation.foodType === 'fruits' && '🍎'}
                      {donation.foodType === 'bakery' && '🥖'}
                      {donation.foodType === 'dairy' && '🥛'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900 dark:text-white">{donation.name}</p>
                        {donation.status === 'AVAILABLE' && timeLeft.urgent && !timeLeft.expired && (
                          <span className="text-xs px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeLeft.hours}h {timeLeft.minutes}m
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-slate-500">
                        {donation.quantity} {donation.unit}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedDonation(donation)}
                      className="px-3 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-gray-200 dark:bg-slate-700 transition-colors border border-gray-300 dark:border-slate-700"
                    >
                      {t('viewDetails')}
                    </button>
                    <span className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${getStatusStyle(donation.status)}`}>
                      {donation.status === 'AVAILABLE' ? t('available') : donation.status}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/30 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row">
            
            {/* LEFT: Image Section */}
            <div className="w-full md:w-1/2 bg-gray-50 dark:bg-slate-950 h-64 md:h-auto relative group">
              {selectedDonation.imageUrls && selectedDonation.imageUrls.length > 0 ? (
                <>
                  <img 
                    src={selectedDonation.imageUrls[currentImageIndex]} 
                    alt={selectedDonation.name} 
                    className="w-full h-full object-cover"
                  />
                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                    {currentImageIndex + 1} / {selectedDonation.imageUrls.length}
                  </div>
                  {/* Navigation Buttons */}
                  {selectedDonation.imageUrls.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev - 1 + selectedDonation.imageUrls.length) % selectedDonation.imageUrls.length)}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-gray-900 dark:text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev + 1) % selectedDonation.imageUrls.length)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-gray-900 dark:text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-600">
                  <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                  <span className="text-sm">{t('noImageUploaded')}</span>
                </div>
              )}
            </div>

            {/* RIGHT: Details */}
            <div className="w-full md:w-1/2 p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{selectedDonation.name}</h2>
                  <p className="text-emerald-400 font-medium">{selectedDonation.quantity} {selectedDonation.unit} • {selectedDonation.foodType}</p>
                </div>
                <button onClick={() => { setSelectedDonation(null); setCurrentImageIndex(0); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-100 dark:bg-slate-800 rounded-full text-gray-500 dark:text-slate-400 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-gray-100/80 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-800">
                  <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t('donor')}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 dark:text-white font-medium">{selectedDonation.donorName}</span>
                    <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded text-emerald-400 text-xs">
                      <Shield className="w-3 h-3" />
                      <span>Trust: {selectedDonation.donorTrustScore?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedDonation.description && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">{t('description')}</p>
                    <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{selectedDonation.description}</p>
                  </div>
                )}

                {/* Hygiene */}
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">{t('safetyCheck')}</p>
                  <div className="flex gap-2">
                    {selectedDonation.hygiene?.keptCovered ? (
                      <span className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> {t('keptCovered')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20">
                        <X className="w-3 h-3" /> {t('notCovered')}
                      </span>
                    )}
                    {selectedDonation.hygiene?.containerClean ? (
                      <span className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> {t('cleanContainer')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20">
                        <X className="w-3 h-3" /> {t('dirtyContainer')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>{t('prepared', { time: new Date(selectedDonation.preparationTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) })}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-800">
                <div className="text-center p-3 bg-emerald-500/10 text-emerald-400 rounded-lg font-medium border border-emerald-500/20">
                  Your Donation - Status: {selectedDonation.status}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}