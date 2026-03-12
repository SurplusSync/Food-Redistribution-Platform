import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Utensils, ChevronDown, Store, Building2, Car, MapPin, Shield, Zap, BarChart3, Heart, ClipboardList, Search, Truck, Package, Quote, Users, Globe, Award, Sun, Moon, Languages } from 'lucide-react'

// Animated Counter Hook
function useCountUp(target: number, duration = 2000) {
    const [count, setCount] = useState(0)
    const ref = useRef<HTMLDivElement>(null)
    const started = useRef(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true
                    const startTime = Date.now()
                    const tick = () => {
                        const elapsed = Date.now() - startTime
                        const progress = Math.min(elapsed / duration, 1)
                        const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
                        setCount(Math.floor(eased * target))
                        if (progress < 1) requestAnimationFrame(tick)
                    }
                    requestAnimationFrame(tick)
                }
            },
            { threshold: 0.3 }
        )
        if (ref.current) observer.observe(ref.current)
        return () => observer.disconnect()
    }, [target, duration])

    return { count, ref }
}

// Dat
// Data (keys only - translated inside component via t())
const roleConfigs = [
    {
        titleKey: 'donor',
        subtitleKey: 'donorSubtitle',
        descriptionKey: 'donorDesc',
        color: 'emerald',
        Icon: Store,
        stats: [
            { labelKey: 'avgListingTime', valueKey: 'lessThan2Min' },
            { labelKey: 'safetyValidated', valueKey: 'hundredPercent' },
        ],
    },
    {
        titleKey: 'ngo',
        subtitleKey: 'ngoSubtitle',
        descriptionKey: 'ngoDesc',
        color: 'blue',
        Icon: Building2,
        stats: [
            { labelKey: 'geoFiltered', valueKey: 'fiveKm' },
            { labelKey: 'capacityTracked', valueKey: 'daily' },
        ],
    },
    {
        titleKey: 'volunteer',
        subtitleKey: 'volunteerSubtitle',
        descriptionKey: 'volunteerDesc',
        color: 'purple',
        Icon: Car,
        stats: [
            { labelKey: 'statusUpdates', valueKey: 'realTime' },
            { labelKey: 'impactTracked', valueKey: 'always' },
        ],
    },
]

const stepConfigs = [
    { icon: ClipboardList, titleKey: 'stepList', descKey: 'stepListDesc', color: 'emerald' },
    { icon: Search, titleKey: 'stepDiscover', descKey: 'stepDiscoverDesc', color: 'blue' },
    { icon: Truck, titleKey: 'stepPickup', descKey: 'stepPickupDesc', color: 'amber' },
    { icon: Package, titleKey: 'stepDeliver', descKey: 'stepDeliverDesc', color: 'purple' },
]

const testimonialConfigs = [
    {
        quoteKey: 'testimonial1Quote',
        nameKey: 'testimonial1Name',
        roleKey: 'testimonial1Role',
        avatar: '👩‍🍳',
    },
    {
        quoteKey: 'testimonial2Quote',
        nameKey: 'testimonial2Name',
        roleKey: 'testimonial2Role',
        avatar: '👨‍💼',
    },
    {
        quoteKey: 'testimonial3Quote',
        nameKey: 'testimonial3Name',
        roleKey: 'testimonial3Role',
        avatar: '👩‍🎓',
    },
]

