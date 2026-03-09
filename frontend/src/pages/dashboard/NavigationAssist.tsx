import { ExternalLink, Navigation2, MapPin } from 'lucide-react'

type RouteCard = {
  id: string
  donation: string
  pickupAddress: string
  dropAddress: string
}

const routes: RouteCard[] = [
  {
    id: 'NAV-51',
    donation: 'Packed Meals',
    pickupAddress: 'Sector 12, Dwarka, New Delhi',
    dropAddress: 'Hope Foundation Shelter, Janakpuri',
  },
  {
    id: 'NAV-52',
    donation: 'Fruit Basket',
    pickupAddress: 'DLF Phase 3 Market, Gurugram',
    dropAddress: 'Community Kitchen, Udyog Vihar',
  },
]

const toGoogleMapsUrl = (origin: string, destination: string) => {
  const encodedOrigin = encodeURIComponent(origin)
  const encodedDestination = encodeURIComponent(destination)
  return `https://www.google.com/maps/dir/?api=1&origin=${encodedOrigin}&destination=${encodedDestination}&travelmode=driving`
}

export default function NavigationAssist() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Google Maps Navigation</h1>
        <p className="text-slate-400 mt-1">Open turn-by-turn pickup and drop routes directly from active donation cards.</p>
      </div>

      <div className="space-y-3">
        {routes.map((route) => {
          const mapsUrl = toGoogleMapsUrl(route.pickupAddress, route.dropAddress)
          return (
            <div key={route.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-white font-semibold flex items-center gap-2">
                    <Navigation2 className="w-4 h-4 text-emerald-400" />
                    {route.donation}
                  </p>
                  <p className="text-sm text-slate-400 mt-2 flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-slate-500" />
                    {route.pickupAddress}{' -> '}{route.dropAddress}
                  </p>
                </div>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary flex items-center gap-2 whitespace-nowrap"
                >
                  Open Route
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-6 text-center">
                <p className="text-slate-300 font-medium">Embedded Route Preview Placeholder</p>
                <p className="text-xs text-slate-500 mt-1">Connect this card to Google Maps Embed API key when available.</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
