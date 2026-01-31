import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDonations } from '../../services/api'
import type { Donation } from '../../services/api'
import { PlusCircle, Map } from 'lucide-react'

export default function DonorHome() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(false)

  // Get user role from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userRole = user.role || 'donor'

  const load = async () => {
    setLoading(true)
    try {
      const data = await getDonations()
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

  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-emerald-500/10 text-emerald-400',
      CLAIMED: 'bg-amber-500/10 text-amber-400',
      DELIVERED: 'bg-slate-500/10 text-slate-400',
    }
    return styles[status] || styles.ACTIVE
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
        <p className="text-slate-500 mt-1">
          {userRole === 'donor' ? 'Manage your food donations' : 'Find available food donations'}
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl text-emerald-400">◉</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 uppercase">
              Active
            </span>
          </div>
          <p className="text-sm text-slate-400 mb-1">
            {userRole === 'donor' ? 'Your Listings' : 'Available'}
          </p>
          <p className="text-3xl font-semibold text-emerald-400">{activeCount}</p>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl text-amber-400">◷</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 uppercase">
              Claimed
            </span>
          </div>
          <p className="text-sm text-slate-400 mb-1">Pending Pickup</p>
          <p className="text-3xl font-semibold text-amber-400">{claimedCount}</p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl text-slate-400">✓</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-500/10 text-slate-400 uppercase">
              Delivered
            </span>
          </div>
          <p className="text-sm text-slate-400 mb-1">Completed</p>
          <p className="text-3xl font-semibold text-slate-400">{deliveredCount}</p>
        </div>
      </div>

      {/* Quick Actions - Different for each role */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {userRole === 'donor' && (
          <Link
            to="/dashboard/add"
            className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-white">Add Food</h3>
                <p className="text-sm text-slate-500">Share surplus food</p>
              </div>
            </div>
          </Link>
        )}

        <Link
          to="/dashboard/map"
          className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-white">Discovery Map</h3>
              <p className="text-sm text-slate-500">
                {userRole === 'donor' ? 'View donations nearby' : 'Find food to claim'}
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Donations */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-medium text-white">
            {userRole === 'donor' ? 'Your Donations' : 'Available Donations'}
          </h2>
          <Link to="/dashboard/history" className="text-sm text-emerald-400 hover:text-emerald-300">
            View all
          </Link>
        </div>

        {loading && (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        )}

        {!loading && donations.length === 0 && (
          <div className="p-8 text-center text-slate-500">No donations yet</div>
        )}

        <div className="divide-y divide-slate-800">
          {donations.slice(0, 5).map((donation) => (
            <div key={donation.id} className="p-4 hover:bg-slate-800/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                    ◉
                  </div>
                  <div>
                    <p className="font-medium text-white">{donation.name}</p>
                    <p className="text-sm text-slate-500">Qty: {donation.quantity}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getStatusStyle(donation.status)}`}>
                  {donation.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
