import { useEffect, useState, useCallback } from 'react'
import { ExternalLink, Navigation2, MapPin, Loader2, Package, Truck, Clock } from 'lucide-react'
import { getDonations, type Donation } from '../../services/api'
import { socketService } from '../../services/socket'

const FOOD_EMOJI: Record<string, string> = {
  cooked: '🍛', raw: '🥬', packaged: '📦', fruits: '🍎', bakery: '🥖', dairy: '🥛',
}

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  CLAIMED: { text: 'Awaiting Pickup', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  PICKED_UP: { text: 'In Transit', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
}

function getTimeRemaining(expiryTime: Date) {
  const remaining = new Date(expiryTime).getTime() - Date.now()
  if (remaining <= 0) return { text: 'Expired', urgent: true }
  const hours = Math.floor(remaining / (1000 * 60 * 60))
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
  return {
    text: hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`,
    urgent: hours < 2,
  }
}

function toGoogleMapsUrl(destLat: number, destLng: number, destAddress: string) {
  const destination = destLat && destLng
    ? `${destLat},${destLng}`
    : encodeURIComponent(destAddress)
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`
}

export default function NavigationAssist() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const all = await getDonations({ status: ['CLAIMED', 'PICKED_UP'] })
      setDonations(all)
    } catch {
      setDonations([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()

    const unsubClaimed = socketService.onDonationClaimed(() => load())
    const unsubAssigned = socketService.onVolunteerAssigned(() => load())

    return () => { unsubClaimed(); unsubAssigned() }
  }, [load])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Google Maps Navigation</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">Open turn-by-turn directions to active donation pickup locations.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          <span className="ml-3 text-gray-500 dark:text-slate-400">Loading active routes…</span>
        </div>
      ) : donations.length === 0 ? (
        <div className="text-center py-20">
          <Navigation2 className="w-12 h-12 text-gray-400 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-slate-400 font-medium">No active pickups or deliveries</p>
          <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
            Claimed and in-transit donations will appear here with navigation links.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {donations.map((d) => {
            const mapsUrl = toGoogleMapsUrl(d.location.lat, d.location.lng, d.location.address)
            const timeLeft = getTimeRemaining(d.expiryTime)
            const statusInfo = STATUS_LABELS[d.status] || STATUS_LABELS.CLAIMED
            const emoji = FOOD_EMOJI[d.foodType] || '🍲'

            return (
              <div key={d.id} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-gray-900 dark:text-white font-semibold flex items-center gap-2">
                      <span>{emoji}</span>
                      {d.name}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
                        {d.status === 'PICKED_UP' ? <Truck className="w-3 h-3 inline mr-1" /> : <Package className="w-3 h-3 inline mr-1" />}
                        {statusInfo.text}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${timeLeft.urgent
                        ? 'bg-red-500/10 text-red-400 border-red-500/30'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-700'
                        }`}>
                        <Clock className="w-3 h-3 inline mr-1" />
                        {timeLeft.text}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-gray-400 dark:text-slate-500 shrink-0" />
                      <span>{d.location.address}</span>
                    </p>

                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                      Donor: {d.donorName} · {d.quantity} {d.unit || 'servings'}
                    </p>
                  </div>

                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    Navigate
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Map preview using OpenStreetMap (no API key needed) */}
                {d.location.lat !== 0 && d.location.lng !== 0 && (
                  <div className="mt-4 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden h-[180px]">
                    <iframe
                      title={`Map for ${d.name}`}
                      width="100%"
                      height="180"
                      style={{ border: 0 }}
                      loading="lazy"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${d.location.lng - 0.01},${d.location.lat - 0.008},${d.location.lng + 0.01},${d.location.lat + 0.008}&layer=mapnik&marker=${d.location.lat},${d.location.lng}`}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
