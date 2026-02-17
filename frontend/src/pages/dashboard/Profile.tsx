import { useEffect, useState } from 'react'
import { getUserProfile, updateUserProfile, type User } from '../../services/api'
import { User as UserIcon, Building, Phone, Mail, MapPin, Shield, Edit2, Check, Trophy, Star, AlertCircle, Loader2 } from 'lucide-react'

export default function Profile() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        address: '',
        organizationName: '',
    })

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        console.log('🔍 Profile component: Starting to load profile...')
        setLoading(true)
        setError(null)

        try {
            // Check token first
            const token = localStorage.getItem('token')
            if (!token) {
                throw new Error('No authentication token found')
            }
            console.log('✅ Token exists')

            // Call getUserProfile
            console.log('📞 Calling getUserProfile()...')
            const data = await getUserProfile()
            console.log('✅ getUserProfile returned:', data)

            if (!data) {
                throw new Error('getUserProfile returned null or undefined')
            }

            if (!data.id) {
                throw new Error('User data is missing id field')
            }

            console.log('✅ Profile loaded successfully!')
            setUser(data)
            setFormData({
                name: data.name || '',
                phoneNumber: data.phoneNumber || data.phone || '',
                address: data.address || '',
                organizationName: data.organizationName || '',
            })

        } catch (err: any) {
            console.error('❌ Profile loading failed:', err)
            console.error('❌ Error type:', typeof err)
            console.error('❌ Error message:', err?.message)
            console.error('❌ Error response:', err?.response)
            console.error('❌ Full error object:', err)

            const errorMessage = err?.message || err?.response?.data?.message || 'Failed to load profile'
            setError(errorMessage)

            // If token is invalid, redirect to login
            if (err?.response?.status === 401 || errorMessage.includes('token')) {
                setTimeout(() => {
                    localStorage.clear()
                    window.location.href = '/login'
                }, 2000)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const updated = await updateUserProfile(formData)
            setUser(updated)
            localStorage.setItem('user', JSON.stringify(updated))
            setEditing(false)
        } catch (error: any) {
            console.error('Failed to update profile:', error)
            alert('Failed to update profile: ' + (error.message || 'Unknown error'))
        } finally {
            setSaving(false)
        }
    }

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
                    <p className="text-slate-400 text-xl">Loading profile...</p>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen p-6">
                <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-xl p-8 text-center">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Failed to Load Profile</h2>
                    <p className="text-red-400 mb-6">{error}</p>

                    <div className="space-y-3">
                        <button
                            onClick={loadProfile}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                        >
                            Try Again
                        </button>

                        <button
                            onClick={() => {
                                localStorage.clear()
                                window.location.href = '/login'
                            }}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 px-6 rounded-lg transition-colors"
                        >
                            Back to Login
                        </button>
                    </div>

                    <div className="mt-6 p-4 bg-slate-950 rounded-lg text-left">
                        <p className="text-xs text-slate-400 font-mono">
                            <strong>Debug Info:</strong><br />
                            Token: {localStorage.getItem('token') ? '✓ Present' : '✗ Missing'}<br />
                            Error: {error}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // No user state
    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                    <p className="text-slate-400 text-xl">No user data available</p>
                    <button
                        onClick={loadProfile}
                        className="mt-4 bg-emerald-500 hover:bg-emerald-400 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                        Reload
                    </button>
                </div>
            </div>
        )
    }

    // Success! Show profile
    const karmaPoints = user.karmaPoints || 0
    const badges = user.badges || []
    const level = user.level || 1
    const nextLevelPoints = user.nextLevelPoints || 0
    const progressPercent = nextLevelPoints > 0
        ? Math.min(100, ((karmaPoints % 100) / nextLevelPoints) * 100)
        : 100

    const getRoleBadge = () => {
        const roleStr = String(user.role).toLowerCase()
        const badgeMap = {
            donor: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Donor' },
            ngo: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'NGO' },
            volunteer: { bg: 'bg-purple-500/10', text: 'text-purple-400', label: 'Volunteer' }
        }
        return badgeMap[roleStr as keyof typeof badgeMap] || badgeMap.donor
    }

    const badge = getRoleBadge()

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header with Edit Button */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white">
                            {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {user.organizationName || user.name}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
                                    {badge.label}
                                </span>
                                {user.isVerified && (
                                    <span className="flex items-center gap-1 text-xs text-emerald-400">
                                        <Shield className="w-3 h-3" />
                                        Verified
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => (editing ? handleSave() : setEditing(true))}
                        disabled={saving}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${editing
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            }`}
                    >
                        {editing ? (
                            <span className="flex items-center gap-2">
                                <Check className="w-4 h-4" />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Edit2 className="w-4 h-4" />
                                Edit Profile
                            </span>
                        )}
                    </button>
                </div>
                <p className="text-slate-400">Manage your account and view your impact</p>
            </div>

            {/* Karma Counter */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl shadow-lg p-8 text-white">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <Star className="w-10 h-10 fill-white" />
                        <div className="text-6xl font-bold">{karmaPoints}</div>
                        <Star className="w-10 h-10 fill-white" />
                    </div>
                    <div className="text-xl font-semibold mb-1">Karma Points</div>
                    <div className="text-sm opacity-90">
                        Level {level} • {badge.label}
                    </div>
                </div>

                {nextLevelPoints > 0 && (
                    <div className="mt-6">
                        <div className="flex justify-between text-sm mb-2">
                            <span>Progress to Level {level + 1}</span>
                            <span>{nextLevelPoints} points to go</span>
                        </div>
                        <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-white h-full rounded-full transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Trophy Case */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    Trophy Case
                </h2>

                {badges.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <p className="text-lg mb-2">No badges earned yet</p>
                        <p className="text-sm">Complete deliveries to earn your first badge!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {badges.map((badgeText, index) => (
                            <div
                                key={index}
                                className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-lg p-4 text-center"
                            >
                                <div className="text-4xl mb-2">
                                    {badgeText.split(' ')[0]}
                                </div>
                                <div className="font-semibold text-white text-sm">
                                    {badgeText.split(' ').slice(1).join(' ')}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Account Information */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>

                <div className="space-y-4">
                    <div>
                        <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                            <UserIcon className="w-4 h-4" />
                            Full Name
                        </label>
                        {editing ? (
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                            />
                        ) : (
                            <p className="text-white">{user.name}</p>
                        )}
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                            <Mail className="w-4 h-4" />
                            Email
                        </label>
                        <p className="text-white">{user.email}</p>
                        <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                            <Phone className="w-4 h-4" />
                            Phone Number
                        </label>
                        {editing ? (
                            <input
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                            />
                        ) : (
                            <p className="text-white">{user.phoneNumber || user.phone || 'Not provided'}</p>
                        )}
                    </div>

                    {(String(user.role).toLowerCase() === 'donor' || String(user.role).toLowerCase() === 'ngo') && (
                        <>
                            <div>
                                <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                                    <Building className="w-4 h-4" />
                                    Organization Name
                                </label>
                                {editing ? (
                                    <input
                                        type="text"
                                        value={formData.organizationName}
                                        onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                                    />
                                ) : (
                                    <p className="text-white">{user.organizationName || 'Not provided'}</p>
                                )}
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                                    <MapPin className="w-4 h-4" />
                                    Address
                                </label>
                                {editing ? (
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        rows={3}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none resize-none"
                                    />
                                ) : (
                                    <p className="text-white">{user.address || 'Not provided'}</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Badge Guide */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">📚 Badge Guide</h2>
                <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                        <span className="text-2xl">🌱</span>
                        <div>
                            <div className="font-semibold text-white">Newcomer</div>
                            <div className="text-sm text-slate-400">Earn 50 karma points</div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="text-2xl">🦸</span>
                        <div>
                            <div className="font-semibold text-white">Local Hero</div>
                            <div className="text-sm text-slate-400">Earn 100 karma points</div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="text-2xl">🏆</span>
                        <div>
                            <div className="font-semibold text-white">Champion</div>
                            <div className="text-sm text-slate-400">Earn 250 karma points</div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="text-2xl">⭐</span>
                        <div>
                            <div className="font-semibold text-white">Legend</div>
                            <div className="text-sm text-slate-400">Earn 500 karma points</div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="text-2xl">💫</span>
                        <div>
                            <div className="font-semibold text-white">Superhero</div>
                            <div className="text-sm text-slate-400">Earn 1000 karma points</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* How to Earn Karma */}
            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">💡 How to Earn Karma</h2>
                <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                        <span className="text-emerald-400 font-bold text-lg">+50</span>
                        <div>
                            <div className="font-semibold text-white">Volunteer Delivery</div>
                            <div className="text-sm text-slate-400">Complete a food delivery as a volunteer</div>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3">
                        <span className="text-emerald-400 font-bold text-lg">+30</span>
                        <div>
                            <div className="font-semibold text-white">Donor Contribution</div>
                            <div className="text-sm text-slate-400">Your donated food is successfully delivered</div>
                        </div>
                    </div>
                </div>
            </div>

            {!user.isVerified && String(user.role).toLowerCase() === 'ngo' && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <p className="text-sm text-amber-400 mb-2">⏳ Verification Pending</p>
                    <p className="text-xs text-slate-400">
                        Your NGO account is under review. You'll receive access once verified by our team.
                    </p>
                </div>
            )}
        </div>
    )
}