// Componen─
export default function LandingPage() {
    const { t, i18n } = useTranslation()
    const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))
    const [langOpen, setLangOpen] = useState(false)
    const meals = useCountUp(10000)
    const donors = useCountUp(500)
    const ngos = useCountUp(120)
    const volunteers = useCountUp(300)

    const toggleTheme = () => {
        const next = !isDark
        setIsDark(next)
        document.documentElement.classList.toggle('dark', next)
        localStorage.setItem('theme', next ? 'dark' : 'light')
    }

    const langs = [
        { code: 'en', label: 'English' },
        { code: 'hi', label: 'हिन्दी' },
        { code: 'ta', label: 'தமிழ்' },
    ]

    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
        emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
        blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
        purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
        amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white overflow-x-hidden">
            {/* Animated background blobs */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="landing-blob landing-blob-1" />
                <div className="landing-blob landing-blob-2" />
                <div className="landing-blob landing-blob-3" />
            </div>

            {/* Dot grid overlay */}
            <div className="fixed inset-0 pointer-events-none dot-grid" />

            {/* ════════ NAVBAR ════════ */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/70 backdrop-blur-2xl border-b border-gray-200/60 dark:border-slate-800/40">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                            <Utensils className="w-4.5 h-4.5 text-white" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">
                            Surplus<span className="text-emerald-400">Sync</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Language picker */}
                        <div className="relative">
                            <button
                                onClick={() => setLangOpen(!langOpen)}
                                className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                                aria-label={t('selectLanguage')}
                            >
                                <Languages className="w-4.5 h-4.5" />
                            </button>
                            {langOpen && (
                                <div className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl p-1.5 min-w-[140px] z-50">
                                    {langs.map(l => (
                                        <button
                                            key={l.code}
                                            onClick={() => { i18n.changeLanguage(l.code); setLangOpen(false) }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                                i18n.language === l.code
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium'
                                                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            {l.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Theme toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label={t('darkMode')}
                        >
                            {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
                        </button>

                        <Link
                            to="/login"
                            className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            {t('signIn')}
                        </Link>
                        <Link
                            to="/register"
                            className="px-5 py-2.5 text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                        >
                            {t('getStarted')}
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ════════ HERO ════════ */}
            <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6">
                <div className="max-w-4xl mx-auto text-center reveal-section">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.08] mb-6 tracking-tight">
                        {t('heroTitle1')}<br />
                        <span className="shimmer-text">{t('heroTitle2')}</span>
                    </h1>

                    <p className="text-lg sm:text-xl text-gray-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        {t('heroSubtitle')}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/register"
                            className="group pulse-cta w-full sm:w-auto px-10 py-4 bg-emerald-500 hover:bg-emerald-400 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-2xl shadow-emerald-500/25"
                        >
                            {t('joinMovement')}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/login"
                            className="w-full sm:w-auto px-10 py-4 rounded-2xl font-semibold bg-white dark:bg-slate-900/80 border border-gray-300 dark:border-slate-700 hover:border-gray-400 dark:hover:border-gray-400 dark:border-slate-500 transition-all backdrop-blur-sm text-center"
                        >
                            {t('signIn')}
                        </Link>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-gray-400 dark:text-slate-600">
                    <ChevronDown className="w-6 h-6" />
                </div>
            </section>

            {/* ════════ COUNTER STATS BAR ════════ */}
            <section className="py-10 border-y border-gray-200/60 dark:border-slate-800/40 bg-gray-50/60 dark:bg-slate-900/30 backdrop-blur-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    {[
                        { ref: meals.ref, count: meals.count, suffix: '+', label: t('mealsRedistributed'), icon: Heart },
                        { ref: donors.ref, count: donors.count, suffix: '+', label: t('activeDonors'), icon: Users },
                        { ref: ngos.ref, count: ngos.count, suffix: '+', label: t('partnerNGOs'), icon: Globe },
                        { ref: volunteers.ref, count: volunteers.count, suffix: '+', label: t('volunteers'), icon: Award },
                    ].map((stat, i) => (
                        <div key={i} ref={stat.ref} className="text-center reveal-section">
                            <stat.icon className="w-6 h-6 text-emerald-400 mx-auto mb-2 opacity-60" />
                            <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                {stat.count.toLocaleString()}{stat.suffix}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-slate-500 mt-1 font-medium">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ════════ HOW IT WORKS ════════ */}
            <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14 reveal-section">
                        <p className="text-sm font-medium text-emerald-400 uppercase tracking-widest mb-3">{t('howItWorks')}</p>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                            {t('fourSimpleSteps')}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {stepConfigs.map((step, i) => {
                            const c = colorMap[step.color]
                            return (
                                <div key={step.titleKey} className={`reveal-section reveal-delay-${i + 1}`}>
                                    <div className="bento-card p-6 text-center h-full">
                                        {/* Step number */}
                                        <div className="text-xs font-bold text-gray-400 dark:text-slate-600 uppercase tracking-widest mb-4">
                                            Step {i + 1}
                                        </div>

                                        <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${c.bg}`}>
                                            <step.icon className={`w-7 h-7 ${c.text}`} />
                                        </div>
                                        <h3 className="text-lg font-bold mb-2">{t(step.titleKey)}</h3>
                                        <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{t(step.descKey)}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* ════════ FLOW STRIP ════════ */}
            <section className="py-4 border-y border-gray-200/60 dark:border-slate-800/40 overflow-hidden">
                <div className="flex whitespace-nowrap marquee-track" style={{ width: '200%' }}>
                    {[...Array(2)].map((_, setIdx) => (
                        <div key={setIdx} className="flex items-center gap-6 px-3" style={{ width: '50%' }}>
                            {[
                                t('surplusListed'), '→', t('ngoDiscovers'), '→', t('foodClaimed'),
                                '→', t('volunteerPicksUp'), '→', t('delivered'), '→', t('communityFed'), '•',
                            ].map((item, i) => (
                                <span
                                    key={i}
                                    className={`text-sm font-medium ${item === '→' || item === '•' ? 'text-emerald-500/40' : 'text-gray-500 dark:text-slate-400'}`}
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            </section>

            {/* ════════ BENTO ROLE CARDS ════════ */}
            <section id="roles" className="py-20 sm:py-28 px-4 sm:px-6 relative">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14 reveal-section">
                        <p className="text-sm font-medium text-emerald-400 uppercase tracking-widest mb-3">{t('threeRolesOneMission')}</p>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                            {t('everyoneHasAPart')}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                        {roleConfigs.map((role, i) => {
                            const c = colorMap[role.color]
                            return (
                                <div
                                    key={role.titleKey}
                                    className={`bento-card p-6 sm:p-7 reveal-section reveal-delay-${i + 2} ${i === 2 ? 'sm:col-span-2 md:col-span-1' : ''}`}
                                >
                                    <div className={`w-12 h-12 rounded-xl mb-5 flex items-center justify-center ${c.bg}`}>
                                        <role.Icon className={`w-6 h-6 ${c.text}`} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-1">{t(role.titleKey)}</h3>
                                    <p className="text-xs text-gray-500 dark:text-slate-500 font-medium mb-4 uppercase tracking-wider">
                                        {t(role.subtitleKey)}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed mb-6">
                                        {t(role.descriptionKey)}
                                    </p>
                                    <div className="flex gap-3">
                                        {role.stats.map((stat) => (
                                            <div
                                                key={stat.labelKey}
                                                className="flex-1 p-3 rounded-xl bg-gray-100/60 dark:bg-slate-800/40 border border-gray-200/50 dark:border-slate-700/30"
                                            >
                                                <p className={`text-sm font-bold ${c.text}`}>{t(stat.valueKey)}</p>
                                                <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">{t(stat.labelKey)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* ════════ BENTO FEATURES GRID ════════ */}
            <section className="py-20 sm:py-28 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14 reveal-section">
                        <p className="text-sm font-medium text-emerald-400 uppercase tracking-widest mb-3">{t('platformCapabilities')}</p>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                            {t('builtDifferent')}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        {/* Large card - Map */}
                        <div className="bento-card p-6 sm:p-8 md:col-span-4 reveal-section reveal-delay-1">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-slate-500 uppercase tracking-widest mb-2">{t('discovery')}</p>
                                    <h3 className="text-xl font-bold">{t('geoAwareFoodMap')}</h3>
                                </div>
                                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-5 h-5 text-emerald-400" />
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed mb-6">
                                {t('geoMapDesc')}
                            </p>
                            <div className="grid grid-cols-3 gap-3">
                                {[t('fiveKmRadius'), t('realTimePins'), t('routePreview')].map((f) => (
                                    <div key={f} className="text-center p-3 rounded-xl bg-gray-100/50 dark:bg-slate-800/30 border border-gray-200/40 dark:border-slate-700/20">
                                        <p className="text-xs text-gray-500 dark:text-slate-400">{f}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Small card - Safety */}
                        <div className="bento-card p-6 sm:p-8 md:col-span-2 reveal-section reveal-delay-2">
                            <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                                <Shield className="w-5 h-5 text-amber-400" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">{t('foodSafetyEngine')}</h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                                {t('foodSafetyDesc')}
                            </p>
                        </div>

                        {/* Small card - Tracking */}
                        <div className="bento-card p-6 sm:p-8 md:col-span-2 reveal-section reveal-delay-3">
                            <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                                <Zap className="w-5 h-5 text-blue-400" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">{t('liveStatusTracking')}</h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                                {t('liveStatusDesc')}
                            </p>
                        </div>

                        {/* Large card - Impact */}
                        <div className="bento-card p-6 sm:p-8 md:col-span-4 reveal-section reveal-delay-4">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-slate-500 uppercase tracking-widest mb-2">{t('analytics')}</p>
                                    <h3 className="text-xl font-bold">{t('impactDashboard')}</h3>
                                </div>
                                <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                                    <BarChart3 className="w-5 h-5 text-purple-400" />
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed mb-6">
                                {t('impactDashboardDesc')}
                            </p>
                            <div className="flex gap-6">
                                {[
                                    { value: t('co2Label'), label: t('emissionsTracked') },
                                    { value: t('mealsLabel'), label: t('perDonation') },
                                    { value: t('kgLabel'), label: t('foodSaved') },
                                ].map((m) => (
                                    <div key={m.label}>
                                        <p className="text-lg font-bold text-emerald-400">{m.value}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-500">{m.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════ TESTIMONIALS ════════ */}
            <section className="py-20 sm:py-28 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14 reveal-section">
                        <p className="text-sm font-medium text-emerald-400 uppercase tracking-widest mb-3">{t('communityVoices')}</p>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                            {t('trustedByChangemakers')}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {testimonialConfigs.map((item, i) => (
                            <div key={i} className={`testimonial-card p-6 sm:p-7 reveal-section reveal-delay-${i + 1}`}>
                                <Quote className="w-8 h-8 text-emerald-500/30 mb-4" />
                                <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed mb-6 italic">
                                    "{t(item.quoteKey)}"
                                </p>
                                <div className="flex items-center gap-3 pt-4 border-t border-gray-200/60 dark:border-slate-700/40">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-lg">
                                        {item.avatar}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{t(item.nameKey)}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-500">{t(item.roleKey)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════ CTA ════════ */}
            <section className="py-20 sm:py-28 px-4 sm:px-6 relative">
                <div className="max-w-2xl mx-auto text-center reveal-section">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                        <Heart className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
                        {t('everyMealMatters')}
                    </h2>
                    <p className="text-base sm:text-lg text-gray-500 dark:text-slate-400 mb-10 leading-relaxed px-2">
                        {t('everyMealDesc')}
                    </p>
                    <Link
                        to="/register"
                        className="group inline-flex items-center gap-2 px-10 py-4 bg-emerald-500 hover:bg-emerald-400 rounded-2xl font-bold text-lg transition-all shadow-2xl shadow-emerald-500/25 pulse-cta"
                    >
                        {t('startNowFree')}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>

            {/* ════════ FOOTER ════════ */}
            <footer className="py-12 px-4 sm:px-6 border-t border-gray-200/60 dark:border-slate-800/40 bg-gray-50/40 dark:bg-slate-900/20">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8">
                        {/* Brand */}
                        <div>
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                                    <Utensils className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-lg font-bold tracking-tight">
                                    Surplus<span className="text-emerald-400">Sync</span>
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-slate-500 leading-relaxed max-w-xs">
                                {t('footerDesc')}
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-4">{t('platform')}</h4>
                            <div className="space-y-2.5">
                                {[
                                    { label: t('howItWorks'), href: '#how-it-works' },
                                    { label: t('forDonors'), href: '#roles' },
                                    { label: t('forNGOs'), href: '#roles' },
                                    { label: t('forVolunteers'), href: '#roles' }
                                ].map(link => (
                                    <a key={link.label} href={link.href} className="block text-sm text-gray-500 dark:text-slate-500 hover:text-emerald-400 cursor-pointer transition-colors">
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-4">{t('connect')}</h4>
                            <div className="space-y-2.5">
                                <p className="text-sm text-gray-500 dark:text-slate-500">{t('contactEmail')}</p>
                                <a href="https://github.com/SurplusSync/Food-Redistribution-Platform" target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-500 dark:text-slate-500 hover:text-emerald-400 transition-colors">
                                    {t('openSourceProject')}
                                </a>
                                <Link to="/register" className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                                    {t('joinSurplusSync')} <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="pt-8 border-t border-gray-200/60 dark:border-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-400 dark:text-slate-600">
                        <div className="flex items-center gap-2">
                            <Utensils className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>SurplusSync © {new Date().getFullYear()}</span>
                        </div>
                        <p>{t('builtWithLove')}</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
