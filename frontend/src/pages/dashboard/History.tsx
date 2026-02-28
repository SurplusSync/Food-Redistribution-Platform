import { useState, useEffect, useMemo } from 'react'
import { getDonations } from '../../services/api'
import type { Donation } from '../../services/api'
import { socketService } from '../../services/socket'
import { TrendingUp, BarChart2, Package } from 'lucide-react'

// ─── Inline SVG Bar Chart ─────────────────────────────────────────────────────

interface BarChartProps {
    data: { label: string; value: number; color?: string }[]
    height?: number
    unit?: string
    title: string
    subtitle?: string
    accentColor?: string
}

function BarChart({ data, height = 180, unit = '', title, subtitle, accentColor = '#10b981' }: BarChartProps) {
    const maxVal = Math.max(...data.map(d => d.value), 1)
    const chartWidth = 560
    const chartHeight = height
    const barAreaHeight = chartHeight - 32 // leave room for labels
    const barCount = data.length
    const barWidth = Math.floor((chartWidth - (barCount - 1) * 8) / barCount)
    const gap = 8

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="mb-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <BarChart2 className="w-4 h-4" style={{ color: accentColor }} />
                    {title}
                </h3>
                {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            <div className="overflow-x-auto">
                <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    width="100%"
                    style={{ display: 'block', minWidth: 320 }}
                >
                    {/* Grid lines */}
                    {[0.25, 0.5, 0.75, 1].map((frac) => {
                        const y = barAreaHeight - barAreaHeight * frac
                        return (
                            <g key={frac}>
                                <line x1={0} y1={y} x2={chartWidth} y2={y} stroke="#1e293b" strokeWidth={1} />
                                <text x={0} y={y - 3} fill="#475569" fontSize={9} fontFamily="sans-serif">
                                    {Math.round(maxVal * frac)}{unit}
                                </text>
                            </g>
                        )
                    })}

                    {/* Bars */}
                    {data.map((d, i) => {
                        const barH = d.value > 0 ? Math.max(4, (d.value / maxVal) * barAreaHeight) : 2
                        const x = i * (barWidth + gap)
                        const y = barAreaHeight - barH
                        const barColor = d.color || accentColor

                        return (
                            <g key={i}>
                                {/* Bar shadow */}
                                <rect x={x + 1} y={y + 2} width={barWidth} height={barH} rx={4} fill="#000" opacity={0.3} />
                                {/* Bar */}
                                <rect x={x} y={y} width={barWidth} height={barH} rx={4} fill={barColor} opacity={0.9} />
                                {/* Value label */}
                                {d.value > 0 && (
                                    <text
                                        x={x + barWidth / 2}
                                        y={y - 5}
                                        textAnchor="middle"
                                        fill="#e2e8f0"
                                        fontSize={10}
                                        fontFamily="sans-serif"
                                        fontWeight="600"
                                    >
                                        {d.value}{unit}
                                    </text>
                                )}
                                {/* Month label */}
                                <text
                                    x={x + barWidth / 2}
                                    y={barAreaHeight + 18}
                                    textAnchor="middle"
                                    fill="#64748b"
                                    fontSize={9}
                                    fontFamily="sans-serif"
                                >
                                    {d.label}
                                </text>
                            </g>
                        )
                    })}
                </svg>
            </div>
        </div>
    )
}

// ─── Line/Area Trend Chart ────────────────────────────────────────────────────

interface LineChartProps {
    data: { label: string; value: number }[]
    title: string
    subtitle?: string
    accentColor?: string
}

