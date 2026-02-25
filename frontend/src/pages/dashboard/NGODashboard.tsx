import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDonations, claimDonation, type Donation } from '../../services/api'
import { socketService } from '../../services/socket'
import { Map, TrendingUp, Clock, X, Image as ImageIcon, Shield, CheckCircle2, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

export default function NGODashboard() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)
  const [claiming, setClaiming] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const user = JSON.parse(localStorage.getItem('user') || '{}')

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
    
    // Connect to WebSocket
    socketService.connect()

    // Listen for new donations
    const unsubscribeCreated = socketService.onDonationCreated((data) => {
      toast.success(`🍕 New Food Alert: ${data.foodType} available nearby!`, {
        description: `${data.name} - ${data.location.address}`,
        duration: 5000,
      })
      // Re-fetch donations to show the new item
      load()
    })

    // Listen for claimed donations
    const unsubscribeClaimed = socketService.onDonationClaimed((data) => {
      toast.info(`🔔 Food Claimed`, {
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

    // Cleanup on unmount
    return () => {
      unsubscribeCreated()
      unsubscribeClaimed()
      socketService.disconnect()
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
    } catch (error: any) {
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
      DELIVERED: 'bg-slate-500/10 text-slate-400',
      EXPIRED: 'bg-red-500/10 text-red-400',
    }
    return styles[status] || styles.AVAILABLE
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">
          {getGreeting()}, {user.organizationName || user.name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-slate-500 mt-1">
          Find and claim food donations to help your community
        </p>
      </div>

      {/* NGO Capacity Info */}
      {user.dailyIntakeCapacity && (
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-400 mb-1">Daily Intake Capacity</p>
              <p className="text-xs text-slate-400">
                Current load: <span className="text-blue-400 font-semibold">{user.currentIntakeLoad}</span> / <span className="text-blue-400 font-semibold">{user.dailyIntakeCapacity}</span> {user.capacityUnit || 'kg'}
              </p>
            </div>
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
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
              Available
            </span>
          </div>
          <p className="text-sm text-slate-400 mb-1">Ready to Claim</p>
          <p className="text-3xl font-semibold text-emerald-400">{availableCount}</p>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl text-amber-400">◷</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 uppercase">
              In Progress
            </span>
          </div>
          <p className="text-sm text-slate-400 mb-1">Claimed & Pending</p>
          <p className="text-3xl font-semibold text-amber-400">{claimedCount}</p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl text-slate-400">✓</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-500/10 text-slate-400 uppercase">
              Complete
            </span>
          </div>
          <p className="text-sm text-slate-400 mb-1">Delivered</p>
          <p className="text-3xl font-semibold text-slate-400">{deliveredCount}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link
          to="/dashboard/map"
          className="group p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
              <Map className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Discovery Map</h3>
              <p className="text-sm text-slate-400">Find food donations nearby to claim</p>
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard/impact"
          className="group p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Your Impact</h3>
              <p className="text-sm text-slate-400">See the difference you're making</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Available Donations */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-8">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-medium text-white">
            Available Donations To Claim
          </h2>
          <Link to="/dashboard/history" className="text-sm text-emerald-400 hover:text-emerald-300">
            View all
          </Link>
        </div>

        {loading && (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        )}

        {!loading && donations.filter(d => d.status === 'AVAILABLE').length === 0 && (
          <div className="p-8 text-center">
            <p className="text-slate-500 mb-4">
              No available donations right now. Try checking the map or refreshing later.
            </p>
          </div>
        )}

        <div className="divide-y divide-slate-800">
          {donations.filter(d => d.status === 'AVAILABLE').slice(0, 5).map((donation) => {
            const timeLeft = getTimeRemaining(donation.expiryTime)
            return (
              <div key={donation.id} className="p-4 hover:bg-slate-800/30 transition-colors">
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
                        <p className="font-medium text-white">{donation.name}</p>
                        {timeLeft.urgent && (
                          <span className="text-xs px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeLeft.hours}h {timeLeft.minutes}m
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">
                        {donation.quantity} {donation.unit} • {donation.donorName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedDonation(donation)}
                      className="px-3 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700"
                    >
                      View Details
                    </button>
                    <span className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${getStatusStyle(donation.status)}`}>
                      Available
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Claimed Donations */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800">
          <h2 className="font-medium text-white">Your Claimed Donations</h2>
        </div>

        {!loading && donations.filter(d => d.status === 'CLAIMED' || d.status === 'PICKED_UP').length === 0 && (
          <div className="p-8 text-center">
            <p className="text-slate-500">No claimed donations yet. Start claiming from available donations!</p>
          </div>
        )}

        <div className="divide-y divide-slate-800">
          {donations.filter(d => d.status === 'CLAIMED' || d.status === 'PICKED_UP').map((donation) => {
            return (
              <div key={donation.id} className="p-4 hover:bg-slate-800/30 transition-colors">
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
                      <p className="font-medium text-white">{donation.name}</p>
                      <p className="text-sm text-slate-500">
                        {donation.quantity} {donation.unit} • {donation.donorName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedDonation(donation)}
                      className="px-3 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700"
                    >
                      View Details
                    </button>
                    <span className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${getStatusStyle(donation.status)}`}>
                      {donation.status === 'PICKED_UP' ? 'Picked Up' : 'Claimed'}
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
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row">

            {/* LEFT: Image Section */}
            <div className="w-full md:w-1/2 bg-slate-950 h-64 md:h-auto relative group">
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
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev + 1) % selectedDonation.imageUrls.length)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                  <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                  <span className="text-sm">No image uploaded</span>
                </div>
              )}
            </div>

            {/* RIGHT: Details */}
            <div className="w-full md:w-1/2 p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">{selectedDonation.name}</h2>
                  <p className="text-emerald-400 font-medium">{selectedDonation.quantity} {selectedDonation.unit} • {selectedDonation.foodType}</p>
                </div>
                <button onClick={() => { setSelectedDonation(null); setCurrentImageIndex(0); }} className="p-1 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-800">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Donor</p>
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">{selectedDonation.donorName}</span>
                    <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded text-emerald-400 text-xs">
                      <Shield className="w-3 h-3" />
                      <span>Trust: {selectedDonation.donorTrustScore?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedDonation.description && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Description</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{selectedDonation.description}</p>
                  </div>
                )}

                {/* Hygiene */}
                <div>
                  <p className="text-xs text-slate-400 mb-2">Safety Check</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedDonation.hygiene?.keptCovered ? (
                      <span className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Kept Covered
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20">
                        <X className="w-3 h-3" /> Not Covered
                      </span>
                    )}
                    {selectedDonation.hygiene?.containerClean ? (
                      <span className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Clean Container
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20">
                        <X className="w-3 h-3" /> Dirty Container
                      </span>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <p className="text-xs text-slate-400 mb-1">Pickup Location</p>
                  <p className="text-sm text-slate-300">📍 {selectedDonation.location?.address || 'Location not specified'}</p>
                </div>

                {/* Time */}
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>Prepared: {new Date(selectedDonation.preparationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                {selectedDonation.status === 'AVAILABLE' ? (
                  <button
                    onClick={() => handleClaim(selectedDonation.id)}
                    disabled={claiming === selectedDonation.id}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-white rounded-lg font-semibold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    {claiming === selectedDonation.id ? (
                      <>Claiming...</>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4" />
                        Claim This Food
                      </>
                    )}
                  </button>
                ) : (
                  <div className="text-center p-3 bg-amber-500/10 text-amber-400 rounded-lg font-medium border border-amber-500/20">
                    {selectedDonation.status === 'CLAIMED' ? 'Already Claimed - Awaiting Pickup' : 'Already Picked Up - Pending Delivery'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
