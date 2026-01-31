import { useEffect, useState } from 'react'
import { getBadges, getUserProfile, type Badge, type User } from '../../services/api'
import { Trophy, TrendingUp, Share2, Package, Users, MapPin, Clock } from 'lucide-react'

export default function Impact() {
    const [user, setUser] = useState<User | null>(null)
    const [badges, setBadges] = useState<Badge[]>([])
    const [loading, setLoading] = useState(true)

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
    const userRole = currentUser.role || 'donor'

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const [profileData, badgesData] = await Promise.all([
                    getUserProfile(currentUser.id),
                    getBadges(currentUser.id)
                ])
                setUser(profileData)
                setBadges(badgesData)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="spinner mx-auto mb-4" />
                    <p className="text-slate-500">Loading your impact...</p>
                </div>
            </div>
        )
    }

    const stats = user?.impactStats || { totalDonations: 0, mealsProvided: 0, kgSaved: 0 }
    const earnedBadges = badges.filter(b => b.earned)
    const nextBadge = badges.find(b => !b.earned)

    // DONOR VIEW
    if (userRole === 'donor') {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Your Impact</h1>
                    <p className="text-slate-400">See the difference you're making</p>
                </div>

                {/* Impact Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-sm text-slate-400">Total Donations</span>
                        </div>
                        <p className="text-5xl font-bold text-white mb-2">{stats.totalDonations}</p>
                        <p className="text-sm text-emerald-400">Food items shared</p>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                                <span className="text-2xl">🍽️</span>
                            </div>
                            <span className="text-sm text-slate-400">Meals Provided</span>
                        </div>
                        <p className="text-5xl font-bold text-white mb-2">{stats.mealsProvided}</p>
                        <p className="text-sm text-blue-400">People fed</p>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <span className="text-2xl">♻️</span>
                            </div>
                            <span className="text-sm text-slate-400">Food Saved</span>
                        </div>
                        <p className="text-5xl font-bold text-white mb-2">{stats.kgSaved}</p>
                        <p className="text-sm text-purple-400">Kilograms</p>
                    </div>
                </div>

                {/* Environmental Impact */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        🌍 Environmental Impact
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-3xl font-bold text-emerald-400">{Math.floor(stats.kgSaved * 2.5)}</p>
                            <p className="text-xs text-slate-500 mt-1">kg CO₂ saved</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-blue-400">{Math.floor(stats.kgSaved * 25)}</p>
                            <p className="text-xs text-slate-500 mt-1">Liters water saved</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-purple-400">{Math.floor(stats.mealsProvided / 10)}</p>
                            <p className="text-xs text-slate-500 mt-1">Families helped</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-amber-400">{user?.trustScore?.toFixed(1) || '0.0'}</p>
                            <p className="text-xs text-slate-500 mt-1">Trust score</p>
                        </div>
                    </div>
                </div>

                {/* Badges */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-amber-400" />
                            Achievements
                        </h2>
                        <span className="text-sm text-slate-500">
                            {earnedBadges.length} / {badges.length} earned
                        </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        {badges.map((badge) => (
                            <div
                                key={badge.id}
                                className={`p-5 rounded-2xl border text-center transition-all ${
                                    badge.earned
                                        ? 'bg-slate-800/50 border-slate-700'
                                        : 'bg-slate-900/30 border-slate-800/50 opacity-40'
                                }`}
                            >
                                <div className="text-4xl mb-3">{badge.icon}</div>
                                <p className={`text-sm font-semibold mb-1 ${badge.earned ? 'text-white' : 'text-slate-600'}`}>
                                    {badge.name}
                                </p>
                                <p className="text-xs text-slate-500 mb-2">{badge.description}</p>
                                {!badge.earned && (
                                    <p className="text-xs text-slate-600">
                                        {badge.requirement - stats.totalDonations} more needed
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {nextBadge && (
                        <div className="p-5 bg-slate-800/30 rounded-xl border border-slate-700">
                            <p className="text-sm text-slate-400 mb-3">Next Achievement:</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl">{nextBadge.icon}</span>
                                    <div>
                                        <p className="text-base font-semibold text-white mb-1">{nextBadge.name}</p>
                                        <p className="text-sm text-slate-400">{nextBadge.description}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-emerald-400">
                                        {Math.max(0, nextBadge.requirement - stats.totalDonations)}
                                    </p>
                                    <p className="text-xs text-slate-500">more to go</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Share Impact */}
                <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-1">Share Your Impact</h3>
                            <p className="text-sm text-slate-400">Inspire others to join the cause</p>
                        </div>
                        <Share2 className="w-6 h-6 text-emerald-400" />
                    </div>
                    <button className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all shadow-lg">
                        Download Impact Certificate
                    </button>
                </div>
            </div>
        )
    }

    // VOLUNTEER VIEW
    if (userRole === 'volunteer') {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Your Contribution</h1>
                    <p className="text-slate-400">Every delivery makes a difference</p>
                </div>

                {/* Volunteer Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-sm text-slate-400">Total Deliveries</span>
                        </div>
                        <p className="text-5xl font-bold text-white mb-2">{stats.totalDonations}</p>
                        <p className="text-sm text-blue-400">Completed trips</p>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                                <span className="text-2xl">📦</span>
                            </div>
                            <span className="text-sm text-slate-400">Food Transported</span>
                        </div>
                        <p className="text-5xl font-bold text-white mb-2">{stats.kgSaved}</p>
                        <p className="text-sm text-emerald-400">Kilograms</p>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-sm text-slate-400">People Helped</span>
                        </div>
                        <p className="text-5xl font-bold text-white mb-2">{stats.mealsProvided}</p>
                        <p className="text-sm text-purple-400">Meals delivered</p>
                    </div>
                </div>

                {/* Volunteer Performance */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        📊 Performance Metrics
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className="w-4 h-4 text-blue-400" />
                                <p className="text-xs text-slate-500">Total Distance</p>
                            </div>
                            <p className="text-3xl font-bold text-white">{Math.floor(stats.totalDonations * 5.2)} km</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-emerald-400" />
                                <p className="text-xs text-slate-500">Avg Response Time</p>
                            </div>
                            <p className="text-3xl font-bold text-white">18 min</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-purple-400" />
                                <p className="text-xs text-slate-500">Success Rate</p>
                            </div>
                            <p className="text-3xl font-bold text-white">98%</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Trophy className="w-4 h-4 text-amber-400" />
                                <p className="text-xs text-slate-500">Rating</p>
                            </div>
                            <p className="text-3xl font-bold text-white">{user?.trustScore?.toFixed(1) || '0.0'} ⭐</p>
                        </div>
                    </div>
                </div>

                {/* Badges */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-amber-400" />
                            Achievements
                        </h2>
                        <span className="text-sm text-slate-500">
                            {earnedBadges.length} / {badges.length} earned
                        </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {badges.map((badge) => (
                            <div
                                key={badge.id}
                                className={`p-5 rounded-2xl border text-center transition-all ${
                                    badge.earned
                                        ? 'bg-slate-800/50 border-slate-700'
                                        : 'bg-slate-900/30 border-slate-800/50 opacity-40'
                                }`}
                            >
                                <div className="text-4xl mb-3">{badge.icon}</div>
                                <p className={`text-sm font-semibold mb-1 ${badge.earned ? 'text-white' : 'text-slate-600'}`}>
                                    {badge.name}
                                </p>
                                <p className="text-xs text-slate-500">{badge.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Impact Summary */}
                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-sm">
                    <h3 className="text-lg font-semibold text-white mb-4">Your Environmental Impact</h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <p className="text-3xl font-bold text-blue-400">{Math.floor(stats.kgSaved * 2.5)} kg</p>
                            <p className="text-xs text-slate-500 mt-1">CO₂ emissions prevented</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-emerald-400">{Math.floor(stats.totalDonations * 5.2)} km</p>
                            <p className="text-xs text-slate-500 mt-1">Distance covered for good</p>
                        </div>
                    </div>
                    <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg">
                        Download Volunteer Certificate
                    </button>
                </div>
            </div>
        )
    }

    // NGO VIEW
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Organization Impact</h1>
                <p className="text-slate-400">Track your community reach and impact</p>
            </div>

            {/* NGO Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                            <Package className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm text-slate-400">Food Collected</span>
                    </div>
                    <p className="text-5xl font-bold text-white mb-2">{stats.totalDonations}</p>
                    <p className="text-sm text-emerald-400">Donations received</p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm text-slate-400">People Served</span>
                    </div>
                    <p className="text-5xl font-bold text-white mb-2">{stats.mealsProvided}</p>
                    <p className="text-sm text-blue-400">Meals distributed</p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <span className="text-2xl">♻️</span>
                        </div>
                        <span className="text-sm text-slate-400">Food Rescued</span>
                    </div>
                    <p className="text-5xl font-bold text-white mb-2">{stats.kgSaved}</p>
                    <p className="text-sm text-purple-400">Kilograms</p>
                </div>
            </div>

            {/* Monthly Trends */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                <h2 className="text-lg font-semibold text-white mb-6">Monthly Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <p className="text-sm text-slate-400 mb-2">This Month</p>
                        <p className="text-3xl font-bold text-emerald-400">{Math.floor(stats.totalDonations * 0.3)}</p>
                        <p className="text-xs text-slate-500 mt-1">Collections</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-400 mb-2">Growth</p>
                        <p className="text-3xl font-bold text-blue-400">+23%</p>
                        <p className="text-xs text-slate-500 mt-1">vs last month</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-400 mb-2">Avg per Day</p>
                        <p className="text-3xl font-bold text-purple-400">{Math.floor(stats.mealsProvided / 30)}</p>
                        <p className="text-xs text-slate-500 mt-1">Meals served</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-400 mb-2">Rating</p>
                        <p className="text-3xl font-bold text-amber-400">{user?.trustScore?.toFixed(1) || '0.0'}</p>
                        <p className="text-xs text-slate-500 mt-1">Trust score</p>
                    </div>
                </div>
            </div>

            {/* Community Impact */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    🌍 Community Impact
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <p className="text-3xl font-bold text-emerald-400">{Math.floor(stats.mealsProvided / 10)}</p>
                        <p className="text-xs text-slate-500 mt-1">Families supported</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-blue-400">{Math.floor(stats.kgSaved * 2.5)}</p>
                        <p className="text-xs text-slate-500 mt-1">kg CO₂ prevented</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-purple-400">{Math.floor(stats.kgSaved * 25)}</p>
                        <p className="text-xs text-slate-500 mt-1">Liters water saved</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-amber-400">12</p>
                        <p className="text-xs text-slate-500 mt-1">Partner donors</p>
                    </div>
                </div>
            </div>

            {/* Download Report */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-1">Impact Report</h3>
                        <p className="text-sm text-slate-400">For grants and documentation</p>
                    </div>
                    <Share2 className="w-6 h-6 text-emerald-400" />
                </div>
                <button className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all shadow-lg">
                    Download Monthly Report
                </button>
            </div>
        </div>
    )
}