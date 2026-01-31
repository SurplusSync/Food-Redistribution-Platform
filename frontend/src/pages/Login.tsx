import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser } from '../services/api'
import { Utensils, ChevronRight, Check } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const user = await loginUser(email)
      localStorage.setItem('user', JSON.stringify(user))
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    'Connect donors with NGOs',
    'Real-time food tracking',
    'Reduce food waste together',
    'Make a social impact'
  ]

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 p-12 flex-col justify-between border-r border-slate-800">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Utensils className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Surplus<span className="text-emerald-400">Sync</span>
              </h1>
              <p className="text-sm text-slate-400">Food Redistribution Platform</p>
            </div>
          </div>

          {/* Hero Content */}
          <div className="max-w-md">
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Transform surplus into <span className="text-emerald-400">sustenance</span>
            </h2>
            <p className="text-lg text-slate-400 mb-8">
              Join thousands of donors, NGOs, and volunteers making a difference in the fight against food waste.
            </p>

            {/* Features */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-slate-300">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-3xl font-bold text-emerald-400">50K+</p>
            <p className="text-sm text-slate-400">Meals Saved</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-3xl font-bold text-emerald-400">1,200+</p>
            <p className="text-sm text-slate-400">Active Donors</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-3xl font-bold text-emerald-400">95%</p>
            <p className="text-sm text-slate-400">Success Rate</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-950">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">
                Surplus<span className="text-emerald-400">Sync</span>
              </h1>
            </div>
            <p className="text-sm text-slate-400">Food Redistribution Platform</p>
          </div>

          {/* Login Card */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-800 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
              <p className="text-slate-400">Sign in to continue making a difference</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-400 text-xs font-bold">!</span>
                </div>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-400">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Create account
                </Link>
              </p>
            </div>

            {/* Demo accounts info */}
            <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-xs font-medium text-slate-300 mb-2">Demo Accounts:</p>
              <div className="space-y-1 text-xs text-slate-400">
                <p>• <span className="text-emerald-400">Donor:</span> donor@example.com</p>
                <p>• <span className="text-blue-400">NGO:</span> ngo@example.com</p>
                <p>• <span className="text-purple-400">Volunteer:</span> volunteer@example.com</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-500 mt-6">
            By signing in, you agree to our <span className="text-slate-400">Terms of Service</span> and <span className="text-slate-400">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  )
}