import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getDonations, claimDonation, type Donation } from '../../services/api'
import { Clock, Shield, AlertTriangle } from 'lucide-react'

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
const urgentIcon = createIcon('#ef4444')

export default function DiscoveryMap() {
    const [filter, setFilter] = useState<'all' | 'ACTIVE' | 'CLAIMED'>('all')
    const [donations, setDonations] = useState<Donation[]>([])
    const [loading, setLoading] = useState(true)
    const [claiming, setClaiming] = useState<string | null>(null)

    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const userRole = user.role || 'donor'
    const canClaim = userRole === 'ngo' || userRole === 'volunteer'

    useEffect(() => {
        loadDonations()
    }, [])

    const loadDonations = async () => {
        setLoading(true)
        try {
            const data = await getDonations()
            setDonations(data)
        } finally {
            setLoading(false)
        }
    }

    const handleClaim = async (donationId: string) => {
        if (!canClaim) return

        setClaiming(donationId)
        try {
            await claimDonation(donationId, user.id)
            await loadDonations()
        } catch (error: any) {
            alert(error.message || 'Failed to claim donation')
        } finally {
            setClaiming(null)
        }
    }

    const filtered = filter === 'all' 
        ? donations 
        : donations.filter(d => d.status === filter)

    const getTimeRemaining = (expiryTime: Date) => {
        const now = new Date()
        const remaining = new Date(expiryTime).getTime() - now.getTime()
        const hours = Math.floor(remaining / (1000 * 60 * 60))
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
        
        if (hours < 1) return { text: `${minutes}m`, urgent: true }
        if (hours < 3) return { text: `${hours}h ${minutes}m`, urgent: true }
        return { text: `${hours}h`, urgent: false }
    }

    const getMarkerIcon = (donation: Donation) => {
        if (donation.status === 'CLAIMED') return claimedIcon
        
        const timeRemaining = getTimeRemaining(donation.expiryTime)
        if (timeRemaining.urgent) return urgentIcon
        
        return activeIcon
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col -m-8">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950">
                <div className="flex items-center justify-between mb-3">
                    <h1 className="text-lg font-semibold text-white">Discovery Map</h1>
                    <div className="flex gap-2">
                        {(['all', 'ACTIVE', 'CLAIMED'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                                    filter === f 
                                        ? 'bg-emerald-500 text-white' 
                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                            >
                                {f === 'ACTIVE' ? 'Available' : f.toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-slate-400">
                            {donations.filter(d => d.status === 'ACTIVE' && !getTimeRemaining(d.expiryTime).urgent).length} Available
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-slate-400">
                            {donations.filter(d => d.status === 'ACTIVE' && getTimeRemaining(d.expiryTime).urgent).length} Urgent
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="text-slate-400">
                            {donations.filter(d => d.status === 'CLAIMED').length} Claimed
                        </span>
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="flex-1 relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
                        <p className="text-slate-500">Loading donations...</p>
                    </div>
                ) : (
                    <MapContainer
                        center={[28.6139, 77.2090]}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; OpenStreetMap'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {filtered.map((donation) => (
                            <Marker
                                key={donation.id}
                                position={[donation.location.lat, donation.location.lng]}
                                icon={getMarkerIcon(donation)}
                            >
                                <Popup>
                                    <div className="p-3 min-w-[220px]">
                                        {/* Food Info */}
                                        <div className="mb-3">
                                            <p className="font-semibold text-white mb-1">
                                                {donation.name}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {donation.quantity} {donation.unit}
                                            </p>
                                            {donation.description && (
                                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                    {donation.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Donor Info */}
                                        <div className="mb-3 pb-3 border-b border-slate-800">
                                            <p className="text-xs text-slate-400 mb-1">
                                                Donor: {donation.donorName}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-3 h-3 text-emerald-400" />
                                                <span className="text-xs text-emerald-400">
                                                    Trust: {donation.donorTrustScore.toFixed(1)}/5.0
                                                </span>
                                            </div>
                                        </div>

                                        {/* Time & Safety */}
                                        {donation.status === 'ACTIVE' && (
                                            <div className="mb-3">
                                                <div className={`flex items-center gap-2 p-2 rounded ${
                                                    getTimeRemaining(donation.expiryTime).urgent
                                                        ? 'bg-red-500/10'
                                                        : 'bg-emerald-500/10'
                                                }`}>
                                                    {getTimeRemaining(donation.expiryTime).urgent ? (
                                                        <AlertTriangle className="w-3 h-3 text-red-400" />
                                                    ) : (
                                                        <Clock className="w-3 h-3 text-emerald-400" />
                                                    )}
                                                    <span className={`text-xs font-medium ${
                                                        getTimeRemaining(donation.expiryTime).urgent
                                                            ? 'text-red-400'
                                                            : 'text-emerald-400'
                                                    }`}>
                                                        {getTimeRemaining(donation.expiryTime).text} remaining
                                                    </span>
                                                </div>

                                                <div className="flex gap-1 mt-2">
                                                    {donation.hygiene.keptCovered && (
                                                        <span className="text-xs px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded">
                                                            ✓ Covered
                                                        </span>
                                                    )}
                                                    {donation.hygiene.containerClean && (
                                                        <span className="text-xs px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded">
                                                            ✓ Clean
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize mb-3 ${
                                            donation.status === 'ACTIVE'
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : 'bg-amber-500/20 text-amber-400'
                                        }`}>
                                            {donation.status.toLowerCase()}
                                        </span>

                                        {/* Action Buttons */}
                                        {donation.status === 'ACTIVE' && canClaim && (
                                            <button
                                                onClick={() => handleClaim(donation.id)}
                                                disabled={claiming === donation.id}
                                                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-white text-xs rounded font-medium transition-colors"
                                            >
                                                {claiming === donation.id ? 'Claiming...' : 'Claim Food'}
                                            </button>
                                        )}
                                        
                                        {donation.status === 'ACTIVE' && !canClaim && (
                                            <p className="text-xs text-slate-500 text-center">
                                                Only NGOs and volunteers can claim
                                            </p>
                                        )}

                                        {donation.status === 'CLAIMED' && donation.claimedBy === user.id && (
                                            <div className="text-xs text-slate-400 text-center">
                                                You claimed this food
                                            </div>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}

                {/* Legend */}
                <div className="absolute bottom-4 right-4 bg-slate-900/95 border border-slate-800 rounded-lg p-3 z-[1000]">
                    <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            <span className="text-slate-400">Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <span className="text-slate-400">Urgent (&lt;3h)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                            <span className="text-slate-400">Claimed</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}