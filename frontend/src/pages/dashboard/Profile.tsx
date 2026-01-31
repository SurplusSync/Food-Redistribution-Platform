import { useEffect, useState } from 'react'
import { getUserProfile, updateUserProfile, type User } from '../../services/api'
import { User as UserIcon, Building, Phone, Mail, MapPin, Shield, Edit2, Check } from 'lucide-react'

export default function Profile() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        organizationName: '',
    })

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        setLoading(true)
        try {
            const data = await getUserProfile(currentUser.id)
            if (data) {
                setUser(data)
                setFormData({
                    name: data.name || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    organizationName: data.organizationName || '',
                })
            }
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const updated = await updateUserProfile(currentUser.id, formData)
            setUser(updated)
            localStorage.setItem('user', JSON.stringify(updated))
            setEditing(false)
        } catch (error) {
            alert('Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-slate-500">Loading profile...</p>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-slate-500">Profile not found</p>
            </div>
        )
    }

    const getRoleBadge = () => {
        const badges = {
            donor: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Donor' },
            ngo: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'NGO' },
            volunteer: { bg: 'bg-purple-500/10', text: 'text-purple-400', label: 'Volunteer' }
        }
        return badges[user.role as keyof typeof badges] || badges.donor
    }

    const badge = getRoleBadge()

    return (
        <div className="max-w-3xl">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-white mb-1">Profile</h1>
                <p className="text-slate-500">Manage your account information</p>
            </div>

            {/* Profile Header */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-2xl font-bold text-white">
                            {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white mb-1">
                                {user.organizationName || user.name}
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
                                    {badge.label}
                                </span>
                                {user.verified && (
                                    <span className="flex items-center gap-1 text-xs text-emerald-400">
                                        <Shield className="w-3 h-3" />
                                        Verified
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => editing ? handleSave() : setEditing(true)}
                        disabled={saving}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            editing
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

                {/* Trust Score */}
                {user.trustScore !== undefined && (
                    <div className="p-4 bg-slate-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-400">Trust Score</span>
                            <span className="text-lg font-bold text-emerald-400">
                                {user.trustScore.toFixed(1)} / 5.0
                            </span>
                        </div>
                        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all"
                                style={{ width: `${(user.trustScore / 5) * 100}%` }}
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            Based on {user.impactStats?.totalDonations || 0} completed donations
                        </p>
                    </div>
                )}
            </div>

            {/* Profile Details */}
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
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                            />
                        ) : (
                            <p className="text-white">{user.phone || 'Not provided'}</p>
                        )}
                    </div>

                    {(user.role === 'donor' || user.role === 'ngo') && (
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
                                    <Building className="w-4 h-4" />
                                    Organization Type
                                </label>
                                <p className="text-white capitalize">
                                    {user.organizationType?.replace('_', ' ') || 'Not specified'}
                                </p>
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

            {/* Verification Status */}
            {!user.verified && user.role === 'ngo' && (
                <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-sm text-amber-400 mb-2">⏳ Verification Pending</p>
                    <p className="text-xs text-slate-400">
                        Your NGO account is under review. You'll receive access once verified by our team.
                    </p>
                </div>
            )}
        </div>
    )
}