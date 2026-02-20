import { useEffect, useState } from 'react'
import { getDonations, updateDonationStatus, type Donation } from '../../services/api'
import { CheckCircle2, MapPin, Clock, Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react'

export default function VolunteerDashboard() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const load = async () => {
    setLoading(true)
    try {
      setDonations(await getDonations({ status: ['CLAIMED', 'PICKED_UP'], role: 'volunteer', userId: user.id }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleConfirmPickup = async (id: string) => {
    setProcessingId(id)
    try {
      await updateDonationStatus(id, 'PICKED_UP')
      await load()
    } catch (err: any) {
      alert(err.message || 'Failed to confirm pickup')
    } finally {
      setProcessingId(null)
    }
  }

  const handleConfirmDelivery = async (id: string) => {
    setProcessingId(id)
    try {
      await updateDonationStatus(id, 'DELIVERED')
      await load()
    } catch (err: any) {
      alert(err.message || 'Failed to confirm delivery')
    } finally {
      setProcessingId(null)
    }
  }

  const getTimeRemaining = (expiryTime: Date) => {
    const now = new Date()
    const remaining = new Date(expiryTime).getTime() - now.getTime()
    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    return { hours, minutes, urgent: hours < 3 }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Volunteer Dashboard</h1>
        <p className="text-slate-500 mt-1">Manage pickups and deliveries assigned to you.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-medium text-white">Assigned Tasks</h2>
        </div>

        {loading && (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        )}

        {!loading && donations.length === 0 && (
          <div className="p-8 text-center text-slate-500">No assigned pickups or deliveries.</div>
        )}

        <div className="divide-y divide-slate-800">
          {donations.map((donation) => {
            const timeLeft = getTimeRemaining(donation.expiryTime)
            return (
              <div key={donation.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${donation.status === 'PICKED_UP' ? 'bg-amber-500/10' : 'bg-amber-500/10'}`}>
                      {donation.foodType === 'cooked' && '🍛'}
                      {donation.foodType === 'raw' && '🥬'}
                      {donation.foodType === 'packaged' && '📦'}
                      {donation.foodType === 'fruits' && '🍎'}
                      {donation.foodType === 'bakery' && '🥖'}
                      {donation.foodType === 'dairy' && '🥛'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-white">{donation.name}</p>
                        {timeLeft.urgent && (
                          <span className="text-xs px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeLeft.hours}h {timeLeft.minutes}m
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{donation.quantity} {donation.unit} • {donation.donorName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedDonation(donation)}
                      className="px-3 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700"
                    >
                      View
                    </button>

                    {donation.status === 'CLAIMED' && (
                      <button
                        onClick={() => handleConfirmPickup(donation.id)}
                        disabled={processingId === donation.id}
                        className="px-3 py-1 rounded-md text-xs font-medium bg-emerald-500 hover:bg-emerald-400 text-white transition-colors"
                      >
                        {processingId === donation.id ? 'Processing...' : 'Confirm Pickup'}
                      </button>
                    )}

                    {donation.status === 'PICKED_UP' && (
                      <button
                        onClick={() => handleConfirmDelivery(donation.id)}
                        disabled={processingId === donation.id}
                        className="px-3 py-1 rounded-md text-xs font-medium bg-emerald-500 hover:bg-emerald-400 text-white transition-colors"
                      >
                        {processingId === donation.id ? 'Processing...' : 'Confirm Delivery'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selectedDonation && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start gap-4 p-6">
              <div className="w-40 h-40 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center relative group">
                {selectedDonation.imageUrls && selectedDonation.imageUrls.length > 0 ? (
                  <>
                    <img src={selectedDonation.imageUrls[currentImageIndex]} alt={selectedDonation.name} className="w-full h-full object-cover" />
                    {selectedDonation.imageUrls.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIndex((prev) => (prev - 1 + selectedDonation.imageUrls.length) % selectedDonation.imageUrls.length)}
                          className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex((prev) => (prev + 1) % selectedDonation.imageUrls.length)}
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                          {currentImageIndex + 1}/{selectedDonation.imageUrls.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center text-slate-600">
                    <ImageIcon className="w-10 h-10 mb-2" />
                    <span className="text-sm">No image</span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{selectedDonation.name}</h3>
                    <p className="text-slate-400 text-sm">{selectedDonation.quantity} {selectedDonation.unit} • {selectedDonation.foodType}</p>
                  </div>
                  <button onClick={() => { setSelectedDonation(null); setCurrentImageIndex(0); }} className="p-1 hover:bg-slate-800 rounded-full text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm text-slate-300 mt-4">{selectedDonation.description || 'No additional details.'}</p>

                <div className="mt-4 flex items-center gap-3">
                  {selectedDonation.status === 'CLAIMED' && (
                    <button
                      onClick={() => handleConfirmPickup(selectedDonation.id)}
                      disabled={processingId === selectedDonation.id}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-md"
                    >
                      {processingId === selectedDonation.id ? 'Processing...' : (<><MapPin className="inline w-4 h-4 mr-2"/> Confirm Pickup</>)}
                    </button>
                  )}

                  {selectedDonation.status === 'PICKED_UP' && (
                    <button
                      onClick={() => handleConfirmDelivery(selectedDonation.id)}
                      disabled={processingId === selectedDonation.id}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-md"
                    >
                      {processingId === selectedDonation.id ? 'Processing...' : (<><CheckCircle2 className="inline w-4 h-4 mr-2"/> Confirm Delivery</>)}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
