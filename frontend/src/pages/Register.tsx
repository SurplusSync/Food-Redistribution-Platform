import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser, type UserRole } from '../services/api'
import { Store, Building2, Car, ChevronRight, AlertCircle, Upload } from 'lucide-react'

export default function Register() {
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
        { id: 'DONOR', label: 'Donor', desc: 'Share surplus food', icon: Store },
        { id: 'NGO', label: 'NGO', desc: 'Collect and distribute', icon: Building2 },
        { id: 'VOLUNTEER', label: 'Volunteer', desc: 'Help with transport', icon: Car },
    ]

    const showOrganizationFields = formData.role === 'DONOR' || formData.role === 'NGO'

    return (
        <div className="min-h-screen bg-slate-950 p-4 flex items-center justify-center">
            <div className="w-full max-w-2xl bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-800 p-8">
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
                                        className={`p-4 rounded-xl border-2 text-center transition-all ${formData.role === role.id
                                                ? 'border-emerald-500 bg-emerald-500/10'
                                                : 'border-slate-700 bg-slate-800/50'
                                            }`}
                                    >
                                        <Icon className={`w-8 h-8 mx-auto mb-2 ${formData.role === role.id ? 'text-emerald-400' : 'text-slate-500'}`} />
                                        <div className="text-white font-semibold">{role.label}</div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Your Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" />
                    </div>

                    {/* NEW PASSWORD FIELD */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" placeholder="Min 6 characters" />
                    </div>

                    {showOrganizationFields && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">{formData.role === 'DONOR' ? 'Business Name' : 'Organization Name'}</label>
                                <input type="text" name="organizationName" value={formData.organizationName} onChange={handleChange} required className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Address</label>
                                <textarea name="address" value={formData.address} onChange={handleChange} required className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none resize-none" rows={2} />
                            </div>
                        </>
                    )}

                    {formData.role === 'NGO' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Registration Certificate <span className="text-red-400">*</span></label>
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-800 border border-slate-700 hover:border-emerald-500 rounded-xl px-4 py-3 text-slate-300 transition-colors">
                                    <Upload className="w-5 h-5 text-emerald-400" />
                                    <span>{certificateFile ? certificateFile.name : 'Upload Certificate'}</span>
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        className="hidden"
                                        onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
                                        required
                                    />
                                </label>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Accepted formats: Images or PDF</p>
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2">
                        {loading ? 'Creating...' : <><span>Create account</span> <ChevronRight className="w-5 h-5" /></>}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-400">Already have an account? <Link to="/login" className="font-semibold text-emerald-400 hover:text-emerald-300">Sign in</Link></p>
                </div>
            </div>
        </div>
    )
}