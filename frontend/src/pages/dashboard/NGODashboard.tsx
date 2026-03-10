import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getDonations, claimDonation, type Donation } from '../../services/api'
import { socketService } from '../../services/socket'
import { Map, TrendingUp, Clock, X, Image as ImageIcon, Shield, CheckCircle2, MapPin, ChevronLeft, ChevronRight, Navigation2, Radio } from 'lucide-react'
import { toast } from 'sonner'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const volunteerIcon = new L.DivIcon({
  className: 'volunteer-live-marker',
  html: `<div style="width:16px;height:16px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(59,130,246,0.35),0 2px 6px rgba(0,0,0,0.3);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

const pickupIcon = new L.DivIcon({
  className: 'pickup-marker',
  html: `<div style="width:14px;height:14px;background:#10b981;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

function MapFollower({ position }: { position: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(position, map.getZoom(), { duration: 0.5 })
  }, [position, map])
  return null
}

export default function NGODashboard() {
  const { t } = useTranslation()
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)
  const [claiming, setClaiming] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [trackingDonation, setTrackingDonation] = useState<Donation | null>(null)
  const [volunteerPos, setVolunteerPos] = useState<{ lat: number; lng: number } | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [routeHistory, setRouteHistory] = useState<[number, number][]>([])
  const trackingUnsubRef = useRef<(() => void) | null>(null)

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // ── Live Tracking ──────────────────────────────────
  const openTracking = useCallback((donation: Donation) => {
    // Clean up previous subscription
    if (trackingUnsubRef.current) trackingUnsubRef.current()
    setVolunteerPos(null)
    setLastUpdate(null)
    setRouteHistory([])
    setTrackingDonation(donation)

    // Subscribe to real-time volunteer location for this donation
    trackingUnsubRef.current = socketService.onVolunteerLocation(donation.id, (loc) => {
      setVolunteerPos({ lat: loc.lat, lng: loc.lng })
      setLastUpdate(loc.timestamp)
      setRouteHistory(prev => [...prev, [loc.lat, loc.lng]])
    })
  }, [])

  const closeTracking = useCallback(() => {
    if (trackingUnsubRef.current) {
      trackingUnsubRef.current()
      trackingUnsubRef.current = null
    }
    setTrackingDonation(null)
    setVolunteerPos(null)
    setLastUpdate(null)
    setRouteHistory([])
  }, [])

  // Cleanup tracking subscription on unmount
  useEffect(() => () => { if (trackingUnsubRef.current) trackingUnsubRef.current() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const data = await getDonations({
        role: 'ngo',
        userId: user.id
      })
      setDonations(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()

    // Listen for new donations (socket is already connected by DashboardLayout)
    const unsubscribeCreated = socketService.onDonationCreated((data) => {
      toast.success(`🍕 ${t('newFoodAlert')}: ${data.foodType}!`, {
        description: `${data.name} - ${data.location.address}`,
        duration: 5000,
      })
      // Re-fetch donations to show the new item
      load()
    })

    // Listen for claimed donations
    const unsubscribeClaimed = socketService.onDonationClaimed((data) => {
      toast.info(`🔔 ${t('foodClaimedAlert')}`, {
        description: `${data.donationId} has been claimed`,
        duration: 3000,
      })
      // Remove the claimed donation from state
      setDonations((prevDonations) =>
        prevDonations.filter((donation) => donation.id !== data.donationId)
      )
      // Close modal if it was for this donation
      if (selectedDonation?.id === data.donationId) {
        setSelectedDonation(null)
        setCurrentImageIndex(0)
      }
    })

    return () => {
      unsubscribeCreated()
      unsubscribeClaimed()
    }
  }, [])

  const availableCount = donations.filter((d) => d.status === 'AVAILABLE').length
  const claimedCount = donations.filter((d) => d.status === 'CLAIMED' || d.status === 'PICKED_UP').length
  const deliveredCount = donations.filter((d) => d.status === 'DELIVERED').length

  const getTimeRemaining = (expiryTime: Date) => {
    const now = new Date()
    const remaining = new Date(expiryTime).getTime() - now.getTime()

    if (remaining <= 0) return { expired: true, urgent: false, hours: 0, minutes: 0 }

    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    const urgent = hours < 3

    return { expired: false, urgent, hours, minutes }
  }

  const handleClaim = async (donationId: string) => {
    setClaiming(donationId)
    try {
      await claimDonation(donationId)
      await load()
      setSelectedDonation(null)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }, message?: string };
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to claim donation'
      toast.error('Unable to claim', { description: msg })
    } finally {
      setClaiming(null)
    }
  }

  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      AVAILABLE: 'bg-emerald-500/10 text-emerald-400',
      CLAIMED: 'bg-amber-500/10 text-amber-400',
      PICKED_UP: 'bg-blue-500/10 text-blue-400',
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
          {getGreeting()}, {user.organizationName || user.name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-gray-500 dark:text-slate-500 mt-1">
          {t('findClaimDonations')}
        </p>
      </div>

      {/* NGO Capacity Info */}
      {user.dailyIntakeCapacity && (
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-400 mb-1">{t('dailyIntakeCapacity')}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Current load: <span className="text-blue-400 font-semibold">{user.currentIntakeLoad}</span> / <span className="text-blue-400 font-semibold">{user.dailyIntakeCapacity}</span> {user.capacityUnit || 'kg'}
              </p>
            </div>
            <div className="w-24 h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${Math.min((user.currentIntakeLoad / user.dailyIntakeCapacity) * 100, 100)}%` }}
              />
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
              {t('available')}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">{t('readyToClaim')}</p>
          <p className="text-3xl font-semibold text-emerald-400">{availableCount}</p>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl text-amber-400">◷</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 uppercase">
              {t('inProgress')}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">{t('claimedPending')}</p>
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
              <p className="text-sm text-gray-500 dark:text-slate-400">{t('findClaimDonations')}</p>
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

      {/* Available Donations */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden mb-8">
        <div className="p-5 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-medium text-gray-900 dark:text-white">
            {t('availableDonationsToClaim')}
          </h2>
          <Link to="/dashboard/history" className="text-sm text-emerald-400 hover:text-emerald-300">
            {t('viewAll')}
          </Link>
        </div>

        {loading && (
          <div className="p-8 text-center text-gray-500 dark:text-slate-500">{t('loading')}</div>
        )}

        {!loading && donations.filter(d => d.status === 'AVAILABLE').length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-slate-500 mb-4">
              {t('noAvailableDonations')}
            </p>
          </div>
        )}

        <div className="divide-y divide-gray-200 dark:divide-slate-800">
          {donations.filter(d => d.status === 'AVAILABLE').slice(0, 5).map((donation) => {
            const timeLeft = getTimeRemaining(donation.expiryTime)
            return (
              <div key={donation.id} className="p-4 hover:bg-gray-100/50 dark:bg-slate-800/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${timeLeft.urgent ? 'bg-red-500/10' : 'bg-emerald-500/10'
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
                        {timeLeft.urgent && (
                          <span className="text-xs px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeLeft.hours}h {timeLeft.minutes}m
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-slate-500">
                        {donation.quantity} {donation.unit} • {donation.donorName}
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
                      {t('available')}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Claimed Donations */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-slate-800">
          <h2 className="font-medium text-gray-900 dark:text-white">{t('yourClaimedDonations')}</h2>
        </div>

        {!loading && donations.filter(d => d.status === 'CLAIMED' || d.status === 'PICKED_UP').length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-slate-500">{t('noClaimedDonations')}</p>
          </div>
        )}

        <div className="divide-y divide-gray-200 dark:divide-slate-800">
          {donations.filter(d => d.status === 'CLAIMED' || d.status === 'PICKED_UP').map((donation) => {
            return (
              <div key={donation.id} className="p-4 hover:bg-gray-100/50 dark:bg-slate-800/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-amber-500/10">
                      {donation.foodType === 'cooked' && '🍛'}
                      {donation.foodType === 'raw' && '🥬'}
                      {donation.foodType === 'packaged' && '📦'}
                      {donation.foodType === 'fruits' && '🍎'}
                      {donation.foodType === 'bakery' && '🥖'}
                      {donation.foodType === 'dairy' && '🥛'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{donation.name}</p>
                      <p className="text-sm text-gray-500 dark:text-slate-500">
                        {donation.quantity} {donation.unit} • {donation.donorName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openTracking(donation)}
                      className="px-3 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors border border-blue-500/20 flex items-center gap-1"
                    >
                      <Navigation2 className="w-3 h-3" />
                      Track Volunteer
                    </button>
                    <button
                      onClick={() => setSelectedDonation(donation)}
                      className="px-3 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-gray-200 dark:bg-slate-700 transition-colors border border-gray-300 dark:border-slate-700"
                    >
                      {t('viewDetails')}
                    </button>
                    <span className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${getStatusStyle(donation.status)}`}>
                      {donation.status === 'PICKED_UP' ? t('pickedUp') : t('claimed')}
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
                  <div className="absolute bottom-4 right-4 bg-black/60 text-gray-900 dark:text-white text-xs px-3 py-1 rounded-full">
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

              <div className="space-y-3 flex-1 overflow-y-auto">
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
                  <div className="flex gap-2 flex-wrap">
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

                {/* Location */}
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">{t('pickupLocation')}</p>
                  <p className="text-sm text-gray-700 dark:text-slate-300">📍 {selectedDonation.location?.address || 'Location not specified'}</p>
                </div>

                {/* Time */}
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>{t('prepared', { time: new Date(selectedDonation.preparationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-800">
                {!user.isVerified ? (
                  <div className="text-center p-3 bg-amber-500/10 text-amber-400 rounded-lg text-sm font-medium border border-amber-500/20">
                    ⏳ {t('verificationPending')} — {t('verificationPendingDesc') || 'You cannot claim donations until your account is verified.'}
                  </div>
                ) : selectedDonation.status === 'AVAILABLE' ? (
                  <button
                    onClick={() => handleClaim(selectedDonation.id)}
                    disabled={claiming === selectedDonation.id}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-200 dark:bg-slate-700 text-white rounded-lg font-semibold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    {claiming === selectedDonation.id ? (
                      <>{t('claiming')}</>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4" />
                        {t('claimThisFood')}
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="text-center p-3 bg-amber-500/10 text-amber-400 rounded-lg font-medium border border-amber-500/20">
                      {selectedDonation.status === 'CLAIMED' ? t('alreadyClaimed') : t('alreadyPickedUp')}
                    </div>
                    <button
                      onClick={() => { setSelectedDonation(null); setCurrentImageIndex(0); openTracking(selectedDonation); }}
                      className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-lg font-semibold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                    >
                      <Navigation2 className="w-4 h-4" />
                      Track Volunteer Live
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Live Volunteer Tracking Modal ────────────────── */}
      {trackingDonation && (
        <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4 bg-black/30 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl w-full max-w-xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Navigation2 className="w-5 h-5 text-blue-400" />
                  Live Volunteer Tracking
                </h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{trackingDonation.name}</p>
              </div>
              <div className="flex items-center gap-3">
                {volunteerPos && (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                    <Radio className="w-3 h-3 animate-pulse" />
                    Live
                  </span>
                )}
                <button onClick={closeTracking} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-500 dark:text-slate-400 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Map */}
            <div className="p-5">
              {volunteerPos ? (
                <>
                  <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-slate-800" style={{ height: 350 }}>
                    <MapContainer
                      center={[volunteerPos.lat, volunteerPos.lng]}
                      zoom={15}
                      style={{ height: '100%', width: '100%' }}
                      zoomControl={true}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <MapFollower position={[volunteerPos.lat, volunteerPos.lng]} />

                      {/* Route trail */}
                      {routeHistory.length > 1 && (
                        <Polyline
                          positions={routeHistory}
                          pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.7, dashArray: '8 6' }}
                        />
                      )}

                      {/* Start marker */}
                      {routeHistory.length > 0 && (
                        <Marker position={routeHistory[0]} icon={pickupIcon} />
                      )}

                      {/* Current volunteer position */}
                      <Marker position={[volunteerPos.lat, volunteerPos.lng]} icon={volunteerIcon} />

                      {/* Pickup location marker */}
                      {trackingDonation?.location?.lat && trackingDonation?.location?.lng && (
                        <Marker
                          position={[trackingDonation.location.lat, trackingDonation.location.lng]}
                          icon={pickupIcon}
                        />
                      )}
                    </MapContainer>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-gray-500 dark:text-slate-500">
                      📍 {volunteerPos.lat.toFixed(5)}, {volunteerPos.lng.toFixed(5)}
                    </p>
                    <div className="flex items-center gap-3">
                      {routeHistory.length > 1 && (
                        <span className="text-xs text-blue-400">{routeHistory.length} points tracked</span>
                      )}
                      {lastUpdate && (
                        <p className="text-xs text-gray-400 dark:text-slate-600">
                          Updated {new Date(lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 p-10 flex items-center justify-center" style={{ height: 350 }}>
                  <div className="text-center">
                    <Navigation2 className="w-10 h-10 text-gray-400 dark:text-slate-600 mx-auto mb-3 animate-pulse" />
                    <p className="text-gray-500 dark:text-slate-400 font-medium text-sm">Waiting for volunteer to share location…</p>
                    <p className="text-xs text-gray-400 dark:text-slate-600 mt-1">
                      The map will appear once the volunteer starts sharing their GPS.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Pickup info footer */}
            <div className="px-5 pb-5">
              <div className="p-3 bg-gray-100/80 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-800">
                <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Pickup Location</p>
                <p className="text-sm text-gray-700 dark:text-slate-300">📍 {trackingDonation.location?.address || 'Unknown'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
