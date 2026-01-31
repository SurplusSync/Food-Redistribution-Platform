import React, { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const createIcon = (color: string) => new L.DivIcon({
    className: 'custom-marker',
    html: `<div style="width:14px;height:14px;background:${color};border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
})

const activeIcon = createIcon('#10b981')
const claimedIcon = createIcon('#f59e0b')

interface Location {
    id: number
    lat: number
    lng: number
    name: string
    donor: string
    qty: string
    status: 'active' | 'claimed'
}

export default function DiscoveryMap() {
    const [filter, setFilter] = useState<'all' | 'active' | 'claimed'>('all')

    // Get user role from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const userRole = user.role || 'donor'
    const canClaim = userRole === 'ngo' || userRole === 'volunteer'

    // Demo data - Delhi area
    const locations: Location[] = [
        { id: 1, lat: 28.6139, lng: 77.2090, name: 'Rice & Dal', donor: 'City Restaurant', qty: '5 kg', status: 'active' },
        { id: 2, lat: 28.6200, lng: 77.2150, name: 'Fresh Vegetables', donor: 'Green Grocery', qty: '3 kg', status: 'active' },
        { id: 3, lat: 28.6080, lng: 77.2000, name: 'Bread Loaves', donor: 'Sunrise Bakery', qty: '15 pcs', status: 'active' },
        { id: 4, lat: 28.6250, lng: 77.1950, name: 'Biryani', donor: 'Hotel Paradise', qty: '20 servings', status: 'claimed' },
        { id: 5, lat: 28.6100, lng: 77.2250, name: 'Fruit Salad', donor: 'Healthy Bites', qty: '10 bowls', status: 'active' },
    ]

    const filtered = filter === 'all' ? locations : locations.filter(l => l.status === filter)

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col -m-8">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                <h1 className="text-lg font-semibold text-white">Discovery Map</h1>
                <div className="flex gap-2">
                    {(['all', 'active', 'claimed'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${filter === f ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Map */}
            <div className="flex-1 relative">
                <MapContainer
                    center={[28.6139, 77.2090]}
                    zoom={14}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; OpenStreetMap'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {filtered.map((loc) => (
                        <Marker
                            key={loc.id}
                            position={[loc.lat, loc.lng]}
                            icon={loc.status === 'active' ? activeIcon : claimedIcon}
                        >
                            <Popup>
                                <div className="p-3 min-w-[180px]">
                                    <p className="font-medium text-white mb-1">{loc.name}</p>
                                    <p className="text-xs text-slate-400 mb-1">{loc.donor}</p>
                                    <p className="text-xs text-slate-400 mb-3">{loc.qty}</p>
                                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${loc.status === 'active'
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : 'bg-amber-500/20 text-amber-400'
                                        }`}>
                                        {loc.status}
                                    </span>
                                    {/* Only show Claim button for NGO/Volunteer users */}
                                    {loc.status === 'active' && canClaim && (
                                        <button className="mt-3 w-full py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs rounded font-medium transition-colors">
                                            Claim
                                        </button>
                                    )}
                                    {/* Show info message for donors */}
                                    {loc.status === 'active' && !canClaim && (
                                        <p className="mt-3 text-xs text-slate-500 text-center">
                                            Only NGOs can claim
                                        </p>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                {/* Legend */}
                <div className="absolute bottom-4 right-4 bg-slate-900/95 border border-slate-800 rounded-lg p-3 z-[1000]">
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            <span className="text-slate-400">Active</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                            <span className="text-slate-400">Claimed</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
