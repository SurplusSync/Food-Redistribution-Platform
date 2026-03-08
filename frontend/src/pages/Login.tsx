import { useState } from 'react'
import { Link } from 'react-router-dom'
import { loginUser } from '../services/api'
import { Utensils, ChevronRight, Check, ArrowRight, Heart, Users, Globe } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      // Pass both email AND password to the real API
      const data = await loginUser(email, password)

      // Save Token and User
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Route based on role.
      // Use full navigation so App re-reads localStorage auth state immediately.
      if (data.user.role === 'ADMIN') {
        window.location.replace('/admin-dashboard')
      } else {
        window.location.replace('/dashboard')
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string }
      const msg = axiosErr.response?.data?.message || axiosErr.message || 'Login failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { text: 'Connect donors with NGOs', icon: Users },
    { text: 'Real-time food tracking', icon: Globe },
    { text: 'Reduce food waste together', icon: Heart },
    { text: 'Make a social impact', icon: Check },
  ]

  const stats = [
    { value: '10,000+', label: 'Meals saved' },
    { value: '500+', label: 'Active donors' },
    { value: '120+', label: 'Partner NGOs' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="landing-blob landing-blob-1" style={{ opacity: 0.1 }} />
          <div className="landing-blob landing-blob-2" style={{ opacity: 0.08 }} />
        </div>

        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 p-12 flex flex-col justify-between auth-gradient-bg w-full border-r border-slate-800/50">
          <div>
            <div className="flex items-center gap-3 mb-14">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Surplus<span className="text-emerald-400">Sync</span>
                </h1>
                <p className="text-sm text-slate-500">Food Redistribution Platform</p>
              </div>
            </div>

            <div className="max-w-md">
              <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight tracking-tight">
                Transform surplus into <span className="shimmer-text">sustenance</span>
              </h2>
              <p className="text-lg text-slate-400 mb-10 leading-relaxed">
                Join thousands of donors, NGOs, and volunteers making a difference in the fight against food waste.
              </p>

              <div className="space-y-4 mb-12">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                      <feature.icon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-slate-300 font-medium">{feature.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex gap-6 pt-6 border-t border-slate-800/40">
            {stats.map((stat, i) => (
              <div key={i}>
                <p className="text-2xl font-extrabold text-white tracking-tight">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 relative">
        {/* Subtle dot grid on right too */}
        <div className="absolute inset-0 dot-grid pointer-events-none opacity-50" />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Utensils className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Surplus<span className="text-emerald-400">Sync</span>
            </span>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800/80 p-8 glow-card">
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-white mb-2">Welcome back</h2>
              <p className="text-slate-400">Sign in to continue making a difference</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                <span className="text-red-400 font-bold text-lg leading-none">!</span>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 flex items-center justify-center gap-2 text-base"
              >
                {loading ? 'Signing in...' : <><span>Sign in</span> <ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-400">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">Create account</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}