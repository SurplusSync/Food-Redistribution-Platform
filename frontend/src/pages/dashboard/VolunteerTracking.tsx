import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigation2, Timer, Loader2, RefreshCw, MapPin, PlayCircle, PauseCircle, CheckCircle2 } from 'lucide-react'
import { getMyDeliveries } from '../../services/api'
import { socketService } from '../../services/socket'
import { toast } from 'sonner'

interface Delivery {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  status: string
  donorName: string
  claimedById: string | null
  volunteerId: string | null
  createdAt: string
  donor?: { organizationName?: string; name?: string; address?: string }
}

const statusLabel: Record<string, string> = {
  CLAIMED: 'Awaiting Pickup',
  PICKED_UP: 'In Transit',
}
const statusBadge: Record<string, string> = {
  CLAIMED: 'badge-warning',
  PICKED_UP: 'badge-info',
}

export default function VolunteerTracking() {
  const user = JSON.parse(localStorage.getItem('user') || '{}') as { id?: string }
  const userId = user.id || ''

  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [isSharing, setIsSharing] = useState(false)
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null)
  const watchIdRef = useRef<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getMyDeliveries()
      setDeliveries(data)
    } catch {
      toast.error('Failed to load deliveries')
      setDeliveries([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Browser Geolocation → WebSocket broadcast
  const startSharing = useCallback(() => {
    if (!('geolocation' in navigator)) {
      toast.error('Geolocation is not supported by your browser')
      return
    }
    setIsSharing(true)
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setPosition(coords)
        // Broadcast for every active delivery
        deliveries.forEach((d) => {
          socketService.emitVolunteerLocation({
            volunteerId: userId,
            donationId: d.id,
            lat: coords.lat,
            lng: coords.lng,
          })
        })
      },
      (err) => {
        console.error('Geolocation error:', err)
        toast.error('Location access denied or unavailable')
        setIsSharing(false)
      },
      { enableHighAccuracy: false, maximumAge: 10000, timeout: 60000 },
    )
  }, [deliveries, userId])

  const stopSharing = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setIsSharing(false)
  }, [])

  // Cleanup on unmount
  useEffect(() => () => { stopSharing() }, [stopSharing])

  // Listen for live volunteer location updates (from self or dispatchers watching)
  useEffect(() => {
    const unsubs = deliveries.map((d) =>
      socketService.onVolunteerLocation(d.id, (loc) => {
        if (loc.volunteerId === userId) {
          setPosition({ lat: loc.lat, lng: loc.lng })
        }
      }),
    )
    return () => unsubs.forEach((u) => u())
  }, [deliveries, userId])

  const mapSrc = position
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${position.lng - 0.01},${position.lat - 0.01},${position.lng + 0.01},${position.lat + 0.01}&layer=mapnik&marker=${position.lat},${position.lng}`
    : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Volunteer Location Tracking</h1>
          <p className="text-slate-400 mt-1">Share live location and monitor route progress for active deliveries.</p>
        </div>
        <button onClick={load} disabled={loading} className="p-2 text-slate-400 hover:text-emerald-400 rounded-lg">
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Map Panel */}
        <div className="xl:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Navigation2 className="w-5 h-5 text-emerald-400" />
              Live Location
            </h2>
            <span className={`badge ${isSharing ? 'badge-success' : 'badge-warning'}`}>
              {isSharing ? 'Live' : 'Paused'}
            </span>
          </div>

          {mapSrc ? (
            <iframe
              title="Volunteer live location"
              src={mapSrc}
              className="w-full rounded-xl border border-slate-800"
              style={{ height: 320 }}
            />
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-8 flex items-center justify-center" style={{ height: 320 }}>
              <div className="text-center">
                <MapPin className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">
                  {isSharing ? 'Acquiring GPS signal…' : 'Start sharing to see your live position on the map.'}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <button
              type="button"
              onClick={isSharing ? stopSharing : startSharing}
              className={`${isSharing ? 'btn-secondary' : 'btn-primary'} flex items-center gap-2`}
            >
              {isSharing ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
              {isSharing ? 'Stop Sharing' : 'Start Sharing'}
            </button>
            {position && (
              <span className="text-xs text-slate-500">
                {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
              </span>
            )}
          </div>
        </div>

        {/* Deliveries Panel */}
        <div className="card p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Timer className="w-5 h-5 text-amber-400" />
            Active Deliveries
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
              <span className="ml-3 text-slate-400 text-sm">Loading…</span>
            </div>
          ) : deliveries.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No active deliveries right now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {deliveries.map((d) => (
                <div key={d.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-white truncate">{d.name}</p>
                    <span className={`badge ${statusBadge[d.status] || 'badge-info'}`}>
                      {statusLabel[d.status] || d.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">From: {d.donorName}</p>
                  <p className="text-xs text-slate-500 mt-1 truncate">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {d.address || 'No address'}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
