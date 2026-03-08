import { useEffect, useState, useCallback } from 'react'
import {
  getDonations,
  updateDonationStatus,
  getUserProfile,
  updateUserProfile,
  getCompletedTrips,
  toggleAvailability,
  type Donation,
  type User,
} from '../../services/api'
import { socketService } from '../../services/socket'
import {
  CheckCircle2, MapPin, X, ChevronLeft, ChevronRight,
  Image as ImageIcon, Navigation, Truck, Package, Award,
  ToggleLeft, ToggleRight, Car, Bike,
  Star, TrendingUp, AlertTriangle, Zap, Router,
} from 'lucide-react'
import { toast } from 'sonner'

// ─── Helpers ────────────────────────────────────────────────────────────────

const VEHICLE_ICONS: Record<string, string> = {
  bike: '🏍️', car: '🚗', van: '🚐', bicycle: '🚲', walk: '🚶',
}
const FOOD_EMOJI: Record<string, string> = {
  cooked: '🍛', raw: '🥬', packaged: '📦', fruits: '🍎', bakery: '🥖', dairy: '🥛',
}

function getTimeRemaining(expiryTime: Date) {
  const remaining = new Date(expiryTime).getTime() - Date.now()
  const hours = Math.floor(remaining / (1000 * 60 * 60))
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
  return { hours, minutes, urgent: hours < 3, expired: remaining <= 0 }
}

function openGoogleMaps(address: string, lat?: number, lng?: number) {
  const dest = lat && lng ? `${lat},${lng}` : encodeURIComponent(address)
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, '_blank')
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ icon, label, value, accent }: {
  icon: React.ReactNode; label: string; value: string | number; accent: string
}) {
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4`}>
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${accent}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

// ─── Availability Toggle ──────────────────────────────────────────────────────

function AvailabilityToggle({ isAvailable, onToggle, loading }: {
  isAvailable: boolean; onToggle: () => void; loading: boolean
}) {
  return (
    <button
      onClick={onToggle}
      disabled={loading}
      className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border font-medium text-sm transition-all duration-200 ${isAvailable
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
          : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
        }`}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isAvailable ? (
        <ToggleRight className="w-5 h-5" />
      ) : (
        <ToggleLeft className="w-5 h-5" />
      )}
      {isAvailable ? 'Available for Pickups' : 'Unavailable'}
      <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
    </button>
  )
}

// ─── Vehicle Profile Card ─────────────────────────────────────────────────────

