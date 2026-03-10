import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Star, MessageCircle, Loader2, AlertCircle, TrendingUp } from 'lucide-react'
import { getDonations, createFeedback, getFeedbackForDonation, getDonorAverageRating, type Donation, type FeedbackItem } from '../../services/api'

export default function FeedbackRatings() {
  const [deliveredDonations, setDeliveredDonations] = useState<Donation[]>([])
  const [selectedDonationId, setSelectedDonationId] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviews, setReviews] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [donorRating, setDonorRating] = useState<{ averageScore: number; totalReviews: number } | null>(null)

  const user = JSON.parse(localStorage.getItem('user') || '{}') as { id?: string; role?: string }
  const isNGO = user.role === 'NGO'
  const isDonor = user.role === 'DONOR'

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const allDonations = await getDonations()
      // Show delivered donations that the current NGO claimed
      const delivered = allDonations.filter((d: Donation) => d.status === 'DELIVERED')
      setDeliveredDonations(delivered)

      // Load feedback for all delivered donations
      const allFeedback: FeedbackItem[] = []
      for (const donation of delivered) {
        try {
          const feedback = await getFeedbackForDonation(donation.id)
          allFeedback.push(...feedback)
        } catch {
          // donation may not have feedback yet
        }
      }
      setReviews(allFeedback)

      // For donors, fetch their average rating
      if (isDonor && user.id) {
        try {
          const avg = await getDonorAverageRating(user.id)
          setDonorRating(avg)
        } catch {
          // No ratings yet
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // Donations that haven't been reviewed yet by this user
  const unreviewedDonations = useMemo(() => {
    const reviewedIds = new Set(reviews.map(r => r.donationId))
    return deliveredDonations.filter(d => !reviewedIds.has(d.id))
  }, [deliveredDonations, reviews])

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0
    const total = reviews.reduce((sum, r) => sum + r.rating, 0)
    return total / reviews.length
  }, [reviews])

  const submitReview = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedDonationId) return
    setSubmitting(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const newFeedback = await createFeedback({
        donationId: selectedDonationId,
        rating,
        comment: comment.trim() || undefined,
      })
      setReviews(prev => [newFeedback, ...prev])
      setComment('')
      setRating(5)
      setSelectedDonationId('')
      setSuccessMsg('Feedback submitted successfully!')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">NGO Feedback & Ratings</h1>
        <p className="text-slate-400 mt-1">Post-delivery feedback to track food quality and donor reliability.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <p className="text-emerald-400 text-sm">{successMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Donor Rating Summary */}
        {isDonor && donorRating && (
          <div className="xl:col-span-3 card p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Your Donor Rating</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-3xl font-bold text-white">{donorRating.averageScore.toFixed(1)}</span>
                  <span className="text-amber-400 text-lg">{'★'.repeat(Math.round(donorRating.averageScore))}{'☆'.repeat(5 - Math.round(donorRating.averageScore))}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Based on {donorRating.totalReviews} review{donorRating.totalReviews !== 1 ? 's' : ''} from NGOs</p>
              </div>
            </div>
          </div>
        )}
        {isNGO && (
          <div className="card p-5 xl:col-span-1">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              Leave Review
            </h2>
            {unreviewedDonations.length === 0 ? (
              <p className="text-slate-400 text-sm">No delivered donations awaiting feedback.</p>
            ) : (
              <form onSubmit={submitReview} className="space-y-3">
                <select
                  className="select-field"
                  value={selectedDonationId}
                  onChange={(e) => setSelectedDonationId(e.target.value)}
                >
                  <option value="">Select a delivered donation</option>
                  {unreviewedDonations.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.donorName || 'Unknown Donor'}
                    </option>
                  ))}
                </select>
                <select className="select-field" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                  <option value={5}>5 stars</option>
                  <option value={4}>4 stars</option>
                  <option value={3}>3 stars</option>
                  <option value={2}>2 stars</option>
                  <option value={1}>1 star</option>
                </select>
                <textarea
                  className="input-field min-h-[100px]"
                  placeholder="Share your experience with this donation"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={!selectedDonationId || submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Rating Summary & Reviews */}
        <div className={`card p-5 space-y-4 ${isNGO ? 'xl:col-span-2' : 'xl:col-span-3'}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">Rating Summary</h2>
            <span className="badge badge-success flex items-center gap-1">
              <Star className="w-3 h-3" />
              {avgRating.toFixed(1)} / 5
            </span>
          </div>

          {reviews.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">No feedback submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-white font-medium">{review.ngo?.name || 'NGO'}</p>
                    <div className="text-amber-400 text-sm">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                  </div>
                  {review.comment && <p className="text-sm text-slate-300 mt-2">{review.comment}</p>}
                  <p className="text-xs text-slate-500 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
