import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface LatLng {
    lat: number
    lng: number
}

function LocationMarker({ position, setPosition }: { position: LatLng | null; setPosition: (pos: LatLng) => void }) {
    useMapEvents({
        click(e) {
            setPosition({ lat: e.latlng.lat, lng: e.latlng.lng })
        },
    })

    return position ? <Marker position={[position.lat, position.lng]} /> : null
}

export default function AddFood() {
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [location, setLocation] = useState<LatLng | null>(null)
    const [formData, setFormData] = useState({
        foodType: '',
        foodName: '',
        quantity: '',
        unit: 'kg',
        description: '',
        keptCovered: false,
        containerClean: false,
    })

    const foodTypes = [
        { id: 'cooked', label: 'Cooked' },
        { id: 'raw', label: 'Raw' },
        { id: 'packaged', label: 'Packaged' },
        { id: 'fruits', label: 'Fruits' },
        { id: 'bakery', label: 'Bakery' },
        { id: 'dairy', label: 'Dairy' },
    ]

    const units = ['kg', 'g', 'pieces', 'servings', 'boxes', 'liters']

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        const checked = (e.target as HTMLInputElement).checked
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate API call
        console.log('Submitting:', { ...formData, location })
        await new Promise(resolve => setTimeout(resolve, 1000))

        navigate('/dashboard')
    }

    const hygieneComplete = formData.keptCovered && formData.containerClean
    const isFormValid = hygieneComplete && formData.foodType && formData.foodName && location

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-semibold text-white mb-1">Add Food</h1>
            <p className="text-slate-500 mb-8">Share surplus food with those in need</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Food Type */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <label className="block text-sm text-slate-400 mb-3">Food Type</label>
                    <div className="grid grid-cols-3 gap-2">
                        {foodTypes.map((type) => (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, foodType: type.id })}
                                className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${formData.foodType === type.id
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                    }`}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Details */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Food Name</label>
                        <input
                            type="text"
                            name="foodName"
                            value={formData.foodName}
                            onChange={handleChange}
                            placeholder="e.g., Rice with Dal"
                            required
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                placeholder="10"
                                min="1"
                                required
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Unit</label>
                            <select
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                            >
                                {units.map((unit) => (
                                    <option key={unit} value={unit}>{unit}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Description (optional)</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Any additional details..."
                            rows={3}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none resize-none"
                        />
                    </div>
                </div>

                {/* Location Picker */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-sm text-slate-400">Pickup Location</label>
                        {location ? (
                            <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                                Selected
                            </span>
                        ) : (
                            <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">
                                Required
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 mb-3">Click on the map to set pickup location</p>
                    <div className="rounded-lg overflow-hidden border border-slate-700" style={{ height: '250px' }}>
                        <MapContainer
                            center={[28.6139, 77.2090]}
                            zoom={12}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                attribution='&copy; OpenStreetMap'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <LocationMarker position={location} setPosition={setLocation} />
                        </MapContainer>
                    </div>
                    {location && (
                        <p className="text-xs text-slate-500 mt-2">
                            📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                        </p>
                    )}
                </div>

                {/* Hygiene Checklist */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-sm text-slate-400">Hygiene Checklist</label>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${hygieneComplete ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                            }`}>
                            {hygieneComplete ? 'Complete' : 'Required'}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${formData.keptCovered ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 hover:border-slate-700'
                            }`}>
                            <input
                                type="checkbox"
                                name="keptCovered"
                                checked={formData.keptCovered}
                                onChange={handleChange}
                                className="w-4 h-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
                            />
                            <span className="text-sm text-slate-300">Food was kept covered</span>
                        </label>

                        <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${formData.containerClean ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 hover:border-slate-700'
                            }`}>
                            <input
                                type="checkbox"
                                name="containerClean"
                                checked={formData.containerClean}
                                onChange={handleChange}
                                className="w-4 h-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
                            />
                            <span className="text-sm text-slate-300">Container is clean</span>
                        </label>
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isSubmitting || !isFormValid}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${isSubmitting || !isFormValid
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-white'
                        }`}
                >
                    {isSubmitting ? 'Submitting...' : 'Add Food'}
                </button>
            </form>
        </div>
    )
}
