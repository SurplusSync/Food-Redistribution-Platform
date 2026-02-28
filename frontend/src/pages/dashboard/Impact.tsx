import { useEffect, useState, useRef, useMemo } from 'react'
import {
    getUserProfile, getCommunityStats, getMonthlyStats,
    type User, type CommunityStats, type MonthlyStatPoint
} from '../../services/api'
import {
    Trophy, TrendingUp, Share2, Package, Users,
    Award, Download, Leaf, Droplets, Globe
} from 'lucide-react'

// ─── BADGE CATALOG (mirrors backend BADGE_RULES exactly) ─────────────────────

const BADGE_CATALOG = [
    { threshold: 10, name: 'Newcomer', icon: '🌱', description: 'Earned first 10 karma points' },
    { threshold: 50, name: 'Local Hero', icon: '🦸', description: 'Reached 50 karma points' },
    { threshold: 150, name: 'Champion', icon: '🏆', description: 'Reached 150 karma points' },
    { threshold: 300, name: 'Legend', icon: '⭐', description: 'Reached 300 karma points' },
    { threshold: 500, name: 'Superhero', icon: '💫', description: 'Reached 500 karma points' },
]

// ─── INLINE SVG BAR CHART ─────────────────────────────────────────────────────

function SvgBarChart({
    data, title, subtitle, color = '#10b981',
}: {
    data: { label: string; value: number }[]
    title: string
    subtitle?: string
    color?: string
}) {
    const W = 560, H = 180, BAR_AREA = 148
    const max = Math.max(...data.map(d => d.value), 1)
    const n = data.length
    const barW = Math.floor((W - (n - 1) * 6) / n)

    return (
        <div>
            <p className="text-sm font-semibold text-white mb-0.5">{title}</p>
            {subtitle && <p className="text-xs text-slate-500 mb-3">{subtitle}</p>}
            <div className="overflow-x-auto">
                <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 280 }}>
                    {[0.25, 0.5, 0.75, 1].map(f => {
                        const y = BAR_AREA - BAR_AREA * f
                        return (
                            <g key={f}>
                                <line x1={0} y1={y} x2={W} y2={y} stroke="#1e293b" strokeWidth={1} />
                                <text x={0} y={y - 3} fill="#475569" fontSize={8} fontFamily="sans-serif">
                                    {Math.round(max * f)}
                                </text>
                            </g>
                        )
                    })}
                    {data.map((d, i) => {
                        const barH = d.value > 0 ? Math.max(4, (d.value / max) * BAR_AREA) : 2
                        const x = i * (barW + 6)
                        const y = BAR_AREA - barH
                        return (
                            <g key={i}>
                                <rect x={x + 1} y={y + 2} width={barW} height={barH} rx={3} fill="#000" opacity={0.25} />
                                <rect x={x} y={y} width={barW} height={barH} rx={3} fill={color} opacity={0.9} />
                                {d.value > 0 && (
                                    <text x={x + barW / 2} y={y - 4} textAnchor="middle" fill="#e2e8f0" fontSize={9} fontFamily="sans-serif" fontWeight="600">
                                        {d.value}
                                    </text>
                                )}
                                <text x={x + barW / 2} y={BAR_AREA + 16} textAnchor="middle" fill="#64748b" fontSize={8} fontFamily="sans-serif">
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

function SvgLineChart({
    data, title, subtitle, color = '#6366f1',
}: {
    data: { label: string; value: number }[]
    title: string
    subtitle?: string
    color?: string
}) {
    const W = 560, H = 150, PT = 16, PB = 24, PL = 28, PR = 8
    const iW = W - PL - PR, iH = H - PT - PB
    const max = Math.max(...data.map(d => d.value), 1)
    const pts = data.map((d, i) => ({
        x: PL + (i / Math.max(data.length - 1, 1)) * iW,
        y: PT + (1 - d.value / max) * iH,
        ...d,
    }))
    const line = pts.map(p => `${p.x},${p.y}`).join(' ')
    const area = pts.length >= 2
        ? `M${pts[0].x},${PT + iH} L${pts.map(p => `${p.x},${p.y}`).join(' L')} L${pts[pts.length - 1].x},${PT + iH} Z`
        : ''

    return (
        <div>
            <p className="text-sm font-semibold text-white mb-0.5">{title}</p>
            {subtitle && <p className="text-xs text-slate-500 mb-3">{subtitle}</p>}
            <div className="overflow-x-auto">
                <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 280 }}>
                    <defs>
                        <linearGradient id={`lg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                        </linearGradient>
                    </defs>
                    {[0.25, 0.5, 0.75, 1].map(f => {
                        const y = PT + (1 - f) * iH
                        return (
                            <g key={f}>
                                <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="#1e293b" strokeWidth={1} />
                                <text x={PL - 3} y={y + 3} fill="#475569" fontSize={8} textAnchor="end" fontFamily="sans-serif">
                                    {Math.round(max * f)}
                                </text>
                            </g>
                        )
                    })}
                    {area && <path d={area} fill={`url(#lg-${color.replace('#', '')})`} />}
                    {pts.length >= 2 && <polyline points={line} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />}
                    {pts.map((p, i) => (
                        <g key={i}>
                            <circle cx={p.x} cy={p.y} r={4} fill={color} stroke="#0f172a" strokeWidth={2} />
                            <text x={p.x} y={H - 6} textAnchor="middle" fill="#64748b" fontSize={8} fontFamily="sans-serif">{p.label}</text>
                            {p.value > 0 && (
                                <text x={p.x} y={p.y - 7} textAnchor="middle" fill="#e2e8f0" fontSize={8} fontFamily="sans-serif" fontWeight="600">{p.value}</text>
                            )}
                        </g>
                    ))}
                </svg>
            </div>
        </div>
    )
}

// ─── CERTIFICATE MODAL ────────────────────────────────────────────────────────

function CertificateModal({ user, role, onClose }: { user: User; role: string; onClose: () => void }) {
    const ref = useRef<HTMLDivElement>(null)
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    const stats = user.impactStats || { totalDonations: 0, mealsProvided: 0, kgSaved: 0 }
    const karma = user.karmaPoints ?? 0
    const level = user.level ?? 1
    const orgName = user.organizationName || user.name

    const isNGO = role === 'ngo'
    const isVolunteer = role === 'volunteer'

    const accentColor = isNGO ? '#2563eb' : isVolunteer ? '#7c3aed' : '#059669'
    const lightBg = isNGO ? '#eff6ff' : isVolunteer ? '#f5f3ff' : '#f0fdf4'
    const lightBorder = isNGO ? '#bfdbfe' : isVolunteer ? '#ddd6fe' : '#d1fae5'

    const roleLabel = isNGO ? 'NGO Partner' : isVolunteer ? 'Volunteer' : 'Food Donor'
    const actionText = isNGO ? 'food collections and community service' : isVolunteer ? 'food delivery and community service' : 'food donations and sustainability efforts'

    const stat1 = { value: stats.totalDonations, label: isNGO ? 'Collections' : isVolunteer ? 'Deliveries' : 'Donations' }
    const stat2 = { value: stats.mealsProvided, label: 'Meals Provided' }
    const stat3 = { value: `${stats.kgSaved} kg`, label: 'Food Rescued' }

    const handlePrint = () => {
        const html = ref.current?.innerHTML
        if (!html) return
        const pw = window.open('', '_blank', 'width=900,height=700')
        if (!pw) return
        pw.document.write(`<!DOCTYPE html><html><head>
      <title>Certificate – ${orgName}</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:Georgia,serif;background:${lightBg};display:flex;align-items:center;justify-content:center;min-height:100vh;padding:32px}
        .cert{background:#fff;border:3px solid ${accentColor};border-radius:16px;padding:52px;max-width:740px;width:100%;position:relative;box-shadow:0 0 0 7px ${lightBorder},0 0 0 11px ${accentColor}}
        .c{position:absolute;width:52px;height:52px}
        .tl{top:12px;left:12px;border-top:4px solid ${accentColor};border-left:4px solid ${accentColor};border-radius:7px 0 0 0}
        .tr{top:12px;right:12px;border-top:4px solid ${accentColor};border-right:4px solid ${accentColor};border-radius:0 7px 0 0}
        .bl{bottom:12px;left:12px;border-bottom:4px solid ${accentColor};border-left:4px solid ${accentColor};border-radius:0 0 0 7px}
        .br{bottom:12px;right:12px;border-bottom:4px solid ${accentColor};border-right:4px solid ${accentColor};border-radius:0 0 7px 0}
        .tc{text-align:center}
        .seal{font-size:52px;margin-bottom:8px}
        .platform{font-size:9px;letter-spacing:4px;color:${accentColor};text-transform:uppercase;font-family:sans-serif;margin-bottom:12px}
        h1{font-size:34px;color:#0f172a;margin-bottom:4px}
        .sub{font-size:10px;letter-spacing:3px;color:#94a3b8;text-transform:uppercase;font-family:sans-serif;margin-bottom:24px}
        .div{width:72px;height:3px;background:linear-gradient(90deg,transparent,${accentColor},transparent);margin:0 auto 24px}
        .body{font-size:15px;color:#334155;line-height:1.9;margin-bottom:20px}
        .recip{font-size:27px;font-style:italic;font-weight:bold;color:#0f172a;display:block;margin:4px 0}
        .rlabel{display:inline-block;background:${accentColor};color:#fff;border-radius:12px;padding:3px 14px;font-size:11px;font-family:sans-serif;margin-bottom:16px}
        .stats{display:flex;justify-content:center;gap:36px;margin:20px 0 28px}
        .sn{font-size:26px;font-weight:bold;color:${accentColor};font-family:sans-serif}
        .sl{font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-family:sans-serif}
        .kb{display:inline-block;background:linear-gradient(135deg,${accentColor},${accentColor}cc);color:#fff;border-radius:20px;padding:5px 16px;font-size:11px;font-family:sans-serif}
        .footer{display:flex;justify-content:space-between;align-items:flex-end;margin-top:28px;padding-top:18px;border-top:1px solid ${lightBorder}}
        .sl2{width:150px;border-bottom:1px solid #d1d5db;margin-bottom:5px}
        .sn2{font-size:10px;color:#6b7280;font-family:sans-serif}
      </style>
    </head><body><div class="cert">
      <div class="c tl"></div><div class="c tr"></div><div class="c bl"></div><div class="c br"></div>
      ${html}
    </div></body></html>`)
        pw.document.close()
        setTimeout(() => { pw.print(); pw.close() }, 500)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-auto max-h-[92vh]">
                {/* Toolbar */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
                    <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                        <Award className="w-5 h-5 text-emerald-600" />
                        Certificate of Appreciation
                    </h3>
                    <div className="flex gap-2">
                        <button onClick={handlePrint}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            <Download className="w-4 h-4" />Print / Save PDF
                        </button>
                        <button onClick={onClose}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            Close
                        </button>
                    </div>
                </div>

                {/* Certificate preview */}
                <div className="p-7" style={{ background: lightBg }}>
                    <div ref={ref} className="relative bg-white rounded-2xl p-10 text-center"
                        style={{ border: `3px solid ${accentColor}`, boxShadow: `0 0 0 7px ${lightBorder}, 0 0 0 11px ${accentColor}` }}>
                        {/* Corner decorations */}
                        {[['top-3 left-3', 'border-t-4 border-l-4 rounded-tl-lg'], ['top-3 right-3', 'border-t-4 border-r-4 rounded-tr-lg'], ['bottom-3 left-3', 'border-b-4 border-l-4 rounded-bl-lg'], ['bottom-3 right-3', 'border-b-4 border-r-4 rounded-br-lg']].map(([pos, s]) => (
                            <div key={pos} className={`absolute ${pos} w-12 h-12 ${s}`} style={{ borderColor: accentColor }} />
                        ))}

                        <div className="text-5xl mb-2">{isNGO ? '🏛️' : isVolunteer ? '🚴' : '🌾'}</div>
                        <p className="text-xs tracking-widest uppercase mb-3" style={{ color: accentColor, fontFamily: 'sans-serif', letterSpacing: 4 }}>
                            SurplusSync Food Redistribution Platform
                        </p>
                        <h1 className="text-4xl font-bold mb-1 text-slate-900" style={{ fontFamily: 'Georgia, serif' }}>
                            Certificate of Appreciation
                        </h1>
                        <p className="text-xs tracking-widest text-slate-400 uppercase mb-6" style={{ fontFamily: 'sans-serif', letterSpacing: 3 }}>
                            In Recognition of Dedicated Service
                        </p>
                        <div style={{ width: 72, height: 3, background: `linear-gradient(90deg,transparent,${accentColor},transparent)`, margin: '0 auto 24px' }} />

                        <p className="text-slate-600 mb-1 text-base" style={{ fontFamily: 'Georgia, serif', lineHeight: 1.9 }}>This certificate is proudly presented to</p>
                        <p className="text-3xl font-bold italic text-slate-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>{orgName}</p>
                        <span className="inline-block text-white text-xs rounded-full px-4 py-1 mb-5" style={{ background: accentColor, fontFamily: 'sans-serif' }}>{roleLabel}</span>

                        <p className="text-slate-500 text-sm mb-6" style={{ fontFamily: 'sans-serif' }}>
                            in acknowledgement of their outstanding contribution through {actionText},<br />
                            making a meaningful difference in the lives of people in our community.
                        </p>

                        {/* Stats */}
                        <div className="flex justify-center gap-12 mb-6">
                            {[stat1, stat2, stat3].map(({ value, label }) => (
                                <div key={label}>
                                    <div className="text-3xl font-bold" style={{ color: accentColor, fontFamily: 'sans-serif' }}>{value}</div>
                                    <div className="text-xs text-slate-400 uppercase tracking-wider mt-1" style={{ fontFamily: 'sans-serif' }}>{label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Karma badge */}
                        <div className="mb-7">
                            <span className="inline-block text-white text-sm rounded-full px-5 py-2" style={{ background: `linear-gradient(135deg,${accentColor},${accentColor}bb)`, fontFamily: 'sans-serif' }}>
                                ⭐ {karma} Karma Points · Level {level} Contributor
                            </span>
                        </div>

                        {/* Footer */}
                        <div style={{ borderTop: `1px solid ${lightBorder}`, paddingTop: 18, marginTop: 4 }} className="flex justify-between items-end">
                            <div>
                                <div style={{ width: 150, borderBottom: '1px solid #d1d5db', marginBottom: 5 }} />
                                <p className="text-xs text-slate-500" style={{ fontFamily: 'sans-serif' }}>Platform Director</p>
                                <p className="text-xs font-semibold text-slate-700" style={{ fontFamily: 'sans-serif' }}>SurplusSync Network</p>
                            </div>
                            <div className="text-2xl">🏅</div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500" style={{ fontFamily: 'sans-serif' }}>Date of Issue</p>
                                <p className="text-sm font-semibold text-slate-700" style={{ fontFamily: 'sans-serif' }}>{today}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── GAMIFICATION: KARMA PROGRESS BAR ────────────────────────────────────────

function KarmaProgress({ karma }: { karma: number }) {
    const earned = BADGE_CATALOG.filter(b => karma >= b.threshold)
    const next = BADGE_CATALOG.find(b => karma < b.threshold)
    const prev = [...BADGE_CATALOG].reverse().find(b => karma >= b.threshold)

    const fromPts = prev?.threshold ?? 0
    const toPts = next?.threshold ?? (prev?.threshold ?? 10)
    const pct = next ? Math.min(100, ((karma - fromPts) / (toPts - fromPts)) * 100) : 100

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    Karma & Achievements
                </h2>
                <span className="text-2xl font-bold text-amber-400">{karma} pts</span>
            </div>

            {/* Badge grid — all 5, earned/locked */}
            <div className="grid grid-cols-5 gap-3 mb-6">
                {BADGE_CATALOG.map(b => {
                    const isEarned = karma >= b.threshold
                    const ptsLeft = Math.max(0, b.threshold - karma)
                    return (
                        <div key={b.name}
                            className={`relative p-3 rounded-xl border text-center transition-all ${isEarned ? 'bg-gradient-to-b from-amber-500/20 to-amber-600/10 border-amber-500/40' : 'bg-slate-900/40 border-slate-800 opacity-50'}`}
                        >
                            {isEarned && (
                                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold leading-none">✓</span>
                                </div>
                            )}
                            <div className="text-3xl mb-1">{b.icon}</div>
                            <p className={`text-xs font-semibold ${isEarned ? 'text-white' : 'text-slate-500'}`}>{b.name}</p>
                            {!isEarned && <p className="text-xs text-slate-600 mt-0.5">{ptsLeft} pts</p>}
                            {isEarned && <p className="text-xs text-amber-400 mt-0.5">{b.threshold}+ pts</p>}
                        </div>
                    )
                })}
            </div>

            {/* Next badge progress */}
            {next && (
                <div className="bg-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">{next.icon}</span>
                            <div>
                                <p className="text-sm font-semibold text-white">Next: {next.name}</p>
                                <p className="text-xs text-slate-400">{next.description}</p>
                            </div>
                        </div>
                        <span className="text-sm font-bold text-emerald-400">{next.threshold - karma} pts to go</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700"
                            style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>{fromPts}</span>
                        <span>{next.threshold} pts</span>
                    </div>
                </div>
            )}
            {!next && earned.length === BADGE_CATALOG.length && (
                <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-xl p-4 text-center">
                    <p className="text-lg">🎉</p>
                    <p className="text-sm font-bold text-amber-400 mt-1">All badges unlocked! You're a Superhero!</p>
                </div>
            )}
        </div>
    )
}

// ─── COMMUNITY COUNTERS ───────────────────────────────────────────────────────

function CommunityCounters({ stats }: { stats: CommunityStats }) {
    const counters = [
        { icon: '🍽️', value: stats.mealsProvided.toLocaleString(), label: 'Meals Provided', color: 'text-emerald-400' },
        { icon: '♻️', value: `${stats.kgRescued.toLocaleString()} kg`, label: 'Food Rescued', color: 'text-blue-400' },
        { icon: '🌿', value: `${stats.co2Saved.toLocaleString()} kg`, label: 'CO₂ Saved', color: 'text-purple-400' },
        { icon: '🤝', value: stats.totalDonors.toLocaleString(), label: 'Active Donors', color: 'text-amber-400' },
        { icon: '🏛️', value: stats.totalNGOs.toLocaleString(), label: 'Partner NGOs', color: 'text-rose-400' },
        { icon: '🚴', value: stats.totalVolunteers.toLocaleString(), label: 'Volunteers', color: 'text-cyan-400' },
    ]
    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                Community Impact — Platform Wide
            </h2>
            <p className="text-xs text-slate-500 mb-5">Live totals across all donors, NGOs and volunteers on SurplusSync</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {counters.map(c => (
                    <div key={c.label} className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700/50">
                        <div className="text-2xl mb-1">{c.icon}</div>
                        <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
                        <p className="text-xs text-slate-400 mt-1">{c.label}</p>
                    </div>
                ))}
            </div>
            <div className="mt-4 p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
                <p className="text-xs text-slate-400 text-center">
                    <span className="text-emerald-400 font-semibold">{stats.totalDonations.toLocaleString()} total donations</span> processed ·{' '}
                    <span className="text-blue-400 font-semibold">{stats.deliveredDonations.toLocaleString()} successfully delivered</span> ·{' '}
                    <span className="text-amber-400 font-semibold">{stats.activeDonations.toLocaleString()} currently active</span>
                </p>
            </div>
        </div>
    )
}

// ─── NGO GROWTH CHARTS ────────────────────────────────────────────────────────

function NGOGrowthCharts({ monthly }: { monthly: MonthlyStatPoint[] }) {
    const totalAll = monthly.reduce((s, m) => s + m.total, 0)
    const totalDelivered = monthly.reduce((s, m) => s + m.delivered, 0)
    const deliveryRate = totalAll > 0 ? Math.round((totalDelivered / totalAll) * 100) : 0

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    NGO Growth Reports
                </h2>
                <span className="text-xs text-slate-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                    Last 6 months
                </span>
            </div>
            <p className="text-xs text-slate-500 mb-6">Monthly food intake summaries — use these for grant and funding applications</p>

            <div className="space-y-8">
                <SvgBarChart
                    title="Monthly Food Intake"
                    subtitle="Total donations received each month"
                    data={monthly.map(m => ({ label: m.label, value: m.total }))}
                    color="#10b981"
                />
                <SvgLineChart
                    title="Delivery Trend"
                    subtitle="Successful food deliveries per month"
                    data={monthly.map(m => ({ label: m.label, value: m.delivered }))}
                    color="#6366f1"
                />
                <SvgBarChart
                    title="Claims Made"
                    subtitle="Donations claimed each month"
                    data={monthly.map(m => ({ label: m.label, value: m.claimed }))}
                    color="#f59e0b"
                />
            </div>

            {/* Summary row */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-400">{totalAll}</p>
                    <p className="text-xs text-slate-400 mt-1">Total Received</p>
                </div>
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-indigo-400">{totalDelivered}</p>
                    <p className="text-xs text-slate-400 mt-1">Delivered</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-amber-400">{deliveryRate}%</p>
                    <p className="text-xs text-slate-400 mt-1">Delivery Rate</p>
                </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center">
                💡 A high delivery rate demonstrates operational efficiency — highlight this in funding applications
            </p>
        </div>
    )
}

// ─── MAIN IMPACT PAGE ─────────────────────────────────────────────────────────

export default function Impact() {
    const [user, setUser] = useState<User | null>(null)
    const [community, setCommunity] = useState<CommunityStats | null>(null)
    const [monthly, setMonthly] = useState<MonthlyStatPoint[]>([])
    const [loading, setLoading] = useState(true)
    const [showCert, setShowCert] = useState(false)

    const storedUser = useMemo(() => {
        try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} }
    }, [])
    const role = (storedUser.role || 'DONOR').toLowerCase()

    useEffect(() => {
        ; (async () => {
            setLoading(true)
            try {
                const [profileData, communityData, monthlyData] = await Promise.all([
                    getUserProfile(),
                    getCommunityStats(),
                    getMonthlyStats(),
                ])
                setUser(profileData)
                setCommunity(communityData)
                setMonthly(monthlyData)
            } catch (e) {
                console.error('Impact load error:', e)
            } finally {
                setLoading(false)
            }
        })()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-12 h-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Loading your impact...</p>
                </div>
            </div>
        )
    }

    if (!user) return null

    const stats = user.impactStats || { totalDonations: 0, mealsProvided: 0, kgSaved: 0 }
    const karma = user.karmaPoints ?? 0

    // Role-specific labels
    const pageTitle = role === 'ngo' ? 'Organization Impact' : role === 'volunteer' ? 'Your Contribution' : 'Your Impact'
    const pageSubtitle = role === 'ngo' ? 'Track your community reach' : role === 'volunteer' ? 'Every delivery makes a difference' : "See the difference you're making"

    const stat1Label = role === 'ngo' ? 'Food Collected' : role === 'volunteer' ? 'Total Deliveries' : 'Total Donations'
    const stat2Label = role === 'ngo' ? 'People Served' : role === 'volunteer' ? 'People Helped' : 'Meals Provided'
    const stat3Label = role === 'ngo' ? 'Food Rescued' : role === 'volunteer' ? 'Food Transported' : 'Food Saved'

    const certButtonLabel = role === 'ngo' ? 'Download Impact Report' : role === 'volunteer' ? 'Download Volunteer Certificate' : 'Download Impact Certificate'
    const certBtnColor = role === 'ngo' ? 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' : role === 'volunteer' ? 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700' : 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'

    // Environmental impact calculations
    const co2Saved = Math.floor(stats.kgSaved * 2.5)
    const waterSaved = Math.floor(stats.kgSaved * 25)
    const familiesHelped = Math.floor(stats.mealsProvided / 10)

    return (
        <div className="space-y-6">
            {showCert && <CertificateModal user={user} role={role} onClose={() => setShowCert(false)} />}

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-1">{pageTitle}</h1>
                <p className="text-slate-400">{pageSubtitle}</p>
            </div>

            {/* US1 — Personal Impact Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: stat1Label, value: stats.totalDonations, icon: <Package className="w-6 h-6 text-white" />, grad: 'from-emerald-500 to-emerald-600', accent: 'text-emerald-400', sub: role === 'donor' ? 'Food items shared' : 'Completed' },
                    { label: stat2Label, value: stats.mealsProvided, icon: <span className="text-2xl">🍽️</span>, grad: 'from-blue-500 to-blue-600', accent: 'text-blue-400', sub: 'People impacted' },
                    { label: stat3Label, value: `${stats.kgSaved} kg`, icon: <span className="text-2xl">♻️</span>, grad: 'from-purple-500 to-purple-600', accent: 'text-purple-400', sub: 'Kilograms' },
                ].map(s => (
                    <div key={s.label} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center shadow-lg`}>
                                {s.icon}
                            </div>
                            <span className="text-sm text-slate-400">{s.label}</span>
                        </div>
                        <p className="text-5xl font-bold text-white mb-2">{s.value}</p>
                        <p className={`text-sm ${s.accent}`}>{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* Environmental Impact */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-emerald-400" />
                    Environmental Impact
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    {[
                        { icon: <Leaf className="w-4 h-4 text-emerald-400" />, value: `${co2Saved} kg`, label: 'CO₂ saved', color: 'text-emerald-400' },
                        { icon: <Droplets className="w-4 h-4 text-blue-400" />, value: `${waterSaved} L`, label: 'Water saved', color: 'text-blue-400' },
                        { icon: <Users className="w-4 h-4 text-purple-400" />, value: familiesHelped, label: 'Families helped', color: 'text-purple-400' },
                        { icon: <Trophy className="w-4 h-4 text-amber-400" />, value: (user.trustScore?.toFixed(1) || '0.0'), label: 'Trust score', color: 'text-amber-400' },
                    ].map(item => (
                        <div key={item.label}>
                            <div className="flex items-center gap-1.5 mb-1">{item.icon}<p className="text-xs text-slate-500">{item.label}</p></div>
                            <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* US2 — Badges & Gamification */}
            <KarmaProgress karma={karma} />

            {/* US3/US5 — Community Counters */}
            {community && <CommunityCounters stats={community} />}

            {/* US3/US5 — NGO Growth Charts */}
            {role === 'ngo' && monthly.length > 0 && <NGOGrowthCharts monthly={monthly} />}

            {/* Volunteer Performance (role-specific extra panel) */}
            {role === 'volunteer' && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-5">📊 Performance Metrics</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                        <div><p className="text-xs text-slate-500 mb-1">Distance Covered</p><p className="text-3xl font-bold text-blue-400">{Math.floor(stats.totalDonations * 5.2)} km</p></div>
                        <div><p className="text-xs text-slate-500 mb-1">Avg Response</p><p className="text-3xl font-bold text-emerald-400">18 min</p></div>
                        <div><p className="text-xs text-slate-500 mb-1">Success Rate</p><p className="text-3xl font-bold text-purple-400">98%</p></div>
                        <div><p className="text-xs text-slate-500 mb-1">Rating</p><p className="text-3xl font-bold text-amber-400">{user.trustScore?.toFixed(1) || '5.0'} ⭐</p></div>
                    </div>
                </div>
            )}

            {/* US4 — Certificate CTA */}
            <div className={`bg-gradient-to-br ${role === 'ngo' ? 'from-blue-500/10 to-indigo-500/10 border-blue-500/20' : role === 'volunteer' ? 'from-purple-500/10 to-violet-500/10 border-purple-500/20' : 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20'} border rounded-2xl p-6`}>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                            {role === 'ngo' ? 'Impact Report for Funding' : 'Share Your Impact'}
                        </h3>
                        <p className="text-sm text-slate-400">
                            {role === 'ngo'
                                ? 'Generate a professional impact report for grants and documentation'
                                : role === 'volunteer'
                                    ? 'Download your volunteer certificate to share on LinkedIn'
                                    : 'Download your personalised certificate and inspire others to join'}
                        </p>
                    </div>
                    <Share2 className="w-6 h-6 text-emerald-400 hidden md:block" />
                </div>
                <button
                    onClick={() => setShowCert(true)}
                    className={`w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r ${certBtnColor} text-white rounded-xl font-semibold transition-all shadow-lg`}
                >
                    <Award className="w-5 h-5" />
                    {certButtonLabel}
                </button>
            </div>
        </div>
    )
}