function LineChart({ data, title, subtitle, accentColor = '#6366f1' }: LineChartProps) {
    const width = 560
    const height = 160
    const padTop = 20
    const padBot = 28
    const padLeft = 30
    const padRight = 10
    const innerW = width - padLeft - padRight
    const innerH = height - padTop - padBot

    const maxVal = Math.max(...data.map(d => d.value), 1)
    const pts = data.map((d, i) => {
        const x = padLeft + (i / Math.max(data.length - 1, 1)) * innerW
        const y = padTop + (1 - d.value / maxVal) * innerH
        return { x, y, ...d }
    })

    const polyline = pts.map(p => `${p.x},${p.y}`).join(' ')
    // Close the area path
    const areaPath = pts.length >= 2
        ? `M${pts[0].x},${padTop + innerH} L${pts.map(p => `${p.x},${p.y}`).join(' L')} L${pts[pts.length - 1].x},${padTop + innerH} Z`
        : ''

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="mb-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" style={{ color: accentColor }} />
                    {title}
                </h3>
                {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            <div className="overflow-x-auto">
                <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: 'block', minWidth: 320 }}>
                    <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={accentColor} stopOpacity="0.35" />
                            <stop offset="100%" stopColor={accentColor} stopOpacity="0.03" />
                        </linearGradient>
                    </defs>
                    {/* Grid */}
                    {[0.25, 0.5, 0.75, 1].map(frac => {
                        const y = padTop + (1 - frac) * innerH
                        return (
                            <g key={frac}>
                                <line x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke="#1e293b" strokeWidth={1} />
                                <text x={padLeft - 4} y={y + 4} fill="#475569" fontSize={9} textAnchor="end" fontFamily="sans-serif">
                                    {Math.round(maxVal * frac)}
                                </text>
                            </g>
                        )
                    })}
                    {/* Area */}
                    {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}
                    {/* Line */}
                    {pts.length >= 2 && (
                        <polyline points={polyline} fill="none" stroke={accentColor} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
                    )}
                    {/* Dots + labels */}
                    {pts.map((p, i) => (
                        <g key={i}>
                            <circle cx={p.x} cy={p.y} r={4} fill={accentColor} stroke="#0f172a" strokeWidth={2} />
                            <text x={p.x} y={height - 10} textAnchor="middle" fill="#64748b" fontSize={9} fontFamily="sans-serif">{p.label}</text>
                            {p.value > 0 && (
                                <text x={p.x} y={p.y - 8} textAnchor="middle" fill="#e2e8f0" fontSize={9} fontFamily="sans-serif" fontWeight="600">{p.value}</text>
                            )}
                        </g>
                    ))}
                </svg>
            </div>
        </div>
    )
}

// ─── Monthly Data Helpers ─────────────────────────────────────────────────────

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const LAST_6_MONTHS = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - 5 + i)
    return { month: d.getMonth(), year: d.getFullYear(), label: MONTH_ABBR[d.getMonth()] }
})

function aggregateByMonth(donations: Donation[], statusFilter?: string) {
    return LAST_6_MONTHS.map(({ month, year, label }) => {
        const count = donations.filter(d => {
            const dt = new Date(d.createdAt)
            return dt.getMonth() === month && dt.getFullYear() === year && (!statusFilter || d.status === statusFilter)
        }).length
        return { label, value: count }
    })
}

// ─── Main History Component ───────────────────────────────────────────────────

const userRole = (): string => {
    try {
        const u = JSON.parse(localStorage.getItem('user') || '{}')
        return String(u.role || '').toLowerCase()
    } catch { return '' }
}

