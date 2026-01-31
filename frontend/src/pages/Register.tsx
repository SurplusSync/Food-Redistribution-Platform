import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'donor',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // For demo, just save to localStorage and redirect
            localStorage.setItem('user', JSON.stringify({
                email: formData.email,
                name: formData.name,
                role: formData.role,
            }))
            navigate('/dashboard')
        } catch (err: any) {
            setError(err.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    const roles = [
        { id: 'donor', label: 'Donor', desc: 'Share surplus food' },
        { id: 'ngo', label: 'NGO', desc: 'Collect and distribute' },
        { id: 'volunteer', label: 'Volunteer', desc: 'Help with transport' },
    ]

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">S</span>
                        </div>
                        <h1 className="text-2xl font-semibold text-white tracking-tight">
                            Surplus<span className="text-emerald-400">Sync</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 text-sm">Join the movement to reduce food waste</p>
                </div>

                {/* Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                    <h2 className="text-xl font-medium text-white mb-6">Create account</h2>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your name"
                                required
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                required
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Role</label>
                            <div className="grid grid-cols-3 gap-2">
                                {roles.map((role) => (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: role.id })}
                                        className={`p-3 rounded-lg border text-center text-sm transition-colors ${formData.role === role.id
                                                ? 'border-emerald-500 bg-emerald-500/10 text-white'
                                                : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                                            }`}
                                    >
                                        {role.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-lg font-medium transition-all bg-emerald-500 hover:bg-emerald-400 text-white disabled:opacity-50 mt-2"
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link to="/" className="text-emerald-400 hover:text-emerald-300">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
