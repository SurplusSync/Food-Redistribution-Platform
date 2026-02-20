import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getDonations, claimDonation, updateDonationStatus, type Donation } from '../../services/api'
import { socketService } from '../../services/socket'
import { Clock, Shield, AlertTriangle, X, Image as ImageIcon, MapPin, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

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
    const [filter, setFilter] = useState<'all' | 'AVAILABLE' | 'CLAIMED'>('all')
    const [donations, setDonations] = useState<Donation[]>([])
    const [loading, setLoading] = useState(true)
    const [claiming, setClaiming] = useState<string | null>(null)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null) // 🔍 State for Modal
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const userRole = (user.role || 'donor').toLowerCase()
    const canClaim = userRole === 'ngo' || userRole === 'volunteer'

    useEffect(() => {
        loadDonations()
        
        // Connect to WebSocket
        socketService.connect()

        // Listen for new donations
        const unsubscribeCreated = socketService.onDonationCreated((data) => {
            toast.success(`🍕 New Food Alert: ${data.foodType} available nearby!`, {
                description: `${data.name} - ${data.location.address}`,
                duration: 5000,
            })
            // Re-fetch donations to show the new pin
            loadDonations()
        })

        // Listen for claimed donations
        const unsubscribeClaimed = socketService.onDonationClaimed((data) => {
            toast.info(`🔔 Food Claimed`, {
                description: `${data.donationId} has been claimed`,
                duration: 3000,
            })
            // Remove the claimed donation from state
            setDonations((prevDonations) =>
                prevDonations.filter((donation) => donation.id !== data.donationId)
            )
            // Close modal if it was for this donation
            if (selectedDonation?.id === data.donationId) {
                setSelectedDonation(null)
                setCurrentImageIndex(0)
            }
        })

        // Cleanup on unmount
        return () => {
            unsubscribeCreated()
            unsubscribeClaimed()
            socketService.disconnect()
        }
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
            await claimDonation(donationId)
            await loadDonations()
            setSelectedDonation(null) // Close modal on success
            setCurrentImageIndex(0)
        } catch (error: any) {
            alert(error.message || 'Failed to claim donation')
        } finally {
            setClaiming(null)
        }
    }

    const handleConfirmPickup = async (donationId: string) => {
        if (processingId) return
        setProcessingId(donationId)
        try {
            await updateDonationStatus(donationId, 'PICKED_UP')
            await loadDonations()
            setSelectedDonation(null)
            setCurrentImageIndex(0)
        } catch (error: any) {
            alert(error.message || 'Failed to confirm pickup')
        } finally {
            setProcessingId(null)
        }
    }

    const handleConfirmDelivery = async (donationId: string) => {
        if (processingId) return
        setProcessingId(donationId)
        try {
            await updateDonationStatus(donationId, 'DELIVERED')
            await loadDonations()
            setSelectedDonation(null)
            setCurrentImageIndex(0)
        } catch (error: any) {
            alert(error.message || 'Failed to confirm delivery')
        } finally {
            setProcessingId(null)
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
        if (donation.status === 'AVAILABLE') {
            const timeRemaining = getTimeRemaining(donation.expiryTime)
            if (timeRemaining.urgent) return urgentIcon
        }
        return activeIcon
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col -m-8 relative">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950">
                <div className="flex items-center justify-between mb-3">
                    <h1 className="text-lg font-semibold text-white">Discovery Map</h1>
                    <div className="flex gap-2">
                        {(['all', 'AVAILABLE', 'CLAIMED'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                                    filter === f 
                                        ? 'bg-emerald-500 text-white' 
                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                            >
                                {f === 'AVAILABLE' ? 'Available' : f.toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="flex-1 relative z-0">
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
                                    <div className="p-2 min-w-[200px]">
                                        <div className="mb-2">
                                            <p className="font-semibold text-white mb-0.5">{donation.name}</p>
                                            <p className="text-xs text-slate-400">{donation.quantity} {donation.unit} • {donation.foodType}</p>
                                        </div>
                                        
                                        {/* Status Badge */}
                                        <div className="mb-3 flex items-center gap-2">
                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium capitalize ${
                                                donation.status === 'AVAILABLE'
                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                    : 'bg-amber-500/20 text-amber-400'
                                            }`}>
                                                {donation.status === 'AVAILABLE' ? 'available' : donation.status.toLowerCase()}
                                            </span>
                                            {donation.status === 'AVAILABLE' && (
                                                <span className={`text-[10px] font-medium ${
                                                    getTimeRemaining(donation.expiryTime).urgent ? 'text-red-400' : 'text-emerald-400'
                                                }`}>
                                                    {getTimeRemaining(donation.expiryTime).text} left
                                                </span>
                                            )}
                                        </div>

                                        {/* View Details Button - Triggers Modal */}
                                        <button
                                            onClick={() => setSelectedDonation(donation)}
                                            className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded font-medium transition-colors border border-slate-700"
                                        >
                                            View Details & Image
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}
            </div>

            {/* 🔍 DETAIL MODAL */}
            {selectedDonation && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row">
                        
                        {/* LEFT: Image Section */}
                        <div className="w-full md:w-1/2 bg-slate-950 h-64 md:h-auto relative group">
                            {selectedDonation.imageUrls && selectedDonation.imageUrls.length > 0 ? (
                                <>
                                    <img 
                                        src={selectedDonation.imageUrls[currentImageIndex]} 
                                        alt={selectedDonation.name} 
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Image Counter */}
                                    <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                                        {currentImageIndex + 1} / {selectedDonation.imageUrls.length}
                                    </div>
                                    {/* Navigation Buttons */}
                                    {selectedDonation.imageUrls.length > 1 && (
                                        <>
                                            <button
                                                onClick={() => setCurrentImageIndex((prev) => (prev - 1 + selectedDonation.imageUrls.length) % selectedDonation.imageUrls.length)}
                                                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => setCurrentImageIndex((prev) => (prev + 1) % selectedDonation.imageUrls.length)}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                                    <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                                    <span className="text-sm">No image uploaded</span>
                                </div>
                            )}
                            
                            {/* Urgent Badge Overlay */}
                            {selectedDonation.status === 'AVAILABLE' && getTimeRemaining(selectedDonation.expiryTime).urgent && (
                                <div className="absolute top-4 left-4 bg-red-500 text-white text-xs px-2 py-1 rounded-md font-medium flex items-center gap-1 shadow-lg">
                                    <AlertTriangle className="w-3 h-3" />
                                    Urgent: Expiring Soon
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Details Section */}
                        <div className="w-full md:w-1/2 p-6 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-1">{selectedDonation.name}</h2>
                                    <p className="text-emerald-400 font-medium">{selectedDonation.quantity} {selectedDonation.unit} • {selectedDonation.foodType}</p>
                                </div>
                                <button onClick={() => { setSelectedDonation(null); setCurrentImageIndex(0); }} className="p-1 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
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
                                            <span>Trust: {selectedDonation.donorTrustScore.toFixed(1)}</span>
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
                                        {selectedDonation.hygiene.keptCovered ? (
                                            <span className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">
                                                <CheckCircle2 className="w-3 h-3" /> Kept Covered
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20">
                                                <X className="w-3 h-3" /> Not Covered
                                            </span>
                                        )}
                                        {selectedDonation.hygiene.containerClean ? (
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
                                    canClaim ? (
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
                                        <div className="text-center p-3 bg-slate-800 rounded-lg text-slate-400 text-sm">
                                            Log in as NGO or Volunteer to claim
                                        </div>
                                    )
                                ) : (
                                    // If already claimed, show volunteer actions when appropriate
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
                                            <div className="text-center p-3 bg-amber-500/10 text-amber-400 rounded-lg font-medium border border-amber-500/20">Already Claimed</div>
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