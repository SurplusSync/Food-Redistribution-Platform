import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDonations, claimDonation, updateDonationStatus, type Donation } from '../../services/api'
import { PlusCircle, Map, Clock, TrendingUp, AlertTriangle, X, Image as ImageIcon, Shield, CheckCircle2, MapPin } from 'lucide-react'

export default function DonorHome() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)
  const [claiming, setClaiming] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userRole = (user.role || 'donor').toLowerCase()

  const load = async () => {
    setLoading(true)
    try {
      const data = await getDonations({ 
        role: userRole,
        userId: user.id 
      })
      setDonations(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const activeCount = donations.filter((d) => d.status === 'AVAILABLE').length
  const claimedCount = donations.filter((d) => d.status === 'CLAIMED').length
  const deliveredCount = donations.filter((d) => d.status === 'DELIVERED').length

  const getTimeRemaining = (expiryTime: Date) => {
    const now = new Date()
    const remaining = new Date(expiryTime).getTime() - now.getTime()
    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    return { hours, minutes, urgent: hours < 3 }
  }

  const urgentDonations = donations.filter(d => {
    if (d.status !== 'AVAILABLE') return false
    return getTimeRemaining(d.expiryTime).urgent
  })

  const handleClaim = async (donationId: string) => {
    setClaiming(donationId)
    try {
      await claimDonation(donationId)
      await load()
      setSelectedDonation(null)
    } catch (error: any) {
      alert(error.message || 'Failed to claim donation')
    } finally {
      setClaiming(null)
    }
  }

  const handleConfirmPickup = async (id: string) => {
    setProcessingId(id)
    try {
      await updateDonationStatus(id, 'PICKED_UP')
      await load()
      setSelectedDonation(null)
    } catch (error: any) {
      alert(error.message || 'Failed to confirm pickup')
    } finally {
      setProcessingId(null)
    }
  }

  const handleConfirmDelivery = async (id: string) => {
    setProcessingId(id)
    try {
      await updateDonationStatus(id, 'DELIVERED')
      await load()
      setSelectedDonation(null)
    } catch (error: any) {
      alert(error.message || 'Failed to confirm delivery')
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      AVAILABLE: 'bg-emerald-500/10 text-emerald-400',
      CLAIMED: 'bg-amber-500/10 text-amber-400',
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
          {getGreeting()}, {user.name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-slate-500 mt-1">
          {userRole === 'donor' && 'Manage your food donations and make a difference'}
          {userRole === 'ngo' && 'Find and claim food donations to help your community'}
          {userRole === 'volunteer' && 'Help transport food and connect donors with those in need'}
        </p>
      </div>

      {/* Urgent Alerts */}
      {urgentDonations.length > 0 && userRole === 'donor' && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-400 mb-1">Urgent: Food Expiring Soon</p>
              <p className="text-xs text-slate-400">
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
              {userRole === 'donor' ? 'Active' : 'Available'}
            </span>
          </div>
          <p className="text-sm text-slate-400 mb-1">
            {userRole === 'donor' ? 'Your Listings' : 'Ready to Claim'}
          </p>
          <p className="text-3xl font-semibold text-emerald-400">{activeCount}</p>
          {urgentDonations.length > 0 && userRole === 'donor' && (
            <p className="text-xs text-red-400 mt-2">
              {urgentDonations.length} expiring soon
            </p>
          )}
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl text-amber-400">◷</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 uppercase">
              In Transit
            </span>
          </div>
          <p className="text-sm text-slate-400 mb-1">Pending Pickup</p>
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
              <p className="text-sm text-slate-400">
                {userRole === 'donor' ? 'View your donations on map' : 'Find food nearby to claim'}
              </p>
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

      {/* Recent Activity */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-medium text-white">
            {userRole === 'donor' ? 'Your Recent Donations' : 'Available Donations'}
          </h2>
          <Link to="/dashboard/history" className="text-sm text-emerald-400 hover:text-emerald-300">
            View all
          </Link>
        </div>

        {loading && (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        )}

        {!loading && donations.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-slate-500 mb-4">
              {userRole === 'donor' 
                ? 'No donations yet. Start making a difference!' 
                : 'No donations available right now'}
            </p>
            {userRole === 'donor' && (
              <Link
                to="/dashboard/add"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Add Your First Donation
              </Link>
            )}
          </div>
        )}

        <div className="divide-y divide-slate-800">
          {donations.slice(0, 5).map((donation) => {
            const timeLeft = getTimeRemaining(donation.expiryTime)
            return (
              <div key={donation.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                      donation.status === 'AVAILABLE' ? 'bg-emerald-500/10' : 
                      donation.status === 'CLAIMED' ? 'bg-amber-500/10' : 'bg-slate-800'
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
                        {donation.status === 'AVAILABLE' && timeLeft.urgent && (
                          <span className="text-xs px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeLeft.hours}h {timeLeft.minutes}m
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">
                        {donation.quantity} {donation.unit}
                        {userRole !== 'donor' && ` • ${donation.donorName}`}
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
                      {donation.status === 'AVAILABLE' ? 'Available' : donation.status}
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
            <div className="w-full md:w-1/2 bg-slate-950 h-64 md:h-auto relative">
              {selectedDonation.imageUrls && selectedDonation.imageUrls.length > 0 ? (
                <img 
                  src={selectedDonation.imageUrls[0]} 
                  alt={selectedDonation.name} 
                  className="w-full h-full object-cover"
                />
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
                <button onClick={() => setSelectedDonation(null)} className="p-1 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 flex-1">
                {/* Donor Info */}
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
                  <div className="flex gap-2">
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

                {/* Time */}
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>Prepared: {new Date(selectedDonation.preparationTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                {selectedDonation.status === 'AVAILABLE' ? (
                  (userRole === 'ngo' || userRole === 'volunteer') ? (
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
                    <div className="text-center p-3 bg-emerald-500/10 text-emerald-400 rounded-lg font-medium border border-emerald-500/20">
                      Available for Claiming
                    </div>
                  )
                ) : (
                  <div>
                    {userRole === 'volunteer' && selectedDonation.status === 'CLAIMED' ? (
                      <button
                        onClick={() => handleConfirmPickup(selectedDonation.id)}
                        disabled={processingId === selectedDonation.id}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg font-semibold transition-all"
                      >
                        {processingId === selectedDonation.id ? 'Processing...' : 'Confirm Pickup'}
                      </button>
                    ) : userRole === 'volunteer' && selectedDonation.status === 'PICKED_UP' ? (
                      <button
                        onClick={() => handleConfirmDelivery(selectedDonation.id)}
                        disabled={processingId === selectedDonation.id}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg font-semibold transition-all"
                      >
                        {processingId === selectedDonation.id ? 'Processing...' : 'Confirm Delivery'}
                      </button>
                    ) : (
                      <div className="text-center p-3 bg-amber-500/10 text-amber-400 rounded-lg font-medium border border-amber-500/20">
                        Already Claimed
                      </div>
                    )}
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