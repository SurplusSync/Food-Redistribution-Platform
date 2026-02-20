import { useState, useEffect } from 'react'
import { getDonations } from '../../services/api'
import type { Donation } from '../../services/api'

export default function History() {
    const [donations, setDonations] = useState<Donation[]>([])
    const [filter, setFilter] = useState<'all' | 'AVAILABLE' | 'CLAIMED' | 'DELIVERED'>('all')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const data = await getDonations()
                setDonations(data)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const filtered = filter === 'all' ? donations : donations.filter(d => d.status === filter)

    const getStatusStyle = (status: string) => {
        const styles: Record<string, string> = {
            AVAILABLE: 'bg-emerald-500/10 text-emerald-400',
            CLAIMED: 'bg-amber-500/10 text-amber-400',
            DELIVERED: 'bg-slate-500/10 text-slate-400',
        }
        return styles[status] || styles.AVAILABLE
    }

    const counts = {
        all: donations.length,
        AVAILABLE: donations.filter(d => d.status === 'AVAILABLE').length,
        CLAIMED: donations.filter(d => d.status === 'CLAIMED').length,
        DELIVERED: donations.filter(d => d.status === 'DELIVERED').length,
    }

    return (
        <div>
            <h1 className="text-2xl font-semibold text-white mb-1">History</h1>
            <p className="text-slate-500 mb-8">Your past contributions</p>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {Object.entries(counts).map(([key, value]) => (
                    <div key={key} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                        <p className="text-2xl font-semibold text-white">{value}</p>
                        <p className="text-sm text-slate-500 capitalize">{key === 'all' ? 'Total' : key.toLowerCase()}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                {(['all', 'AVAILABLE', 'CLAIMED', 'DELIVERED'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${filter === status
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-900 text-slate-400 hover:text-white'
                            }`}
                    >
                        {status === 'all' ? 'All' : status.toLowerCase()}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No donations found</div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-800">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Item</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Quantity</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filtered.map((d) => (
                                <tr key={d.id} className="hover:bg-slate-800/30">
                                    <td className="py-3 px-4 text-white">{d.name}</td>
                                    <td className="py-3 px-4 text-slate-400">{d.quantity}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusStyle(d.status)}`}>
                                            {d.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
