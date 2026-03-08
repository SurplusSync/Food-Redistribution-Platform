import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Utensils, ChevronDown, Store, Building2, Car, MapPin, Shield, Zap, BarChart3, Heart, ClipboardList, Search, Truck, Package, Quote, Users, Globe, Award } from 'lucide-react'

// ─── Animated Counter Hook ─────────────────────────────────────────────────────
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

// ─── Data ───────────────────────────────────────────────────────────────────────
const roles = [
    {
        title: 'Donor',
        subtitle: 'Restaurants · Caterers · Individuals',
        description: 'List surplus food in seconds. Upload photos, set quantities, and our safety engine auto-calculates expiry windows.',
        color: 'emerald',
        Icon: Store,
        stats: [
            { label: 'Avg listing time', value: '< 2 min' },
            { label: 'Safety validated', value: '100%' },
        ],
    },
    {
        title: 'NGO',
        subtitle: 'Food banks · Shelters · Charities',
        description: 'Discover nearby donations on a live map. Claim food, track pickups, and manage your daily intake capacity.',
        color: 'blue',
        Icon: Building2,
        stats: [
            { label: 'Geo-filtered', value: '5 km' },
            { label: 'Capacity tracked', value: 'Daily' },
        ],
    },
    {
        title: 'Volunteer',
        subtitle: 'Drivers · Students · Community',
        description: 'Pick up claimed food from donors and deliver it to NGOs. Track your deliveries and build your impact score.',
        color: 'purple',
        Icon: Car,
        stats: [
            { label: 'Status updates', value: 'Real-time' },
            { label: 'Impact tracked', value: 'Always' },
        ],
    },
]

const steps = [
    { icon: ClipboardList, title: 'List', desc: 'Donor lists surplus food with photos & details', color: 'emerald' },
    { icon: Search, title: 'Discover', desc: 'NGOs find nearby donations on the live map', color: 'blue' },
    { icon: Truck, title: 'Pickup', desc: 'Volunteer picks up food from the donor', color: 'amber' },
    { icon: Package, title: 'Deliver', desc: 'Food reaches the community through NGOs', color: 'purple' },
]

const testimonials = [
    {
        quote: 'SurplusSync has transformed how our restaurant handles excess food. What used to go to waste now feeds families every single day.',
        name: 'Priya Sharma',
        role: 'Restaurant Owner & Donor',
        avatar: '👩‍🍳',
    },
    {
        quote: 'The geo-aware map is a game changer. We can instantly see what\'s available nearby and claim it before it expires.',
        name: 'Ravi Menon',
        role: 'NGO Coordinator',
        avatar: '👨‍💼',
    },
    {
        quote: 'As a college student, volunteering through SurplusSync lets me make a real impact. The tracking features make it seamless.',
        name: 'Ananya Gupta',
        role: 'Student Volunteer',
        avatar: '👩‍🎓',
    },
]

