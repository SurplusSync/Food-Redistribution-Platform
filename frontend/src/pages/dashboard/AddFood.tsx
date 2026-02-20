import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { createDonation, type FoodType } from '../../services/api'
import { AlertTriangle, Clock, CheckCircle2, Upload } from 'lucide-react'

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
    const [error, setError] = useState<string | null>(null)
    const [images, setImages] = useState<File[]>([]) // NEW: Image State
    
    const [formData, setFormData] = useState({
        foodType: '' as FoodType | '',
        foodName: '',
        quantity: '',
        unit: 'kg',
        description: '',
        keptCovered: false,
        containerClean: false,
        preparationTime: '',
    })

    const user = JSON.parse(localStorage.getItem('user') || '{}')

    const foodTypes = [
        { id: 'cooked', label: 'Cooked', expiryHours: 4, icon: '🍛' },
        { id: 'raw', label: 'Raw', expiryHours: 24, icon: '🥬' },
        { id: 'packaged', label: 'Packaged', expiryHours: 720, icon: '📦' },
        { id: 'fruits', label: 'Fruits', expiryHours: 48, icon: '🍎' },
        { id: 'bakery', label: 'Bakery', expiryHours: 24, icon: '🥖' },
        { id: 'dairy', label: 'Dairy', expiryHours: 48, icon: '🥛' },
    ]

    const units = ['kg', 'g', 'pieces', 'servings', 'boxes', 'liters']

    const selectedFoodType = foodTypes.find(f => f.id === formData.foodType)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        const checked = (e.target as HTMLInputElement).checked
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        })
        setError(null)
    }

    // Handle File Selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages(Array.from(e.target.files));
        }
    };

    const getRemainingTime = () => {
        if (!formData.preparationTime || !selectedFoodType) return null
        
        const prepTime = new Date(formData.preparationTime)
        const now = new Date()
        
        // Check if preparation time is in the future
        if (prepTime > now) {
            return { expired: false, futureTime: true, hours: 0, minutes: 0 }
        }
        
        const expiryTime = new Date(prepTime.getTime() + selectedFoodType.expiryHours * 60 * 60 * 1000)
        const remaining = expiryTime.getTime() - now.getTime()
        
        if (remaining <= 0) return { expired: true, futureTime: false, hours: 0, minutes: 0 }
        
        const hours = Math.floor(remaining / (1000 * 60 * 60))
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
        
        return { expired: false, futureTime: false, hours, minutes }
    }

    const timeStatus = getRemainingTime()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        // Check if time is in the future
        if (timeStatus?.futureTime) {
            setError('Preparation time cannot be in the future')
            return
        }

        // Validate time safety
        if (timeStatus?.expired) {
            setError(`This ${formData.foodType} food has exceeded the safe consumption window of ${selectedFoodType?.expiryHours} hours`)
            return
        }

        if (!location) {
            setError('Please select a pickup location on the map')
            return
        }

        const donorId = String(user?.id ?? '').trim()
        const donorName = String(user?.organizationName ?? user?.name ?? '').trim()

        if (!donorId || !donorName) {
            setError('Missing donor information. Please sign in again.')
            return
        }

        setIsSubmitting(true)

        try {
            // Calculate expiry time based on preparation time and food type
            const prepTime = new Date(formData.preparationTime);
            const expiryTime = new Date(prepTime.getTime() + (selectedFoodType!.expiryHours * 60 * 60 * 1000));
            
            // Correctly constructing the payload and passing images
            const payload = {
                name: formData.foodName,
                foodType: formData.foodType as FoodType,
                quantity: formData.quantity,
                unit: formData.unit,
                description: formData.description,
                donorId,
                donorName,
                donorTrustScore: user.trustScore || 0,
                location,
                hygiene: {
                    keptCovered: formData.keptCovered,
                    containerClean: formData.containerClean,
                },
                preparationTime: new Date(formData.preparationTime),
                expiryTime: expiryTime,
            };

            // Call API with payload and images
            await createDonation(payload, images);

            navigate('/dashboard')
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || err.message || 'Failed to create donation')
        } finally {
            setIsSubmitting(false)
        }
    }

    const hygieneComplete = formData.keptCovered && formData.containerClean
    const isFormValid = 
        hygieneComplete && 
        formData.foodType && 
        formData.foodName && 
        formData.preparationTime &&
        location &&
        timeStatus &&
        !timeStatus.expired &&
        !timeStatus.futureTime

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold text-white mb-1">Add Food Donation</h1>
            <p className="text-slate-500 mb-8">Share surplus food with those in need</p>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-400">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Food Type */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <label className="block text-sm text-slate-400 mb-3">Food Type</label>
                    <div className="grid grid-cols-3 gap-2">
                        {foodTypes.map((type) => (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, foodType: type.id as FoodType })}
                                className={`py-3 rounded-lg text-sm font-medium transition-all ${
                                    formData.foodType === type.id
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
                                }`}
                            >
                                <div className="text-lg mb-1">{type.icon}</div>
                                {type.label}
                            </button>
                        ))}
                    </div>
                    {selectedFoodType && (
                        <div className="mt-3 p-3 bg-slate-800 rounded-lg">
                            <p className="text-xs text-slate-400">
                                <Clock className="w-3 h-3 inline mr-1" />
                                Safe consumption window: <span className="text-emerald-400 font-medium">{selectedFoodType.expiryHours} hours</span> from preparation
                            </p>
                        </div>
                    )}
                </div>

                {/* Preparation Time */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <label className="block text-sm text-slate-400 mb-2">When was this food prepared?</label>
                    <input
                        type="datetime-local"
                        name="preparationTime"
                        value={formData.preparationTime}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                    />
                    {timeStatus?.futureTime && formData.preparationTime && (
                        <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                            <p className="text-sm text-amber-400">
                                Preparation time cannot be in the future
                            </p>
                        </div>
                    )}
                    {timeStatus && !timeStatus.expired && !timeStatus.futureTime && formData.preparationTime && (
                        <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <p className="text-sm text-emerald-400">
                                Safe for <span className="font-semibold">{timeStatus.hours}h {timeStatus.minutes}m</span> more
                            </p>
                        </div>
                    )}
                    {timeStatus?.expired && (
                        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            <p className="text-sm text-red-400">
                                This food has exceeded safe consumption limits
                            </p>
                        </div>
                    )}
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
                            placeholder="e.g., Vegetable Biryani"
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
                                min="0.1"
                                step="0.1"
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
                            placeholder="Any additional details (ingredients, dietary info, special instructions)..."
                            rows={3}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none resize-none"
                        />
                    </div>

                    {/*Image Upload Section */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Food Images (Optional)</label>
                        <div className="relative">
                            <input 
                                type="file" 
                                multiple 
                                accept="image/*"
                                onChange={handleImageChange}
                                className="block w-full text-sm text-slate-400
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-emerald-500 file:text-white
                                hover:file:bg-emerald-600
                                cursor-pointer bg-slate-950 rounded-lg border border-slate-800"
                            />
                            <div className="absolute right-3 top-2 pointer-events-none">
                                <Upload className="w-5 h-5 text-slate-500" />
                            </div>
                        </div>
                        {images.length > 0 && (
                            <p className="text-xs text-emerald-400 mt-2">
                                {images.length} file(s) selected
                            </p>
                        )}
                    </div>
                </div>

                {/* Location Picker */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-sm text-slate-400">Pickup Location</label>
                        {location ? (
                            <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                                ✓ Selected
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
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                            hygieneComplete ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                            {hygieneComplete ? '✓ Complete' : 'Required'}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            formData.keptCovered 
                                ? 'border-emerald-500 bg-emerald-500/5' 
                                : 'border-slate-800 hover:border-slate-700'
                        }`}>
                            <input
                                type="checkbox"
                                name="keptCovered"
                                checked={formData.keptCovered}
                                onChange={handleChange}
                                className="w-4 h-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
                            />
                            <span className="text-sm text-slate-300">Food was kept covered at all times</span>
                        </label>

                        <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            formData.containerClean 
                                ? 'border-emerald-500 bg-emerald-500/5' 
                                : 'border-slate-800 hover:border-slate-700'
                        }`}>
                            <input
                                type="checkbox"
                                name="containerClean"
                                checked={formData.containerClean}
                                onChange={handleChange}
                                className="w-4 h-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
                            />
                            <span className="text-sm text-slate-300">Container is clean and food-safe</span>
                        </label>
                    </div>

                    <div className="mt-4 p-3 bg-slate-800 rounded-lg">
                        <p className="text-xs text-slate-400">
                            ℹ️ Both hygiene requirements must be met to ensure food safety
                        </p>
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isSubmitting || !isFormValid}
                    className={`w-full py-3 rounded-lg font-medium transition-all ${
                        isSubmitting || !isFormValid
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                    }`}
                >
                    {isSubmitting ? 'Creating Donation...' : 'Add Food Donation'}
                </button>
            </form>
        </div>
    )
}