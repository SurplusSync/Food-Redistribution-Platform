import { useMemo, useState, type FormEvent } from 'react'
import { Star, MessageCircle } from 'lucide-react'

type Review = {
  id: string
  reviewer: string
  ngoName: string
  rating: number
  comment: string
  createdAt: string
}

const initialReviews: Review[] = [
  { id: 'R-21', reviewer: 'Anuj', ngoName: 'Food First NGO', rating: 5, comment: 'Pickup was fast and communication was excellent.', createdAt: '2026-03-05' },
  { id: 'R-22', reviewer: 'Megha', ngoName: 'Seva Care', rating: 4, comment: 'Good coordination, can improve ETA accuracy.', createdAt: '2026-03-03' },
]

export default function FeedbackRatings() {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [ngoName, setNgoName] = useState('Food First NGO')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0
    const total = reviews.reduce((sum, row) => sum + row.rating, 0)
    return total / reviews.length
  }, [reviews])

  const submitReview = (event: FormEvent) => {
    event.preventDefault()
    if (!comment.trim()) return

    const user = JSON.parse(localStorage.getItem('user') || '{}') as { name?: string }
    const newReview: Review = {
      id: `R-${Math.floor(Math.random() * 900 + 100)}`,
      reviewer: user.name || 'Anonymous User',
      ngoName,
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
    }

    setReviews((prev) => [newReview, ...prev])
    setComment('')
    setRating(5)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">NGO Feedback & Ratings</h1>
        <p className="text-slate-400 mt-1">Collect post-delivery feedback and track NGO service quality over time.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card p-5 xl:col-span-1">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            Leave Review
          </h2>
          <form onSubmit={submitReview} className="space-y-3">
            <input className="input-field" value={ngoName} onChange={(e) => setNgoName(e.target.value)} placeholder="NGO name" />
            <select className="select-field" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              <option value={5}>5 stars</option>
              <option value={4}>4 stars</option>
              <option value={3}>3 stars</option>
              <option value={2}>2 stars</option>
              <option value={1}>1 star</option>
            </select>
            <textarea
              className="input-field min-h-[100px]"
              placeholder="Share your delivery experience"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button type="submit" className="btn-primary w-full">Submit Feedback</button>
          </form>
        </div>

        <div className="card p-5 xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">Rating Summary</h2>
            <span className="badge badge-success flex items-center gap-1">
              <Star className="w-3 h-3" />
              {avgRating.toFixed(1)} / 5
            </span>
          </div>

          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-white font-medium">{review.ngoName}</p>
                  <div className="text-amber-400 text-sm">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                </div>
                <p className="text-sm text-slate-300 mt-2">{review.comment}</p>
                <p className="text-xs text-slate-500 mt-2">By {review.reviewer} on {review.createdAt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