// ─── Component ──────────────────────────────────────────────────────────────────
export default function LandingPage() {
    const meals = useCountUp(10000)
    const donors = useCountUp(500)
    const ngos = useCountUp(120)
    const volunteers = useCountUp(300)

    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
        emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
        blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
        purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
        amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
            {/* Animated background blobs */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="landing-blob landing-blob-1" />
                <div className="landing-blob landing-blob-2" />
                <div className="landing-blob landing-blob-3" />
            </div>

            {/* Dot grid overlay */}
            <div className="fixed inset-0 pointer-events-none dot-grid" />

            {/* ════════ NAVBAR ════════ */}
            <nav className="fixed top-0 w-full z-50 bg-slate-950/70 backdrop-blur-2xl border-b border-slate-800/40">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                            <Utensils className="w-4.5 h-4.5 text-white" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">
                            Surplus<span className="text-emerald-400">Sync</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/login"
                            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                        >
                            Sign in
                        </Link>
                        <Link
                            to="/register"
                            className="px-5 py-2.5 text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ════════ HERO ════════ */}
            <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6">
                <div className="max-w-4xl mx-auto text-center reveal-section">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.08] mb-6 tracking-tight">
                        Food waste is a<br />
                        <span className="shimmer-text">solvable problem</span>
                    </h1>

                    <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        SurplusSync connects donors, NGOs, and volunteers on one platform,
                        turning meals that would be wasted into meals that are shared.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/register"
                            className="group pulse-cta w-full sm:w-auto px-10 py-4 bg-emerald-500 hover:bg-emerald-400 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-2xl shadow-emerald-500/25"
                        >
                            Join the movement
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/login"
                            className="w-full sm:w-auto px-10 py-4 rounded-2xl font-semibold bg-slate-900/80 border border-slate-700 hover:border-slate-500 transition-all backdrop-blur-sm text-center"
                        >
                            Sign in
                        </Link>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-slate-600">
                    <ChevronDown className="w-6 h-6" />
                </div>
            </section>

            {/* ════════ COUNTER STATS BAR ════════ */}
            <section className="py-10 border-y border-slate-800/40 bg-slate-900/30 backdrop-blur-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    {[
                        { ref: meals.ref, count: meals.count, suffix: '+', label: 'Meals Redistributed', icon: Heart },
                        { ref: donors.ref, count: donors.count, suffix: '+', label: 'Active Donors', icon: Users },
                        { ref: ngos.ref, count: ngos.count, suffix: '+', label: 'Partner NGOs', icon: Globe },
                        { ref: volunteers.ref, count: volunteers.count, suffix: '+', label: 'Volunteers', icon: Award },
                    ].map((stat, i) => (
                        <div key={i} ref={stat.ref} className="text-center reveal-section">
                            <stat.icon className="w-6 h-6 text-emerald-400 mx-auto mb-2 opacity-60" />
                            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                                {stat.count.toLocaleString()}{stat.suffix}
                            </p>
                            <p className="text-sm text-slate-500 mt-1 font-medium">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ════════ HOW IT WORKS ════════ */}
            <section className="py-20 sm:py-28 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14 reveal-section">
                        <p className="text-sm font-medium text-emerald-400 uppercase tracking-widest mb-3">How it works</p>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                            Four simple steps
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {steps.map((step, i) => {
                            const c = colorMap[step.color]
                            return (
                                <div key={step.title} className={`reveal-section reveal-delay-${i + 1}`}>
                                    <div className="bento-card p-6 text-center h-full">
                                        {/* Step number */}
                                        <div className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-4">
                                            Step {i + 1}
                                        </div>

                                        <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${c.bg}`}>
                                            <step.icon className={`w-7 h-7 ${c.text}`} />
                                        </div>
                                        <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                                        <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* ════════ FLOW STRIP ════════ */}
            <section className="py-4 border-y border-slate-800/40 overflow-hidden">
                <div className="flex whitespace-nowrap marquee-track" style={{ width: '200%' }}>
                    {[...Array(2)].map((_, setIdx) => (
                        <div key={setIdx} className="flex items-center gap-6 px-3" style={{ width: '50%' }}>
                            {[
                                'Surplus Listed', '→', 'NGO Discovers', '→', 'Food Claimed',
                                '→', 'Volunteer Picks Up', '→', 'Delivered', '→', 'Community Fed', '•',
                            ].map((item, i) => (
                                <span
                                    key={i}
                                    className={`text-sm font-medium ${item === '→' || item === '•' ? 'text-emerald-500/40' : 'text-slate-400'}`}
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            </section>

            {/* ════════ BENTO ROLE CARDS ════════ */}
            <section className="py-20 sm:py-28 px-4 sm:px-6 relative">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14 reveal-section">
                        <p className="text-sm font-medium text-emerald-400 uppercase tracking-widest mb-3">Three roles, one mission</p>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                            Everyone has a part to play
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                        {roles.map((role, i) => {
                            const c = colorMap[role.color]
                            return (
                                <div
                                    key={role.title}
                                    className={`bento-card p-6 sm:p-7 reveal-section reveal-delay-${i + 2} ${i === 2 ? 'sm:col-span-2 md:col-span-1' : ''}`}
                                >
                                    <div className={`w-12 h-12 rounded-xl mb-5 flex items-center justify-center ${c.bg}`}>
                                        <role.Icon className={`w-6 h-6 ${c.text}`} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-1">{role.title}</h3>
                                    <p className="text-xs text-slate-500 font-medium mb-4 uppercase tracking-wider">
                                        {role.subtitle}
                                    </p>
                                    <p className="text-sm text-slate-400 leading-relaxed mb-6">
                                        {role.description}
                                    </p>
                                    <div className="flex gap-3">
                                        {role.stats.map((stat) => (
                                            <div
                                                key={stat.label}
                                                className="flex-1 p-3 rounded-xl bg-slate-800/40 border border-slate-700/30"
                                            >
                                                <p className={`text-sm font-bold ${c.text}`}>{stat.value}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
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
                        <p className="text-sm font-medium text-emerald-400 uppercase tracking-widest mb-3">Platform capabilities</p>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                            Built different
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        {/* Large card - Map */}
                        <div className="bento-card p-6 sm:p-8 md:col-span-4 reveal-section reveal-delay-1">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Discovery</p>
                                    <h3 className="text-xl font-bold">Geo-aware food map</h3>
                                </div>
                                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-5 h-5 text-emerald-400" />
                                </div>
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed mb-6">
                                Interactive map powered by Leaflet showing all available donations in your radius.
                                Filter by distance, food type, and urgency.
                            </p>
                            <div className="grid grid-cols-3 gap-3">
                                {['5 km radius', 'Real-time pins', 'Route preview'].map((f) => (
                                    <div key={f} className="text-center p-3 rounded-xl bg-slate-800/30 border border-slate-700/20">
                                        <p className="text-xs text-slate-400">{f}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Small card - Safety */}
                        <div className="bento-card p-6 sm:p-8 md:col-span-2 reveal-section reveal-delay-2">
                            <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                                <Shield className="w-5 h-5 text-amber-400" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Food safety engine</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Auto-validates expiry windows. High-risk foods require 2+ hours of safe shelf life.
                            </p>
                        </div>

                        {/* Small card - Tracking */}
                        <div className="bento-card p-6 sm:p-8 md:col-span-2 reveal-section reveal-delay-3">
                            <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                                <Zap className="w-5 h-5 text-blue-400" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Live status tracking</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Follow every donation from listing to delivery with real-time status updates.
                            </p>
                        </div>

                        {/* Large card - Impact */}
                        <div className="bento-card p-6 sm:p-8 md:col-span-4 reveal-section reveal-delay-4">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Analytics</p>
                                    <h3 className="text-xl font-bold">Impact dashboard</h3>
                                </div>
                                <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                                    <BarChart3 className="w-5 h-5 text-purple-400" />
                                </div>
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed mb-6">
                                Every meal saved is tracked. See your contribution to reducing CO₂ emissions,
                                total meals redistributed, and community impact over time.
                            </p>
                            <div className="flex gap-6">
                                {[
                                    { value: 'CO₂', label: 'Emissions tracked' },
                                    { value: 'Meals', label: 'Per donation' },
                                    { value: 'Kg', label: 'Food saved' },
                                ].map((m) => (
                                    <div key={m.label}>
                                        <p className="text-lg font-bold text-emerald-400">{m.value}</p>
                                        <p className="text-xs text-slate-500">{m.label}</p>
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
                        <p className="text-sm font-medium text-emerald-400 uppercase tracking-widest mb-3">Community voices</p>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                            Trusted by changemakers
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {testimonials.map((t, i) => (
                            <div key={i} className={`testimonial-card p-6 sm:p-7 reveal-section reveal-delay-${i + 1}`}>
                                <Quote className="w-8 h-8 text-emerald-500/30 mb-4" />
                                <p className="text-sm text-slate-300 leading-relaxed mb-6 italic">
                                    "{t.quote}"
                                </p>
                                <div className="flex items-center gap-3 pt-4 border-t border-slate-700/40">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-lg">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{t.name}</p>
                                        <p className="text-xs text-slate-500">{t.role}</p>
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
                        Every meal matters
                    </h2>
                    <p className="text-base sm:text-lg text-slate-400 mb-10 leading-relaxed px-2">
                        Whether you have food to share, people to feed, or time to volunteer,
                        your action makes a real difference. Join SurplusSync today.
                    </p>
                    <Link
                        to="/register"
                        className="group inline-flex items-center gap-2 px-10 py-4 bg-emerald-500 hover:bg-emerald-400 rounded-2xl font-bold text-lg transition-all shadow-2xl shadow-emerald-500/25 pulse-cta"
                    >
                        Start now, it's free
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>

            {/* ════════ FOOTER ════════ */}
            <footer className="py-12 px-4 sm:px-6 border-t border-slate-800/40 bg-slate-900/20">
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
                            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                                A food redistribution platform connecting surplus food
                                with communities in need. Built to feed communities, not landfills.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Platform</h4>
                            <div className="space-y-2.5">
                                {['How it works', 'For Donors', 'For NGOs', 'For Volunteers'].map(link => (
                                    <p key={link} className="text-sm text-slate-500 hover:text-emerald-400 cursor-pointer transition-colors">{link}</p>
                                ))}
                            </div>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Connect</h4>
                            <div className="space-y-2.5">
                                <p className="text-sm text-slate-500">surplussync@platform.org</p>
                                <p className="text-sm text-slate-500">Open Source Project</p>
                                <Link to="/register" className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                                    Join SurplusSync <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="pt-8 border-t border-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                            <Utensils className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>SurplusSync © {new Date().getFullYear()}</span>
                        </div>
                        <p>Built with ♥ to feed communities</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
