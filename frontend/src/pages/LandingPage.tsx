import { Link } from 'react-router-dom'
import { ArrowRight, Utensils, ChevronDown, Store, Building2, Car, MapPin, Shield, Zap, BarChart3, Heart } from 'lucide-react'

const floatingFoods = [
    { emoji: '🍛', top: '15%', left: '8%', delay: '0s', duration: '7s' },
    { emoji: '🥬', top: '25%', right: '12%', delay: '1.5s', duration: '8s' },
    { emoji: '🍎', top: '60%', left: '5%', delay: '3s', duration: '6s' },
    { emoji: '🥖', top: '70%', right: '7%', delay: '0.5s', duration: '9s' },
    { emoji: '📦', top: '45%', left: '92%', delay: '2s', duration: '7.5s' },
    { emoji: '🥛', top: '80%', left: '45%', delay: '4s', duration: '6.5s' },
    { emoji: '🍲', top: '10%', left: '60%', delay: '1s', duration: '8.5s' },
    { emoji: '🥗', top: '50%', left: '20%', delay: '2.5s', duration: '7s' },
]

const roles = [
    {
        title: 'Donor',
        subtitle: 'Restaurants · Caterers · Individuals',
        description: 'List surplus food in seconds. Upload photos, set quantities, and our safety engine auto-calculates expiry windows.',
        color: 'emerald',
        gradient: 'from-emerald-500/20 to-emerald-600/5',
        border: 'border-emerald-500/20 hover:border-emerald-500/40',
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
        gradient: 'from-blue-500/20 to-blue-600/5',
        border: 'border-blue-500/20 hover:border-blue-500/40',
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
        gradient: 'from-purple-500/20 to-purple-600/5',
        border: 'border-purple-500/20 hover:border-purple-500/40',
        Icon: Car,
        stats: [
            { label: 'Status updates', value: 'Real-time' },
            { label: 'Impact tracked', value: 'Always' },
        ],
    },
]

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
            {/* Animated background blobs */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="landing-blob landing-blob-1" />
                <div className="landing-blob landing-blob-2" />
                <div className="landing-blob landing-blob-3" />
            </div>

            {/* Floating food background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden hidden md:block">
                {floatingFoods.map((food, i) => (
                    <span
                        key={i}
                        className="floating-food"
                        style={{
                            top: food.top,
                            left: food.left,
                            right: (food as any).right,
                            animationDelay: food.delay,
                            animationDuration: food.duration,
                        }}
                    >
                        {food.emoji}
                    </span>
                ))}
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-slate-950/60 backdrop-blur-2xl border-b border-slate-800/40">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                            <Utensils className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">
                            Surplus<span className="text-emerald-400">Sync</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            to="/login"
                            className="px-3 sm:px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                        >
                            Sign in
                        </Link>
                        <Link
                            to="/register"
                            className="px-4 sm:px-5 py-2 text-sm font-semibold bg-white/5 hover:bg-white/10 border border-slate-700 hover:border-slate-500 rounded-lg transition-all"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* HERO — full viewport */}
            <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6">
                <div className="max-w-4xl mx-auto text-center reveal-section">
                    {/* Pill badge */}
                    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 text-xs sm:text-sm text-slate-300 mb-6 sm:mb-8 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                        Redistributing surplus food in real time
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-5 sm:mb-6 tracking-tight">
                        Food waste is a<br />
                        <span className="shimmer-text">solvable problem</span>
                    </h1>

                    <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
                        SurplusSync connects donors, NGOs, and volunteers on one platform,
                        turning meals that would be wasted into meals that are shared.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                        <Link
                            to="/register"
                            className="group pulse-cta w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-2xl shadow-emerald-500/20 text-center"
                        >
                            Join the movement
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/login"
                            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold bg-slate-900/80 border border-slate-700 hover:border-slate-500 transition-all backdrop-blur-sm text-center"
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

            {/* FLOW STRIP */}
            <section className="py-8 sm:py-12 border-y border-slate-800/40 overflow-hidden">
                <div className="flex whitespace-nowrap marquee-track" style={{ width: '200%' }}>
                    {[...Array(2)].map((_, setIdx) => (
                        <div key={setIdx} className="flex items-center gap-4 sm:gap-6 px-3" style={{ width: '50%' }}>
                            {[
                                'Surplus Listed',
                                '→',
                                'NGO Discovers',
                                '→',
                                'Food Claimed',
                                '→',
                                'Volunteer Picks Up',
                                '→',
                                'Delivered',
                                '→',
                                'Community Fed',
                                '•',
                            ].map((item, i) => (
                                <span
                                    key={i}
                                    className={`text-xs sm:text-sm font-medium ${item === '→' || item === '•'
                                        ? 'text-emerald-500/40'
                                        : 'text-slate-400'
                                        }`}
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            </section>

            {/* BENTO ROLE CARDS */}
            <section className="py-16 sm:py-24 px-4 sm:px-6 relative">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10 sm:mb-16 reveal-section">
                        <p className="text-xs sm:text-sm font-medium text-emerald-400 uppercase tracking-widest mb-3">Three roles, one mission</p>
                        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight">
                            Everyone has a part to play
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                        {roles.map((role, i) => (
                            <div
                                key={role.title}
                                className={`bento-card p-5 sm:p-7 reveal-section reveal-delay-${i + 2} ${i === 2 ? 'sm:col-span-2 md:col-span-1' : ''}`}
                            >
                                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl mb-4 sm:mb-5 flex items-center justify-center ${role.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' :
                                        role.color === 'blue' ? 'bg-blue-500/10 text-blue-400' :
                                            'bg-purple-500/10 text-purple-400'
                                    }`}>
                                    <role.Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold mb-1">{role.title}</h3>
                                <p className="text-xs text-slate-500 font-medium mb-3 sm:mb-4 uppercase tracking-wider">
                                    {role.subtitle}
                                </p>
                                <p className="text-sm text-slate-400 leading-relaxed mb-5 sm:mb-6">
                                    {role.description}
                                </p>
                                <div className="flex gap-3">
                                    {role.stats.map((stat) => (
                                        <div
                                            key={stat.label}
                                            className="flex-1 p-2.5 sm:p-3 rounded-xl bg-slate-800/40 border border-slate-700/30"
                                        >
                                            <p className={`text-sm font-bold ${role.color === 'emerald' ? 'text-emerald-400' :
                                                role.color === 'blue' ? 'text-blue-400' : 'text-purple-400'
                                                }`}>{stat.value}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* BENTO FEATURES GRID */}
            <section className="py-16 sm:py-24 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10 sm:mb-16 reveal-section">
                        <p className="text-xs sm:text-sm font-medium text-emerald-400 uppercase tracking-widest mb-3">Platform capabilities</p>
                        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight">
                            Built different
                        </h2>
                    </div>

                    {/* Asymmetric bento grid */}
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        {/* Large card - Map */}
                        <div className="bento-card p-6 sm:p-8 md:col-span-4 reveal-section reveal-delay-1">
                            <div className="flex items-start justify-between mb-4 sm:mb-6">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Discovery</p>
                                    <h3 className="text-lg sm:text-xl font-bold">Geo-aware food map</h3>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-5 h-5 text-emerald-400" />
                                </div>
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed mb-4 sm:mb-6">
                                Interactive map powered by Leaflet showing all available donations in your radius.
                                Filter by distance, food type, and urgency.
                            </p>
                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                {['5 km radius', 'Real-time pins', 'Route preview'].map((f) => (
                                    <div key={f} className="text-center p-2 sm:p-3 rounded-xl bg-slate-800/30 border border-slate-700/20">
                                        <p className="text-xs text-slate-400">{f}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Small card - Safety */}
                        <div className="bento-card p-6 sm:p-8 md:col-span-2 reveal-section reveal-delay-2">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3 sm:mb-4">
                                <Shield className="w-5 h-5 text-amber-400" />
                            </div>
                            <h3 className="text-base sm:text-lg font-bold mb-2">Food safety engine</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Auto-validates expiry windows. High-risk foods require 2+ hours of safe shelf life.
                            </p>
                        </div>

                        {/* Small card - Tracking */}
                        <div className="bento-card p-6 sm:p-8 md:col-span-2 reveal-section reveal-delay-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3 sm:mb-4">
                                <Zap className="w-5 h-5 text-blue-400" />
                            </div>
                            <h3 className="text-base sm:text-lg font-bold mb-2">Live status tracking</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Follow every donation from listing to delivery with real-time status updates.
                            </p>
                        </div>

                        {/* Large card - Impact */}
                        <div className="bento-card p-6 sm:p-8 md:col-span-4 reveal-section reveal-delay-4">
                            <div className="flex items-start justify-between mb-4 sm:mb-6">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Analytics</p>
                                    <h3 className="text-lg sm:text-xl font-bold">Impact dashboard</h3>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                                    <BarChart3 className="w-5 h-5 text-purple-400" />
                                </div>
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed mb-4 sm:mb-6">
                                Every meal saved is tracked. See your contribution to reducing CO₂ emissions,
                                total meals redistributed, and community impact over time.
                            </p>
                            <div className="flex gap-4 sm:gap-6">
                                {[
                                    { value: 'CO₂', label: 'Emissions tracked' },
                                    { value: 'Meals', label: 'Per donation' },
                                    { value: 'Kg', label: 'Food saved' },
                                ].map((m) => (
                                    <div key={m.label}>
                                        <p className="text-base sm:text-lg font-bold text-emerald-400">{m.value}</p>
                                        <p className="text-xs text-slate-500">{m.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 sm:py-24 px-4 sm:px-6 relative">
                <div className="max-w-2xl mx-auto text-center reveal-section">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5 sm:mb-6">
                        <Heart className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                        Every meal matters
                    </h2>
                    <p className="text-sm sm:text-base text-slate-400 mb-8 sm:mb-10 leading-relaxed px-2">
                        Whether you have food to share, people to feed, or time to volunteer,
                        your action makes a real difference. Join SurplusSync today.
                    </p>
                    <Link
                        to="/register"
                        className="group inline-flex items-center gap-2 px-8 sm:px-10 py-3.5 sm:py-4 bg-emerald-500 hover:bg-emerald-400 rounded-2xl font-bold text-base sm:text-lg transition-all shadow-2xl shadow-emerald-500/25 pulse-cta"
                    >
                        Start now — it's free
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-6 sm:py-8 px-4 sm:px-6 border-t border-slate-800/40">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                        <Utensils className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>SurplusSync © {new Date().getFullYear()}</span>
                    </div>
                    <p>Built to feed communities, not landfills</p>
                </div>
            </footer>
        </div>
    )
}
