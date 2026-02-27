import { useEffect, useState, useRef } from 'react'
import { getUserProfile, updateUserProfile, type User } from '../../services/api'
import { User as UserIcon, Building, Phone, Mail, MapPin, Shield, Edit2, Check, Trophy, Star, AlertCircle, Loader2, Download, Award } from 'lucide-react'

// ─── Certificate Modal (All Roles) ───────────────────────────────────────────

interface CertificateProps {
    user: User
    onClose: () => void
}

function CertificateModal({ user, onClose }: CertificateProps) {
    const certRef = useRef<HTMLDivElement>(null)

    const today = new Date().toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
    })

    const role = String(user.role || '').toLowerCase()
    const isNGO = role === 'ngo'
    const isVolunteer = role === 'volunteer'

    const donations = user.impactStats?.totalDonations ?? 0
    const meals = user.impactStats?.mealsProvided ?? 0
    const kg = user.impactStats?.kgSaved ?? 0

    // Role-specific theming
    const accentColor = isNGO ? '#2563eb' : isVolunteer ? '#7c3aed' : '#059669'
    const lightBg = isNGO ? '#eff6ff' : isVolunteer ? '#f5f3ff' : '#f0fdf4'
    const lightBorder = isNGO ? '#bfdbfe' : isVolunteer ? '#ddd6fe' : '#d1fae5'
    const seal = isNGO ? '🏛️' : isVolunteer ? '🚴' : '🌾'
    const roleLabel = isNGO ? 'NGO Partner' : isVolunteer ? 'Volunteer' : 'Food Donor'
    const actionText = isNGO
        ? 'food collections and community service'
        : isVolunteer
            ? 'food delivery and community service'
            : 'food donations and sustainability efforts'
    const stat1Label = isNGO ? 'Collections' : isVolunteer ? 'Deliveries' : 'Donations'

    const handlePrint = () => {
        const printContents = certRef.current?.innerHTML
        if (!printContents) return
        const pw = window.open('', '_blank', 'width=900,height=680')
        if (!pw) return
        pw.document.write(`<!DOCTYPE html><html><head>
      <title>Certificate – ${user.organizationName || user.name}</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:Georgia,serif;background:${lightBg};display:flex;align-items:center;justify-content:center;min-height:100vh;padding:40px}
        .wrap{background:#fff;border:3px solid ${accentColor};border-radius:16px;padding:56px;max-width:740px;width:100%;position:relative;box-shadow:0 0 0 8px ${lightBorder},0 0 0 12px ${accentColor}}
        .corner{position:absolute;width:56px;height:56px}
        .tl{top:12px;left:12px;border-top:4px solid ${accentColor};border-left:4px solid ${accentColor};border-radius:8px 0 0 0}
        .tr{top:12px;right:12px;border-top:4px solid ${accentColor};border-right:4px solid ${accentColor};border-radius:0 8px 0 0}
        .bl{bottom:12px;left:12px;border-bottom:4px solid ${accentColor};border-left:4px solid ${accentColor};border-radius:0 0 0 8px}
        .br{bottom:12px;right:12px;border-bottom:4px solid ${accentColor};border-right:4px solid ${accentColor};border-radius:0 0 8px 0}
        .seal{text-align:center;font-size:52px;margin-bottom:8px}
        .org{text-align:center;font-size:10px;letter-spacing:4px;color:${accentColor};text-transform:uppercase;font-family:sans-serif;margin-bottom:12px}
        h1{text-align:center;font-size:36px;color:#064e3b;margin-bottom:4px}
        .sub{text-align:center;font-size:11px;color:#9ca3af;letter-spacing:3px;text-transform:uppercase;font-family:sans-serif;margin-bottom:28px}
        .div{width:80px;height:3px;background:linear-gradient(90deg,transparent,${accentColor},transparent);margin:0 auto 28px}
        .body{text-align:center;font-size:15px;color:#374151;line-height:1.9;margin-bottom:24px}
        .recipient{font-size:28px;font-style:italic;font-weight:bold;color:#064e3b;display:block;margin:6px 0}
        .rlabel{display:inline-block;background:${accentColor};color:#fff;border-radius:12px;padding:4px 16px;font-size:11px;font-family:sans-serif;margin-bottom:16px}
        .stats{display:flex;justify-content:center;gap:40px;margin:24px 0 32px}
        .snum{font-size:28px;font-weight:bold;color:${accentColor};font-family:sans-serif;text-align:center}
        .slbl{font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;font-family:sans-serif;text-align:center}
        .kbadge{display:inline-block;background:linear-gradient(135deg,${accentColor},${accentColor}bb);color:#fff;border-radius:20px;padding:6px 18px;font-size:12px;font-family:sans-serif}
        .footer{display:flex;justify-content:space-between;align-items:flex-end;margin-top:32px;padding-top:20px;border-top:1px solid ${lightBorder}}
        .sig-line{width:160px;border-bottom:1px solid #d1d5db;margin-bottom:6px}
        .sig-lbl{font-size:11px;color:#6b7280;font-family:sans-serif}
        .date{font-size:12px;color:#6b7280;font-family:sans-serif;text-align:right}
      </style>
    </head><body><div class="wrap">
      <div class="corner tl"></div><div class="corner tr"></div>
      <div class="corner bl"></div><div class="corner br"></div>
      ${printContents}
    </div></body></html>`)
        pw.document.close()
        setTimeout(() => { pw.print(); pw.close() }, 500)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-auto max-h-[92vh]">

                {/* Toolbar */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <Award className="w-5 h-5 text-emerald-600" />
                        Certificate of Appreciation
                    </h3>
                    <div className="flex gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Print / Save PDF
                        </button>
                        <button onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            Close
                        </button>
                    </div>
                </div>

                {/* Certificate Preview */}
                <div className="p-8" style={{ background: lightBg }}>
                    <div
                        ref={certRef}
                        className="relative bg-white rounded-2xl p-12 text-center"
                        style={{ border: `3px solid ${accentColor}`, boxShadow: `0 0 0 8px ${lightBorder}, 0 0 0 12px ${accentColor}` }}
                    >
                        {/* Corner accents */}
                        {[['top-3 left-3', 'border-t-4 border-l-4 rounded-tl-lg'], ['top-3 right-3', 'border-t-4 border-r-4 rounded-tr-lg'], ['bottom-3 left-3', 'border-b-4 border-l-4 rounded-bl-lg'], ['bottom-3 right-3', 'border-b-4 border-r-4 rounded-br-lg']].map(([pos, style]) => (
                            <div key={pos} className={`absolute ${pos} w-14 h-14 ${style}`} style={{ borderColor: accentColor }} />
                        ))}

                        <div className="text-5xl mb-2">{seal}</div>
                        <p className="text-xs tracking-widest uppercase mb-3" style={{ color: accentColor, fontFamily: 'sans-serif', letterSpacing: '4px' }}>
                            SurplusSync Food Redistribution Platform
                        </p>

                        <h1 className="text-4xl font-bold mb-1" style={{ color: '#0f172a', fontFamily: 'Georgia, serif' }}>
                            Certificate of Appreciation
                        </h1>
                        <p className="text-xs tracking-widest text-slate-400 uppercase mb-7" style={{ fontFamily: 'sans-serif', letterSpacing: '2px' }}>
                            In Recognition of Outstanding Service
                        </p>

                        <div style={{ width: 80, height: 3, background: `linear-gradient(90deg,transparent,${accentColor},transparent)`, margin: '0 auto 28px' }} />

                        <p className="text-slate-600 mb-1" style={{ fontSize: 16, lineHeight: 1.9, fontFamily: 'Georgia, serif' }}>
                            This certificate is proudly presented to
                        </p>
                        <p className="text-3xl font-bold italic mb-2" style={{ color: '#0f172a', fontFamily: 'Georgia, serif' }}>
                            {user.organizationName || user.name}
                        </p>
                        <span className="inline-block text-white text-xs rounded-full px-4 py-1 mb-5" style={{ background: accentColor, fontFamily: 'sans-serif' }}>
                            {roleLabel}
                        </span>
                        <p className="text-slate-500 text-sm mb-8" style={{ fontFamily: 'sans-serif' }}>
                            in acknowledgement of their outstanding contribution through {actionText},<br />
                            making a meaningful difference in the lives of people in our community.
                        </p>

                        {/* Impact Stats */}
                        <div className="flex justify-center gap-14 mb-7">
                            {[
                                { value: donations, label: stat1Label },
                                { value: meals, label: 'Meals Provided' },
                                { value: `${kg} kg`, label: 'Food Rescued' },
                            ].map(({ value, label }) => (
                                <div key={label} className="text-center">
                                    <div className="text-3xl font-bold" style={{ color: accentColor, fontFamily: 'sans-serif' }}>{value}</div>
                                    <div className="text-xs text-slate-400 uppercase tracking-wider mt-1" style={{ fontFamily: 'sans-serif' }}>{label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Karma Badge */}
                        <div className="text-center mb-8">
                            <span className="inline-block text-white text-sm rounded-full px-5 py-2" style={{ background: `linear-gradient(135deg,${accentColor},${accentColor}bb)`, fontFamily: 'sans-serif' }}>
                                ⭐ {user.karmaPoints ?? 0} Karma Points · Level {user.level ?? 1} Contributor
                            </span>
                        </div>

                        {/* Footer */}
                        <div style={{ borderTop: `1px solid ${lightBorder}`, paddingTop: 20 }} className="flex justify-between items-end">
                            <div>
                                <div style={{ width: 160, borderBottom: '1px solid #d1d5db', marginBottom: 6 }} />
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

// ─── Main Profile Component ───────────────────────────────────────────────────

export default function Profile() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [showCertificate, setShowCertificate] = useState(false)
    const [formData, setFormData] = useState({ name: '', phoneNumber: '', address: '', organizationName: '' })

    useEffect(() => { loadProfile() }, [])

    const loadProfile = async () => {
        setLoading(true); setError(null)
        try {
            const token = localStorage.getItem('token')
            if (!token) throw new Error('No authentication token found')
            const data = await getUserProfile()
            if (!data) throw new Error('getUserProfile returned null or undefined')
            if (!data.id) throw new Error('User data is missing id field')
            setUser(data)
            setFormData({ name: data.name || '', phoneNumber: data.phoneNumber || data.phone || '', address: data.address || '', organizationName: data.organizationName || '' })
        } catch (err: any) {
            const msg = err?.message || err?.response?.data?.message || 'Failed to load profile'
            setError(msg)
            if (err?.response?.status === 401 || msg.includes('token')) {
                setTimeout(() => { localStorage.clear(); window.location.href = '/login' }, 2000)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const updated = await updateUserProfile(formData)
            setUser(updated); localStorage.setItem('user', JSON.stringify(updated)); setEditing(false)
        } catch (error: any) {
            alert('Failed to update profile: ' + (error.message || 'Unknown error'))
        } finally { setSaving(false) }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
                <p className="text-slate-400 text-xl">Loading profile...</p>
            </div>
        </div>
    )

    if (error) return (
        <div className="flex items-center justify-center min-h-screen p-6">
            <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-xl p-8 text-center">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Failed to Load Profile</h2>
                <p className="text-red-400 mb-6">{error}</p>
                <div className="space-y-3">
                    <button onClick={loadProfile} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-medium py-3 px-6 rounded-lg transition-colors">Try Again</button>
                    <button onClick={() => { localStorage.clear(); window.location.href = '/login' }} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 px-6 rounded-lg transition-colors">Back to Login</button>
                </div>
                <div className="mt-6 p-4 bg-slate-950 rounded-lg text-left">
                    <p className="text-xs text-slate-400 font-mono"><strong>Debug Info:</strong><br />Token: {localStorage.getItem('token') ? '✓ Present' : '✗ Missing'}<br />Error: {error}</p>
                </div>
            </div>
        </div>
    )

    if (!user) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <p className="text-slate-400 text-xl">No user data available</p>
                <button onClick={loadProfile} className="mt-4 bg-emerald-500 hover:bg-emerald-400 text-white font-medium py-2 px-6 rounded-lg transition-colors">Reload</button>
            </div>
        </div>
    )

    const karmaPoints = user.karmaPoints || 0
    const badges = user.badges || []
    const level = user.level || 1
    const nextLevelPoints = user.nextLevelPoints || 0
    const progressPercent = nextLevelPoints > 0 ? Math.min(100, ((karmaPoints % 100) / nextLevelPoints) * 100) : 100

    const roleStr = String(user.role).toLowerCase()

    const getRoleBadge = () => {
        const badgeMap = {
            donor: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Donor' },
            ngo: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'NGO' },
            volunteer: { bg: 'bg-purple-500/10', text: 'text-purple-400', label: 'Volunteer' }
        }
        return badgeMap[roleStr as keyof typeof badgeMap] || badgeMap.donor
    }
    const badge = getRoleBadge()

    const certLabel = roleStr === 'ngo'
        ? 'Impact Report'
        : roleStr === 'volunteer'
            ? 'Volunteer Certificate'
            : 'My Certificate'

    const certDesc = roleStr === 'ngo'
        ? 'Download your NGO impact report for grants and funding applications'
        : roleStr === 'volunteer'
            ? 'Download your volunteer certificate to share on LinkedIn'
            : 'Download your personalised impact certificate to share with your network'

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {showCertificate && <CertificateModal user={user} onClose={() => setShowCertificate(false)} />}

            {/* Header */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white">
                            {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{user.organizationName || user.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>{badge.label}</span>
                                {user.isVerified && (
                                    <span className="flex items-center gap-1 text-xs text-emerald-400">
                                        <Shield className="w-3 h-3" />Verified
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Certificate button available to ALL roles */}
                        <button
                            onClick={() => setShowCertificate(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-emerald-900/30"
                        >
                            <Award className="w-4 h-4" />
                            {certLabel}
                        </button>
                        <button
                            onClick={() => editing ? handleSave() : setEditing(true)}
                            disabled={saving}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${editing ? 'bg-emerald-500 hover:bg-emerald-400 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                        >
                            {editing ? (
                                <span className="flex items-center gap-2"><Check className="w-4 h-4" />{saving ? 'Saving...' : 'Save Changes'}</span>
                            ) : (
                                <span className="flex items-center gap-2"><Edit2 className="w-4 h-4" />Edit Profile</span>
                            )}
                        </button>
                    </div>
                </div>
                <p className="text-slate-400">Manage your account and view your impact</p>
            </div>

            {/* Certificate CTA Banner (all roles) */}
            <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 rounded-xl p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🏅</div>
                    <div>
                        <p className="text-white font-semibold">Certificate of Appreciation</p>
                        <p className="text-slate-400 text-sm">{certDesc}</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowCertificate(true)}
                    className="flex-shrink-0 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                    <Download className="w-4 h-4" />Download
                </button>
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
                    <div className="text-sm opacity-90">Level {level} • {badge.label}</div>
                </div>
                {nextLevelPoints > 0 && (
                    <div className="mt-6">
                        <div className="flex justify-between text-sm mb-2">
                            <span>Progress to Level {level + 1}</span>
                            <span>{nextLevelPoints} points to go</span>
                        </div>
                        <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
                            <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                        </div>
                    </div>
                )}
            </div>

            {/* Trophy Case */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-400" />Trophy Case
                </h2>
                {badges.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <p className="text-lg mb-2">No badges earned yet</p>
                        <p className="text-sm">Earn 10 karma points to get your first badge!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {badges.map((badgeText, index) => (
                            <div key={index} className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-lg p-4 text-center">
                                <div className="text-4xl mb-2">{badgeText.split(' ')[0]}</div>
                                <div className="font-semibold text-white text-sm">{badgeText.split(' ').slice(1).join(' ')}</div>
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
                        <label className="flex items-center gap-2 text-sm text-slate-400 mb-2"><UserIcon className="w-4 h-4" />Full Name</label>
                        {editing ? <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none" /> : <p className="text-white">{user.name}</p>}
                    </div>
                    <div>
                        <label className="flex items-center gap-2 text-sm text-slate-400 mb-2"><Mail className="w-4 h-4" />Email</label>
                        <p className="text-white">{user.email}</p>
                        <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                        <label className="flex items-center gap-2 text-sm text-slate-400 mb-2"><Phone className="w-4 h-4" />Phone Number</label>
                        {editing ? <input type="tel" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none" /> : <p className="text-white">{user.phoneNumber || user.phone || 'Not provided'}</p>}
                    </div>
                    {(roleStr === 'donor' || roleStr === 'ngo') && (
                        <>
                            <div>
                                <label className="flex items-center gap-2 text-sm text-slate-400 mb-2"><Building className="w-4 h-4" />Organization Name</label>
                                {editing ? <input type="text" value={formData.organizationName} onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none" /> : <p className="text-white">{user.organizationName || 'Not provided'}</p>}
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm text-slate-400 mb-2"><MapPin className="w-4 h-4" />Address</label>
                                {editing ? <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={3} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none resize-none" /> : <p className="text-white">{user.address || 'Not provided'}</p>}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Badge Guide — thresholds MUST match backend BADGE_RULES exactly */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">📚 Badge Guide</h2>
                <div className="space-y-3">
                    {[
                        { e: '🌱', n: 'Newcomer', p: 10 },
                        { e: '🦸', n: 'Local Hero', p: 50 },
                        { e: '🏆', n: 'Champion', p: 150 },
                        { e: '⭐', n: 'Legend', p: 300 },
                        { e: '💫', n: 'Superhero', p: 500 },
                    ].map(b => (
                        <div key={b.n} className="flex items-center space-x-3">
                            <span className="text-2xl">{b.e}</span>
                            <div>
                                <div className="font-semibold text-white">{b.n}</div>
                                <div className="text-sm text-slate-400">Earn {b.p} karma points</div>
                            </div>
                            {karmaPoints >= b.p && (
                                <span className="ml-auto text-xs text-emerald-400 font-semibold">✓ Earned</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* How to Earn Karma */}
            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">💡 How to Earn Karma</h2>
                <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                        <span className="text-emerald-400 font-bold text-lg">+10</span>
                        <div><div className="font-semibold text-white">Create a Donation</div><div className="text-sm text-slate-400">Donor lists new food for redistribution</div></div>
                    </div>
                    <div className="flex items-start space-x-3">
                        <span className="text-emerald-400 font-bold text-lg">+10</span>
                        <div><div className="font-semibold text-white">Claim a Donation</div><div className="text-sm text-slate-400">NGO claims available food</div></div>
                    </div>
                    <div className="flex items-start space-x-3">
                        <span className="text-emerald-400 font-bold text-lg">+30</span>
                        <div><div className="font-semibold text-white">Donation Delivered (Donor)</div><div className="text-sm text-slate-400">Your donated food is successfully delivered</div></div>
                    </div>
                    <div className="flex items-start space-x-3">
                        <span className="text-emerald-400 font-bold text-lg">+20</span>
                        <div><div className="font-semibold text-white">Donation Delivered (NGO)</div><div className="text-sm text-slate-400">Food you claimed is marked as delivered</div></div>
                    </div>
                    <div className="flex items-start space-x-3">
                        <span className="text-emerald-400 font-bold text-lg">+50</span>
                        <div><div className="font-semibold text-white">Volunteer Delivery</div><div className="text-sm text-slate-400">Complete a food delivery as a volunteer</div></div>
                    </div>
                </div>
            </div>

            {!user.isVerified && roleStr === 'ngo' && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <p className="text-sm text-amber-400 mb-2">⏳ Verification Pending</p>
                    <p className="text-xs text-slate-400">Your NGO account is under review. You'll receive access once verified by our team.</p>
                </div>
            )}
        </div>
    )
}