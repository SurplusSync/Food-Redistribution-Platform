import { useMemo, useState } from 'react'
import { Crosshair, Navigation, PauseCircle, PlayCircle, Navigation2, Timer } from 'lucide-react'

type VolunteerTrip = {
  id: string
  donation: string
  pickup: string
  dropoff: string
  progress: number
  etaMinutes: number
  state: 'assigned' | 'pickup' | 'in_transit' | 'delivered'
}

const mockTrips: VolunteerTrip[] = [
  {
    id: 'TR-101',
    donation: 'Cooked Meals Pack',
    pickup: 'Sector 21 Community Kitchen',
    dropoff: 'Hope Shelter, Phase 2',
    progress: 35,
    etaMinutes: 24,
    state: 'pickup',
  },
  {
    id: 'TR-102',
    donation: 'Fresh Vegetables',
    pickup: 'Green Mart Warehouse',
    dropoff: 'Annapurna NGO Hub',
    progress: 70,
    etaMinutes: 12,
    state: 'in_transit',
  },
]

export default function VolunteerTracking() {
  const [isSharing, setIsSharing] = useState(true)
  const [lat, setLat] = useState(28.6139)
  const [lng, setLng] = useState(77.209)

  const statusText = useMemo(() => {
    if (!isSharing) return 'Paused'
    return 'Live'
  }, [isSharing])

  const nudgeLocation = () => {
    const jitter = () => (Math.random() - 0.5) / 500
    setLat((prev) => Number((prev + jitter()).toFixed(5)))
    setLng((prev) => Number((prev + jitter()).toFixed(5)))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Volunteer Location Tracking</h1>
        <p className="text-slate-400 mt-1">Share live location and monitor route progress for active deliveries.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Navigation2 className="w-5 h-5 text-emerald-400" />
              Route Monitor
            </h2>
            <span className={`badge ${isSharing ? 'badge-success' : 'badge-warning'}`}>{statusText}</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-8 min-h-[280px] flex items-center justify-center">
            <div className="text-center max-w-md">
              <Navigation className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <p className="text-white font-medium mb-2">Map Preview</p>
              <p className="text-slate-400 text-sm mb-4">Live map tiles can be plugged in here (Leaflet/Google Maps). Coordinates update in real time.</p>
              <div className="text-xs text-slate-500">Latitude: {lat} | Longitude: {lng}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => setIsSharing((prev) => !prev)}
              className={isSharing ? 'btn-secondary flex items-center gap-2' : 'btn-primary flex items-center gap-2'}
            >
              {isSharing ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
              {isSharing ? 'Stop Sharing' : 'Start Sharing'}
            </button>
            <button type="button" onClick={nudgeLocation} className="btn-secondary flex items-center gap-2">
              <Crosshair className="w-4 h-4" />
              Simulate Location Update
            </button>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Timer className="w-5 h-5 text-amber-400" />
            Delivery Timeline
          </h2>
          <div className="space-y-4">
            {mockTrips.map((trip) => (
              <div key={trip.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-white">{trip.id}</p>
                  <span className="text-xs text-slate-500">ETA {trip.etaMinutes}m</span>
                </div>
                <p className="text-sm text-slate-300">{trip.donation}</p>
                <p className="text-xs text-slate-500 mt-1">{trip.pickup}{' -> '}{trip.dropoff}</p>
                <div className="progress-bar mt-3">
                  <div className="progress-fill" style={{ width: `${trip.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
