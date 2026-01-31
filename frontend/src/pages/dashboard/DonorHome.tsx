import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDonations, type Donation } from '../../services/api'
import { PlusCircle, Map, Clock, TrendingUp, AlertTriangle } from 'lucide-react'

export default function DonorHome() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(false)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userRole = user.role || 'donor'

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

  const activeCount = donations.filter((d) => d.status === 'ACTIVE').length
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
    if (d.status !== 'ACTIVE') return false
    return getTimeRemaining(d.expiryTime).urgent
  })

  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-emerald-500/10 text-emerald-400',
      CLAIMED: 'bg-amber-500/10 text-amber-400',
      DELIVERED: 'bg-slate-500/10 text-slate-400',
      EXPIRED: 'bg-red-500/10 text-red-400',
    }
    return styles[status] || styles.ACTIVE
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
        {userRole === 'donor' && (
          <Link
            to="/dashboard/add"
            className="group p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/40 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Add Food Donation</h3>
                <p className="text-sm text-slate-400">Share surplus food with those in need</p>
              </div>
            </div>
          </Link>
        )}

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
                      donation.status === 'ACTIVE' ? 'bg-emerald-500/10' : 
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
                        {donation.status === 'ACTIVE' && timeLeft.urgent && (
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
                  <span className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${getStatusStyle(donation.status)}`}>
                    {donation.status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}