function VehicleProfile({ user, onSave }: { user: User; onSave: (data: any) => Promise<void> }) {
  const [editing, setEditing] = useState(false)
  const [vehicleType, setVehicleType] = useState(user.vehicleType || '')
  const [vehicleNumber, setVehicleNumber] = useState(user.vehicleNumber || '')
  const [saving, setSaving] = useState(false)

  const vehicles = [
    { value: 'bike', label: 'Motorbike', icon: '🏍️' },
    { value: 'car', label: 'Car', icon: '🚗' },
    { value: 'van', label: 'Van', icon: '🚐' },
    { value: 'bicycle', label: 'Bicycle', icon: '🚲' },
    { value: 'walk', label: 'On Foot', icon: '🚶' },
  ]

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({ vehicleType, vehicleNumber })
      setEditing(false)
      toast.success('Vehicle details updated!')
    } catch {
      toast.error('Failed to save vehicle details')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-purple-400" />
          <h3 className="font-medium text-white text-sm">Vehicle Details</h3>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-slate-400 hover:text-white border border-slate-700 rounded-md px-2.5 py-1 hover:border-slate-600 transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Vehicle Type</label>
            <div className="grid grid-cols-5 gap-1.5">
              {vehicles.map(v => (
                <button
                  key={v.value}
                  onClick={() => setVehicleType(v.value)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all ${vehicleType === v.value
                      ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                      : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                    }`}
                >
                  <span className="text-lg">{v.icon}</span>
                  <span>{v.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">
              Vehicle Number <span className="text-slate-600">(optional)</span>
            </label>
            <input
              value={vehicleNumber}
              onChange={e => setVehicleNumber(e.target.value)}
              placeholder="e.g. TN 09 AB 1234"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          {user.vehicleType ? (
            <>
              <span className="text-3xl">{VEHICLE_ICONS[user.vehicleType] || '🚗'}</span>
              <div>
                <p className="text-white font-medium capitalize">{user.vehicleType}</p>
                {user.vehicleNumber && (
                  <p className="text-slate-500 text-sm mt-0.5">{user.vehicleNumber}</p>
                )}
              </div>
            </>
          ) : (
            <p className="text-slate-500 text-sm">No vehicle added. Add your vehicle to get started.</p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({
  donation,
  processingId,
  onPickup,
  onDelivery,
  onView,
}: {
  donation: Donation
  processingId: string | null
  onPickup: (id: string) => void
  onDelivery: (id: string) => void
  onView: (d: Donation) => void
}) {
  const timeLeft = getTimeRemaining(donation.expiryTime)
  const isProcessing = processingId === donation.id

  return (
    <div className="p-4 hover:bg-slate-800/30 transition-colors">
      <div className="flex items-start gap-4">
        {/* Food icon */}
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center text-xl shrink-0 ${donation.status === 'PICKED_UP' ? 'bg-amber-500/10' : 'bg-emerald-500/10'
          }`}>
          {FOOD_EMOJI[donation.foodType] || '🍱'}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-medium text-white truncate">{donation.name}</p>
            <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded font-medium ${donation.status === 'PICKED_UP'
                ? 'bg-amber-500/10 text-amber-400'
                : 'bg-blue-500/10 text-blue-400'
              }`}>
              {donation.status === 'PICKED_UP' ? 'En Route' : 'Awaiting Pickup'}
            </span>
          </div>

          <p className="text-sm text-slate-500 truncate">
            {donation.quantity} {donation.unit} • {donation.donorName}
          </p>

          {donation.location?.address && (
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 text-slate-600 shrink-0" />
              <p className="text-xs text-slate-600 truncate">{donation.location.address}</p>
            </div>
          )}

          {timeLeft.urgent && !timeLeft.expired && (
            <div className="flex items-center gap-1 mt-1.5">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span className="text-xs text-red-400 font-medium">
                Expires in {timeLeft.hours}h {timeLeft.minutes}m
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <button
            onClick={() => onView(donation)}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700"
          >
            Details
          </button>

          <button
            onClick={() => openGoogleMaps(donation.location?.address || '', donation.location?.lat, donation.location?.lng)}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700 flex items-center gap-1"
          >
            <Navigation className="w-3 h-3" /> Directions
          </button>

          {donation.status === 'CLAIMED' && (
            <button
              onClick={() => onPickup(donation.id)}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              {isProcessing ? '…' : '✓ Picked Up'}
            </button>
          )}

          {donation.status === 'PICKED_UP' && (
            <button
              onClick={() => onDelivery(donation.id)}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white transition-colors"
            >
              {isProcessing ? '…' : '✓ Delivered'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Completed Trips Tab ─────────────────────────────────────────────────────

function CompletedTrips({ userId }: { userId: string }) {
  const [trips, setTrips] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCompletedTrips(userId)
      .then(setTrips)
      .catch(() => setTrips([]))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) return <div className="p-8 text-center text-slate-500 text-sm">Loading trips…</div>

  if (trips.length === 0) {
    return (
      <div className="p-10 text-center">
        <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3">
          <Router className="w-6 h-6 text-slate-600" />
        </div>
        <p className="text-slate-500 text-sm">No completed trips yet.</p>
        <p className="text-slate-600 text-xs mt-1">Complete your first delivery to see it here.</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-slate-800">
      {trips.map(trip => (
        <div key={trip.id} className="p-4 hover:bg-slate-800/20 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-lg">
              {FOOD_EMOJI[trip.foodType] || '🍱'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">{trip.name}</p>
              <p className="text-slate-500 text-xs">{trip.quantity} {trip.unit} • {trip.donorName}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full font-medium">
                ✓ Delivered
              </span>
              {(trip as any).deliveredAt && (
                <p className="text-xs text-slate-600 mt-1">
                  {new Date((trip as any).deliveredAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({
  donation,
  processingId,
  onPickup,
  onDelivery,
  onClose,
}: {
  donation: Donation
  processingId: string | null
  onPickup: (id: string) => void
  onDelivery: (id: string) => void
  onClose: () => void
}) {
  const [imgIndex, setImgIndex] = useState(0)
  const isProcessing = processingId === donation.id

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-semibold text-white">{donation.name}</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {donation.quantity} {donation.unit} • {donation.foodType}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image */}
        <div className="relative w-full h-48 bg-slate-950">
          {donation.imageUrls?.length > 0 ? (
            <>
              <img src={donation.imageUrls[imgIndex]} alt={donation.name} className="w-full h-full object-cover" />
              {donation.imageUrls.length > 1 && (
                <>
                  <button onClick={() => setImgIndex(p => (p - 1 + donation.imageUrls.length) % donation.imageUrls.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setImgIndex(p => (p + 1) % donation.imageUrls.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                    {imgIndex + 1}/{donation.imageUrls.length}
                  </span>
                </>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-700">
              <ImageIcon className="w-10 h-10 mb-2" />
              <span className="text-sm">No image</span>
            </div>
          )}
        </div>

        {/* Info Grid */}
        <div className="p-5 space-y-4">
          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${donation.status === 'PICKED_UP'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              }`}>
              {donation.status === 'PICKED_UP' ? '🚗 En Route to NGO' : '📦 Ready for Pickup'}
            </span>
          </div>

          {/* Pickup address */}
          <div className="bg-slate-800/50 rounded-lg p-3.5 space-y-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Pickup Location</p>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <p className="text-sm text-white">{donation.location?.address || 'Address not available'}</p>
            </div>
            <button
              onClick={() => openGoogleMaps(donation.location?.address || '', donation.location?.lat, donation.location?.lng)}
              className="w-full mt-1 flex items-center justify-center gap-2 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium transition-colors"
            >
              <Navigation className="w-4 h-4" />
              Get Directions to Donor
            </button>
          </div>

          {/* Donor */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Donor</p>
              <p className="text-sm text-white font-medium">{donation.donorName}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Expiry</p>
              <p className="text-sm text-white font-medium">
                {new Date(donation.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Description */}
          {donation.description && (
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Notes</p>
              <p className="text-sm text-slate-300">{donation.description}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            {donation.status === 'CLAIMED' && (
              <button
                onClick={() => { onPickup(donation.id); onClose() }}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
              >
                <Package className="w-4 h-4" />
                {isProcessing ? 'Processing…' : 'Confirm Pickup'}
              </button>
            )}
            {donation.status === 'PICKED_UP' && (
              <button
                onClick={() => { onDelivery(donation.id); onClose() }}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isProcessing ? 'Processing…' : 'Confirm Delivery'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VolunteerDashboard() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'tasks' | 'trips'>('tasks')

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const all = await getDonations({ status: ['CLAIMED', 'PICKED_UP'] })
      // Show tasks for this volunteer (assigned via volunteerId or all available claimed ones)
      setDonations(all.filter((d: Donation) =>
        d.status === 'CLAIMED' || d.status === 'PICKED_UP'
      ))
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  const loadProfile = useCallback(async () => {
    try {
      const p = await getUserProfile()
      setProfile(p)
      // Sync availability into localStorage user
      localStorage.setItem('user', JSON.stringify({ ...user, isAvailable: p.isAvailable, vehicleType: p.vehicleType, vehicleNumber: p.vehicleNumber }))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    load()
    loadProfile()

    socketService.connect()

    const unsubCreated = socketService.onDonationCreated((data) => {
      toast.info(`🍕 New donation nearby: ${data.name}`, { duration: 4000 })
    })

    const unsubClaimed = socketService.onDonationClaimed(() => { load() })

    const unsubAssigned = socketService.onVolunteerAssigned((data) => {
      if (data.volunteerId === user.id) {
        toast.success(`🚗 New Assignment: ${data.donationName}`, {
          description: `Pickup from: ${data.donorAddress}`,
          duration: 7000,
        })
        load()
      }
    })

    return () => {
      unsubCreated()
      unsubClaimed()
      unsubAssigned()
      socketService.disconnect()
    }
  }, [load, loadProfile])

  const handleToggleAvailability = async () => {
    setAvailabilityLoading(true)
    try {
      const current = profile?.isAvailable ?? false
      await toggleAvailability(!current)
      setProfile(p => p ? { ...p, isAvailable: !current } : p)
      toast.success(current ? 'You are now unavailable' : 'You are now available for pickups!')
    } catch {
      toast.error('Failed to update availability')
    } finally {
      setAvailabilityLoading(false)
    }
  }

  const handleSaveVehicle = async (data: any) => {
    await updateUserProfile(data)
    setProfile(p => p ? { ...p, ...data } : p)
  }

  const handleConfirmPickup = async (id: string) => {
    setProcessingId(id)
    try {
      await updateDonationStatus(id, 'PICKED_UP')
      toast.success('Pickup confirmed! Head to the NGO for delivery.')
      await load()
    } catch (err: any) {
      toast.error(err.message || 'Failed to confirm pickup')
    } finally {
      setProcessingId(null)
    }
  }

  const handleConfirmDelivery = async (id: string) => {
    setProcessingId(id)
    try {
      await updateDonationStatus(id, 'DELIVERED')
      toast.success('🎉 Delivery confirmed! +50 karma points earned!', { duration: 5000 })
      await load()
      await loadProfile()
    } catch (err: any) {
      toast.error(err.message || 'Failed to confirm delivery')
    } finally {
      setProcessingId(null)
    }
  }

  const activeTasks = donations.filter(d => d.status === 'CLAIMED' || d.status === 'PICKED_UP')
  const pickedUp = donations.filter(d => d.status === 'PICKED_UP').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Volunteer Dashboard</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage your pickups, deliveries and availability.</p>
        </div>
        <AvailabilityToggle
          isAvailable={profile?.isAvailable ?? false}
          onToggle={handleToggleAvailability}
          loading={availabilityLoading}
        />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Zap className="w-5 h-5 text-yellow-400" />}
          label="Karma Points"
          value={profile?.karmaPoints ?? user.karmaPoints ?? 0}
          accent="bg-yellow-500/10"
        />
        <StatCard
          icon={<Truck className="w-5 h-5 text-emerald-400" />}
          label="Active Tasks"
          value={activeTasks.length}
          accent="bg-emerald-500/10"
        />
        <StatCard
          icon={<Package className="w-5 h-5 text-amber-400" />}
          label="En Route"
          value={pickedUp}
          accent="bg-amber-500/10"
        />
        <StatCard
          icon={<Award className="w-5 h-5 text-purple-400" />}
          label="Badges"
          value={profile?.badges?.length ?? 0}
          accent="bg-purple-500/10"
        />
      </div>

      {/* Badges row */}
      {(profile?.badges?.length ?? 0) > 0 && (
        <div className="flex gap-2 flex-wrap">
          {profile!.badges!.map(badge => (
            <span key={badge} className="text-xs px-2.5 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-full">
              {badge}
            </span>
          ))}
        </div>
      )}

      {/* Vehicle + Tasks layout */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left: Vehicle profile */}
        <div className="lg:col-span-1 space-y-4">
          <VehicleProfile user={profile ?? user} onSave={handleSaveVehicle} />

          {/* Quick tip */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <p className="text-sm font-medium text-white">Earning Karma</p>
            </div>
            <ul className="space-y-1.5">
              {[
                { action: 'Confirm Pickup', points: '+10 pts' },
                { action: 'Complete Delivery', points: '+50 pts' },
              ].map(item => (
                <li key={item.action} className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">{item.action}</span>
                  <span className="text-emerald-400 font-medium">{item.points}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Tasks + trips */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-800">
            {[
              { key: 'tasks', label: 'Active Tasks', icon: <Truck className="w-4 h-4" /> },
              { key: 'trips', label: 'Completed Trips', icon: <TrendingUp className="w-4 h-4" /> },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.key
                    ? 'text-white border-purple-500'
                    : 'text-slate-500 border-transparent hover:text-slate-300'
                  }`}
              >
                {tab.icon}
                {tab.label}
                {tab.key === 'tasks' && activeTasks.length > 0 && (
                  <span className="ml-1 w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">
                    {activeTasks.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeTab === 'tasks' && (
            <>
              {loading && (
                <div className="p-8 text-center text-slate-500 text-sm">Loading tasks…</div>
              )}
              {!loading && activeTasks.length === 0 && (
                <div className="p-10 text-center">
                  <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3">
                    <Bike className="w-6 h-6 text-slate-600" />
                  </div>
                  <p className="text-slate-400 text-sm font-medium">No active tasks</p>
                  <p className="text-slate-600 text-xs mt-1">
                    {profile?.isAvailable
                      ? 'You\'re available — waiting for assignment'
                      : 'Toggle your availability to receive assignments'}
                  </p>
                </div>
              )}
              <div className="divide-y divide-slate-800">
                {activeTasks.map(donation => (
                  <TaskCard
                    key={donation.id}
                    donation={donation}
                    processingId={processingId}
                    onPickup={handleConfirmPickup}
                    onDelivery={handleConfirmDelivery}
                    onView={d => setSelectedDonation(d)}
                  />
                ))}
              </div>
            </>
          )}

          {activeTab === 'trips' && <CompletedTrips userId={user.id} />}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDonation && (
        <DetailModal
          donation={selectedDonation}
          processingId={processingId}
          onPickup={handleConfirmPickup}
          onDelivery={handleConfirmDelivery}
          onClose={() => setSelectedDonation(null)}
        />
      )}
    </div>
  )
}