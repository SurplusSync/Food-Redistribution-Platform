import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { registerUser, type UserRole } from '../services/api'
import { Store, Building2, Car, ArrowRight, AlertCircle, Upload, Utensils, Shield, Zap, BarChart3 } from 'lucide-react'

export default function Register() {
    const { t } = useTranslation()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'DONOR' as UserRole,
        organizationName: '',
        organizationType: '',
        address: '',
    })
    const [certificateFile, setCertificateFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            let payload: any

            if (formData.role === 'NGO' || certificateFile) {
                const fd = new FormData()
                fd.append('name', formData.name)
                fd.append('email', formData.email)
                fd.append('password', formData.password)
                fd.append('phone', formData.phone)
                fd.append('role', formData.role)
                fd.append('organizationName', formData.organizationName)
                fd.append('organizationType', formData.organizationType)
                fd.append('address', formData.address)
                if (certificateFile) {
                    fd.append('certificate', certificateFile)
                }
                payload = fd
            } else {
                payload = formData
            }

            const data = await registerUser(payload)

            // Save Token and User
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))

            navigate('/dashboard')
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'Registration failed'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    const roles = [
        { id: 'DONOR', label: t('donor'), desc: t('shareSurplusFood'), icon: Store },
        { id: 'NGO', label: t('ngo'), desc: t('collectDistribute'), icon: Building2 },
        { id: 'VOLUNTEER', label: t('volunteer'), desc: t('helpWithTransport'), icon: Car },
    ]

    const features = [
        { icon: Shield, text: t('foodSafetyAutoValidation') },
        { icon: Zap, text: t('realTimeStatusTracking') },
        { icon: BarChart3, text: t('impactAnalytics') },
    ]

    const showOrganizationFields = formData.role === 'DONOR' || formData.role === 'NGO'

    const inputClass = "w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"

    return (
        <div className="min-h-screen bg-slate-950 flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-[42%] relative overflow-hidden">
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
                                <p className="text-sm text-slate-500">{t('foodRedistributionPlatform')}</p>
                            </div>
                        </div>

                        <div className="max-w-md">
                            <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight tracking-tight">
                                {t('joinFightFoodWaste')} <span className="shimmer-text">{t('welcome')}</span>
                            </h2>
                            <p className="text-lg text-slate-400 mb-10 leading-relaxed">
                                {t('createAccountAndImpact')}
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
                        {[
                            { value: t('mealsSavedStat'), label: t('mealsSaved') },
                            { value: t('activeDonorsStat'), label: t('activeDonors') },
                            { value: t('partnerNGOsStat'), label: t('partnerNGOs') },
                        ].map((stat, i) => (
                            <div key={i}>
                                <p className="text-2xl font-extrabold text-white tracking-tight">{stat.value}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 relative overflow-y-auto">
                {/* Subtle dot grid */}
                <div className="absolute inset-0 dot-grid pointer-events-none opacity-50" />

                <div className="w-full max-w-xl relative z-10 my-4">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2.5 mb-6 justify-center">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Utensils className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">
                            Surplus<span className="text-emerald-400">Sync</span>
                        </span>
                    </div>

                    <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800/80 p-6 sm:p-8 glow-card">
                        <h2 className="text-2xl font-extrabold text-white mb-1">{t('createYourAccount')}</h2>
                        <p className="text-slate-400 mb-6">{t('startMakingDifference')}</p>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        )}

                        <form onSubmit={onSubmit} className="space-y-5">
                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-3">{t('joinAs')}</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {roles.map((role) => {
                                        const Icon = role.icon
                                        const active = formData.role === role.id
                                        return (
                                            <button
                                                key={role.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, role: role.id as UserRole })}
                                                className={`p-4 rounded-xl border-2 text-center transition-all ${active
                                                    ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                                                    : 'border-slate-700/60 bg-slate-800/40 hover:border-slate-600'
                                                    }`}
                                            >
                                                <Icon className={`w-7 h-7 mx-auto mb-2 ${active ? 'text-emerald-400' : 'text-slate-500'}`} />
                                                <div className={`font-semibold text-sm ${active ? 'text-white' : 'text-slate-300'}`}>{role.label}</div>
                                                <div className={`text-xs mt-0.5 ${active ? 'text-emerald-400/70' : 'text-slate-600'}`}>{role.desc}</div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">{t('yourName')}</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder={t('namePlaceholder')} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">{t('phone')}</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder={t('phonePlaceholder')} className={inputClass} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">{t('email')}</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder={t('emailPlaceholder')} className={inputClass} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">{t('password')}</label>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder={t('minSixChars')} className={inputClass} />
                            </div>

                            {showOrganizationFields && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">{formData.role === 'DONOR' ? t('businessName') : t('organizationName')}</label>
                                        <input type="text" name="organizationName" value={formData.organizationName} onChange={handleChange} required placeholder={formData.role === 'DONOR' ? t('restaurantNamePlaceholder') : t('ngoNamePlaceholder')} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">{t('address')}</label>
                                        <textarea name="address" value={formData.address} onChange={handleChange} required placeholder={t('fullAddressPlaceholder')} className={`${inputClass} resize-none`} rows={2} />
                                    </div>
                                </>
                            )}

                            {formData.role === 'NGO' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">{t('registrationCertificate')} <span className="text-red-400">*</span></label>
                                    <div className="flex items-center gap-3">
                                        <label className="flex items-center gap-2 cursor-pointer bg-slate-800/60 border border-slate-700/60 hover:border-emerald-500/50 rounded-xl px-4 py-3 text-slate-300 transition-all flex-1">
                                            <Upload className="w-5 h-5 text-emerald-400" />
                                            <span className="text-sm">{certificateFile ? certificateFile.name : t('uploadCertificate')}</span>
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                className="hidden"
                                                onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
                                                required
                                            />
                                        </label>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1.5">{t('acceptedFormats')}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all text-base"
                            >
                                {loading ? t('creating') : <><span>{t('createAccount')}</span> <ArrowRight className="w-5 h-5" /></>}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-400">{t('alreadyHaveAccount')} <Link to="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">{t('signIn')}</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}