export default function History() {
    const [donations, setDonations] = useState<Donation[]>([])
    const [filter, setFilter] = useState<'all' | 'AVAILABLE' | 'CLAIMED' | 'DELIVERED'>('all')
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState<'table' | 'charts'>('table')

    const role = userRole()
    const isNGO = role === 'ngo'

    const load = async () => {
        setLoading(true)
        try {
            const data = await getDonations()
            setDonations(data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()

        socketService.connect()

        const unsubscribeCreated = socketService.onDonationCreated(() => {
            load()
        })

        const unsubscribeClaimed = socketService.onDonationClaimed(() => {
            load()
        })

        return () => {
            unsubscribeCreated()
            unsubscribeClaimed()
            socketService.disconnect()
        }
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

    // Chart data
    const monthlyAll = useMemo(() => aggregateByMonth(donations), [donations])
    const monthlyDelivered = useMemo(() => aggregateByMonth(donations, 'DELIVERED'), [donations])
    const monthlyClaimed = useMemo(() => aggregateByMonth(donations, 'CLAIMED'), [donations])

    return (
        <div>
            <h1 className="text-2xl font-semibold text-white mb-1">History</h1>
            <p className="text-slate-500 mb-8">Your past contributions</p>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {Object.entries(counts).map(([key, value]) => (
                    <div key={key} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                        <p className="text-2xl font-semibold text-white">{value}</p>
                        <p className="text-sm text-slate-500 capitalize">{key === 'all' ? 'Total' : key.toLowerCase()}</p>
                    </div>
                ))}
            </div>

            {/* Tab Toggle — Charts tab only for NGOs */}
            {isNGO && (
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setTab('table')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'table' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
                    >
                        <Package className="w-4 h-4" />
                        Donation List
                    </button>
                    <button
                        onClick={() => setTab('charts')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'charts' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
                    >
                        <TrendingUp className="w-4 h-4" />
                        Growth Reports
                    </button>
                </div>
            )}

            {/* ── Charts View (NGO only) ── */}
            {isNGO && tab === 'charts' ? (
                <div className="space-y-6">
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-blue-300 font-medium text-sm">Growth Reports</p>
                            <p className="text-slate-400 text-xs mt-0.5">Monthly food intake summaries to support funding applications. Showing the last 6 months of activity.</p>
                        </div>
                    </div>

                    {/* Chart 1 – Total food intake (bar) */}
                    <BarChart
                        title="Monthly Food Intake"
                        subtitle="Total donations received per month"
                        data={monthlyAll}
                        unit=""
                        accentColor="#10b981"
                    />

                    {/* Chart 2 – Deliveries completed (line) */}
                    <LineChart
                        title="Deliveries Completed"
                        subtitle="Successful food deliveries trend"
                        data={monthlyDelivered}
                        accentColor="#6366f1"
                    />

                    {/* Chart 3 – Claims made (bar) */}
                    <BarChart
                        title="Claims Made"
                        subtitle="Donations claimed by your NGO per month"
                        data={monthlyClaimed}
                        unit=""
                        accentColor="#f59e0b"
                    />

                    {/* Summary Card for Funding */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <Package className="w-4 h-4 text-emerald-400" />
                            6-Month Summary
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-center">
                                <p className="text-2xl font-bold text-emerald-400">{monthlyAll.reduce((s, d) => s + d.value, 0)}</p>
                                <p className="text-xs text-slate-400 mt-1">Total Donations Received</p>
                            </div>
                            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 text-center">
                                <p className="text-2xl font-bold text-indigo-400">{monthlyDelivered.reduce((s, d) => s + d.value, 0)}</p>
                                <p className="text-xs text-slate-400 mt-1">Successful Deliveries</p>
                            </div>
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 text-center">
                                <p className="text-2xl font-bold text-amber-400">
                                    {monthlyAll.reduce((s, d) => s + d.value, 0) > 0
                                        ? `${Math.round((monthlyDelivered.reduce((s, d) => s + d.value, 0) / monthlyAll.reduce((s, d) => s + d.value, 1)) * 100)}%`
                                        : '—'}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">Delivery Rate</p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-4 border-t border-slate-800 pt-4">
                            💡 Use this data to demonstrate impact in your funding applications. A high delivery rate signals operational efficiency to grant committees.
                        </p>
                    </div>
                </div>
            ) : (
                /* ── Table View ── */
                <>
                    {/* Filters */}
                    <div className="flex gap-2 mb-6">
                        {(['all', 'AVAILABLE', 'CLAIMED', 'DELIVERED'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${filter === status ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
                            >
                                {status === 'all' ? 'All' : status.toLowerCase()}
                            </button>
                        ))}
                    </div>

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
                </>
            )}
        </div>
    )
}