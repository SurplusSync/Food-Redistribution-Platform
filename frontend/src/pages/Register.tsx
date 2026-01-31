import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser, type UserRole } from '../services/api'
import { Utensils, Store, Building2, Car, ChevronRight, AlertCircle } from 'lucide-react'

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'donor' as UserRole,
        organizationName: '',
        organizationType: '',
        address: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const user = await registerUser(formData)
            localStorage.setItem('user', JSON.stringify(user))
            navigate('/dashboard')
        } catch (err: any) {
            setError(err.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    const roles = [
        { 
            id: 'donor', 
            label: 'Donor', 
            desc: 'Share surplus food', 
            icon: Store,
            color: 'emerald'
        },
        { 
            id: 'ngo', 
            label: 'NGO', 
            desc: 'Collect and distribute', 
            icon: Building2,
            color: 'blue'
        },
        { 
            id: 'volunteer', 
            label: 'Volunteer', 
            desc: 'Help with transport', 
            icon: Car,
            color: 'purple'
        },
    ]

    const organizationTypes = {
        donor: ['restaurant', 'hotel', 'canteen', 'event', 'catering', 'grocery', 'bakery'],
        ngo: ['charity', 'shelter', 'community_kitchen', 'food_bank'],
    }

    const showOrganizationFields = formData.role === 'donor' || formData.role === 'ngo'

    return (
        <div className="min-h-screen bg-slate-950 p-4 flex items-center justify-center">
            <div className="w-full max-w-2xl">
                {/* Logo */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Utensils className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">
                            Surplus<span className="text-emerald-400">Sync</span>
                        </h1>
                    </div>
                    <p className="text-slate-400">Join the movement to <span className="text-emerald-400">reduce food waste</span></p>
                </div>

                {/* Card */}
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-800 p-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Create your account</h2>
                    <p className="text-slate-400 mb-6">Start making a <span className="text-emerald-400">difference</span> today</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-6">
                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-3">I want to join as</label>
                            <div className="grid grid-cols-3 gap-3">
                                {roles.map((role) => {
                                    const Icon = role.icon
                                    return (
                                        <button
                                            key={role.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, role: role.id as UserRole })}
                                            className={`p-4 rounded-xl border-2 text-center transition-all ${
                                                formData.role === role.id
                                                    ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20'
                                                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
                                            }`}
                                        >
                                            <Icon className={`w-8 h-8 mx-auto mb-2 ${
                                                formData.role === role.id ? 'text-emerald-400' : 'text-slate-500'
                                            }`} />
                                            <div className={`text-sm font-semibold mb-1 ${
                                                formData.role === role.id ? 'text-white' : 'text-slate-400'
                                            }`}>
                                                {role.label}
                                            </div>
                                            <div className="text-xs text-slate-500">{role.desc}</div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Your Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+91 98765 43210"
                                    required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                required
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                            />
                        </div>

                        {/* Organization Details */}
                        {showOrganizationFields && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        {formData.role === 'donor' ? 'Business Name' : 'Organization Name'}
                                    </label>
                                    <input
                                        type="text"
                                        name="organizationName"
                                        value={formData.organizationName}
                                        onChange={handleChange}
                                        placeholder={formData.role === 'donor' ? 'Green Restaurant' : 'Hope Foundation'}
                                        required
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        {formData.role === 'donor' ? 'Business Type' : 'Organization Type'}
                                    </label>
                                    <select
                                        name="organizationType"
                                        value={formData.organizationType}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all appearance-none"
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
                                            backgroundPosition: 'right 1rem center',
                                            backgroundRepeat: 'no-repeat',
                                            paddingRight: '3rem'
                                        }}
                                    >
                                        <option value="">Select type</option>
                                        {organizationTypes[formData.role as 'donor' | 'ngo']?.map(type => (
                                            <option key={type} value={type}>
                                                {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Address</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Complete address with landmark"
                                        rows={2}
                                        required
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all resize-none"
                                    />
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Creating account...</span>
                                </>
                            ) : (
                                <>
                                    <span>Create account</span>
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-400">
                            Already have an account?{' '}
                            <Link to="/" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>

                    {!loading && formData.role === 'ngo' && (
                        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                            <p className="text-sm text-amber-400">
                                <span className="font-semibold">NGO accounts</span> require verification before accessing the platform
                            </p>
                        </div>
                    )}
                </div>

                <p className="text-center text-xs text-slate-500 mt-4">
                    By creating an account, you agree to our <span className="text-slate-400">Terms of Service</span> and <span className="text-slate-400">Privacy Policy</span>
                </p>
            </div>
        </div>
    )
}