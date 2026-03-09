import { useMemo, useState } from 'react'
import { AlertTriangle, Clock4, Filter } from 'lucide-react'

type AlertRow = {
  id: string
  food: string
  donor: string
  expiresInMinutes: number
  quantity: string
}

const seedAlerts: AlertRow[] = [
  { id: 'AL-11', food: 'Cooked Rice Meal', donor: 'Community Kitchen A', expiresInMinutes: 85, quantity: '20 boxes' },
  { id: 'AL-12', food: 'Bread Packets', donor: 'BakeHub', expiresInMinutes: 45, quantity: '15 packs' },
  { id: 'AL-13', food: 'Fruit Mix', donor: 'Green Basket', expiresInMinutes: 130, quantity: '10 kg' },
]

export default function NearExpiryAlerts() {
  const [items, setItems] = useState(seedAlerts)
  const [urgency, setUrgency] = useState<'all' | 'critical' | 'warning'>('all')

  const filtered = useMemo(() => {
    return items
      .filter((item) => {
        if (urgency === 'all') return true
        if (urgency === 'critical') return item.expiresInMinutes <= 60
        return item.expiresInMinutes > 60
      })
      .sort((a, b) => a.expiresInMinutes - b.expiresInMinutes)
  }, [items, urgency])

  const markHandled = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Near-Expiry Alerts</h1>
        <p className="text-slate-400 mt-1">Prioritize food at risk of expiry with urgency-first triage actions.</p>
      </div>

      <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-300">
          <Filter className="w-4 h-4 text-emerald-400" />
          Urgency Filter
        </div>
        <div className="flex gap-2">
          {(['all', 'critical', 'warning'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setUrgency(f)}
              className={`px-3 py-1.5 rounded-md text-sm capitalize ${urgency === f ? 'bg-emerald-500 text-white' : 'bg-slate-900 border border-slate-800 text-slate-300'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((alert) => {
          const critical = alert.expiresInMinutes <= 60
          return (
            <div key={alert.id} className={`card p-4 border ${critical ? 'border-red-500/40' : 'border-amber-500/30'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-white font-medium flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${critical ? 'text-red-400' : 'text-amber-400'}`} />
                    {alert.food}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">{alert.quantity} • {alert.donor}</p>
                </div>
                <span className={`badge ${critical ? 'badge-danger' : 'badge-warning'} flex items-center gap-1`}>
                  <Clock4 className="w-3 h-3" />
                  {alert.expiresInMinutes} min
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <button type="button" className="btn-primary py-2 px-3 text-sm">Donate Now</button>
                <button type="button" onClick={() => markHandled(alert.id)} className="btn-secondary py-2 px-3 text-sm">Mark Handled</button>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && <div className="card p-8 text-center text-slate-500">No near-expiry alerts in this filter.</div>}
      </div>
    </div>
  )
}
