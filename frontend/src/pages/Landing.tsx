import { Suspense, lazy, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CounterStat from '../components/ui/CounterStat';
import PricingCard from '../components/ui/PricingCard';
import ComparisonTable from '../components/ui/ComparisonTable';
import TestimonialCard from '../components/ui/TestimonialCard';
import WaveBackground from '../components/3d/WaveBackground';
import PipelineSlides from '../components/ui/PipelineSlides';
import ParticleNet from '../components/3d/ParticleNet';
import FogOverlay from '../components/3d/FogOverlay';
import { FEATURES, TESTIMONIALS } from '../lib/mockData';
import { HERO_TAGLINES } from '../lib/constants';

// Lazy load heavy 3D components
const IndiaGlobe = lazy(() => import('../components/3d/IndiaGlobe'));

// ────────────────────────────────────────
// Morphing tagline in 6 Indian languages
// ────────────────────────────────────────
function MorphingText() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setIndex(i => (i + 1) % HERO_TAGLINES.length), 2800);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="h-12 overflow-hidden relative">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ y: 40, opacity: 0, filter: 'blur(8px)' }}
                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                    exit={{ y: -40, opacity: 0, filter: 'blur(8px)' }}
                    transition={{ duration: 0.55, ease: 'easeInOut' }}
                    className="flex items-center gap-3"
                >
                    <span className="text-2xl font-bold gradient-text font-poppins">
                        {HERO_TAGLINES[index].text}
                    </span>
                    <span className="text-xs text-slate-500 font-mono bg-white/5 px-2 py-0.5 rounded">
                        {HERO_TAGLINES[index].lang}
                    </span>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

// ────────────────────────────────────────
// Rural entrepreneur problem stories
// ────────────────────────────────────────
const RURAL_STORIES = [
    {
        emoji: '🧶',
        name: 'Ramkali Devi',
        city: 'Varanasi, UP',
        lang: 'Bhojpuri',
        issue: 'Cannot create content in Bhojpuri — loses 70% of local customers',
        result: 'Now gets 3x orders via WhatsApp in Bhojpuri',
        statBefore: '6 hrs/week on content',
        statAfter: '10 min/campaign',
        color: '#FF6B35',
    },
    {
        emoji: '🧵',
        name: 'Murugesan K.',
        city: 'Coimbatore, TN',
        lang: 'Tamil',
        issue: 'Struggles with Tamil SEO keywords — invisible on Google',
        result: 'Top 3 Google result for "Coimbatore cotton sarees" in Tamil',
        statBefore: 'Zero online traffic',
        statAfter: '5x search visibility',
        color: '#F7C948',
    },
    {
        emoji: '🎵',
        name: 'Grace Lkr',
        city: 'Shillong, Meghalaya',
        lang: 'Khasi',
        issue: 'Can\'t translate Khasi lyrics for audiences outside the Northeast',
        result: 'Viral reel with 110K views across East India',
        statBefore: 'Local-only audience',
        statAfter: '110K pan-India views',
        color: '#00D4FF',
    },
    {
        emoji: '🌾',
        name: 'Suresh Patel',
        city: 'Anand, Gujarat',
        lang: 'Gujarati',
        issue: 'Couldn\'t post about organic produce in Gujarati with proper hashtags',
        result: 'Sells direct-to-consumer via Instagram in Gujarati',
        statBefore: '₹50,000/month revenue',
        statAfter: '₹1.8L/month revenue',
        color: '#00FF88',
    },
];

// Pricing plans
const PRICING_PLANS = [
    {
        tier: 'Freemium', price: '₹0', period: 'forever', emoji: '🌱', cta: 'Start Free',
        features: ['5 campaigns/month', '3 languages', 'Instagram + WhatsApp', 'Basic analytics', 'Standard images'],
    },
    {
        tier: 'Pro', price: '₹99', period: 'month', emoji: '⚡', cta: 'Get Pro Now', highlighted: true, badge: '⭐ Most Popular',
        features: ['Unlimited campaigns', '22 languages', 'All 15 platforms', 'AI Video (Nova Reel)', 'Smart scheduling', 'BharatScore analytics', 'Festival campaigns'],
    },
    {
        tier: 'Enterprise', price: '₹999', period: 'month', emoji: '🏢', cta: 'Contact Sales',
        features: ['White-label solution', 'Custom domain', 'API access', 'Bulk campaigns', 'Dedicated account mgr', 'SLA guarantee', 'Multi-user team'],
    },
];

// ────────────────────────────────────────
// Impact numbers section with animation
// ────────────────────────────────────────
function ImpactNumbers() {
    const stats = [
        { value: 63, suffix: 'M', label: 'Indian SMBs We Can Reach', icon: '🏪', color: '#FF6B35' },
        { value: 22, suffix: '+', label: 'Official Indian Languages', icon: '🌐', color: '#F7C948' },
        { value: 490, suffix: 'M', label: 'WhatsApp Users in India', icon: '💬', color: '#00D4FF' },
        { value: 97, suffix: '%', label: 'Cost Reduction vs Agency', icon: '💰', color: '#00FF88' },
    ];

    return (
        <section className="py-20 px-6 lg:px-12 relative overflow-hidden">
            {/* Fog background */}
            <div className="absolute inset-0">
                <FogOverlay className="absolute inset-0" color="#FF6B35" opacity={0.04} />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-12">
                    <h2 className="section-heading">The Scale of Opportunity</h2>
                    <p className="text-slate-400 text-lg">India's digital opportunity is massive. BharatMedia makes it accessible.</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.12 }}
                            className="glass-card p-6 text-center feature-card"
                            style={{ borderColor: `${stat.color}20` }}
                        >
                            <motion.div
                                className="text-4xl mb-3"
                                animate={{ rotate: [0, -5, 5, 0] }}
                                transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                            >
                                {stat.icon}
                            </motion.div>
                            <div className="flex items-end justify-center gap-0.5 mb-1">
                                <span className="text-4xl font-black font-poppins" style={{ color: stat.color }}>
                                    {stat.value}
                                </span>
                                <span className="text-2xl font-bold font-poppins mb-1" style={{ color: stat.color }}>
                                    {stat.suffix}
                                </span>
                            </div>
                            <p className="text-slate-400 text-xs leading-tight">{stat.label}</p>
                            <div className="mt-3 h-0.5 w-1/2 mx-auto rounded-full"
                                style={{ background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)` }} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ────────────────────────────────────────
// Rural entrepreneur stories section
// ────────────────────────────────────────
function RuralStoriesSection() {
    const [activeStory, setActiveStory] = useState(0);

    useEffect(() => {
        const t = setInterval(() => setActiveStory(s => (s + 1) % RURAL_STORIES.length), 4000);
        return () => clearInterval(t);
    }, []);

    const story = RURAL_STORIES[activeStory];

    return (
        <section className="py-24 px-6 lg:px-12 relative overflow-hidden">
            <div className="absolute inset-0 opacity-30 pointer-events-none">
                <ParticleNet color="#FF6B35" pointCount={40} maxDistance={100} speed={0.2} className="absolute inset-0" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-12">
                    <h2 className="section-heading">Digital Bharat's Invisible Crisis</h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        700 million Indians are online. But rural entrepreneurs, artisans, and small businesses are invisible
                        because digital tools don't speak their language.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Story tabs */}
                    <div className="space-y-3">
                        {RURAL_STORIES.map((s, i) => (
                            <motion.button
                                key={s.name}
                                onClick={() => setActiveStory(i)}
                                className={`w-full glass-card p-4 text-left transition-all duration-300 border ${i === activeStory ? 'border-opacity-50' : 'border-white/5 hover:border-white/10'
                                    }`}
                                style={i === activeStory ? {
                                    borderColor: `${s.color}50`,
                                    background: `${s.color}08`,
                                    boxShadow: `0 0 30px ${s.color}15`,
                                } : {}}
                                whileHover={{ x: 4 }}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl">{s.emoji}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-white font-poppins text-sm">{s.name}</h4>
                                            <span className="text-xs font-mono px-2 py-0.5 rounded"
                                                style={{ background: `${s.color}20`, color: s.color }}>
                                                {s.lang}
                                            </span>
                                        </div>
                                        <p className="text-slate-400 text-xs">{s.city}</p>
                                        <p className="text-slate-300 text-xs mt-1 italic">"{s.issue}"</p>
                                    </div>
                                    {i === activeStory && (
                                        <div className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
                                            style={{ background: s.color }} />
                                    )}
                                </div>
                            </motion.button>
                        ))}
                    </div>

                    {/* Active story result */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeStory}
                            initial={{ opacity: 0, x: 30, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -30, scale: 0.95 }}
                            transition={{ duration: 0.4 }}
                            className="glass-card p-8"
                            style={{ borderColor: `${story.color}30` }}
                        >
                            {/* Story header */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center text-4xl"
                                    style={{ background: `${story.color}20`, border: `2px solid ${story.color}40` }}>
                                    {story.emoji}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black font-poppins text-white">{story.name}</h3>
                                    <p className="text-slate-400 text-sm">{story.city} · Speaks {story.lang}</p>
                                </div>
                            </div>

                            {/* Problem → Solution */}
                            <div className="space-y-4 mb-6">
                                <div className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                    <span className="text-red-400 flex-shrink-0">❌</span>
                                    <p className="text-slate-300 text-sm"><strong className="text-red-400">Before:</strong> {story.issue}</p>
                                </div>
                                <div className="flex items-center justify-center text-slate-600 text-xl">↓</div>
                                <div className="flex gap-3 p-3 rounded-xl" style={{ background: `${story.color}10`, border: `1px solid ${story.color}30` }}>
                                    <span style={{ color: story.color }} className="flex-shrink-0">✅</span>
                                    <p className="text-slate-300 text-sm">
                                        <strong style={{ color: story.color }}>After BharatMedia:</strong> {story.result}
                                    </p>
                                </div>
                            </div>

                            {/* Impact stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <p className="text-red-400 font-bold text-sm font-poppins">{story.statBefore}</p>
                                    <p className="text-slate-500 text-xs">Before</p>
                                </div>
                                <div className="text-center p-3 rounded-xl" style={{ background: `${story.color}15`, border: `1px solid ${story.color}30` }}>
                                    <p className="font-bold text-sm font-poppins" style={{ color: story.color }}>{story.statAfter}</p>
                                    <p className="text-slate-500 text-xs">After</p>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Big statement */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="glass-card p-8 md:p-10 max-w-3xl mx-auto mt-10 text-center border-orange-500/20"
                    style={{ boxShadow: '0 0 60px rgba(255,107,53,0.08)' }}
                >
                    <p className="text-3xl md:text-4xl font-black font-poppins text-white leading-tight">
                        "This is the <span className="gradient-text">invisible crisis</span> of Digital Bharat.
                        <br />
                        <span className="text-4xl md:text-5xl">We fix it. 🇮🇳</span>"
                    </p>
                </motion.div>
            </div>
        </section>
    );
}

// ────────────────────────────────────────
// Main Landing Page
// ────────────────────────────────────────
export default function Landing() {
    return (
        <div className="min-h-screen bg-bg-primary overflow-x-hidden">
            <Navbar />

            {/* ═══════════════════════════════════════
          HERO with ParticleNet Background
      ═══════════════════════════════════════ */}
            <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">

                {/* Particle NET animated background — full hero coverage */}
                <div className="absolute inset-0 pointer-events-none">
                    <ParticleNet
                        color="#FF6B35"
                        pointCount={90}
                        maxDistance={150}
                        speed={0.3}
                        className="absolute inset-0"
                    />
                </div>

                {/* Fog atmosphere overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-50">
                    <FogOverlay color="#F7C948" opacity={0.03} className="absolute inset-0" />
                </div>

                {/* Radial vignette to keep center readable */}
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 80% 80% at 30% 50%, transparent 30%, rgba(10,15,30,0.85) 100%)' }} />

                <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                    {/* LEFT: Hero copy */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* Hackathon badge */}
                        <motion.div
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border border-orange-500/30 text-orange-400 bg-orange-500/10 mb-6"
                            animate={{ boxShadow: ['0 0 10px rgba(255,107,53,0.2)', '0 0 25px rgba(255,107,53,0.5)', '0 0 10px rgba(255,107,53,0.2)'] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            AWS Bedrock · Nova Family · AI for Bharat Hackathon 2026
                        </motion.div>

                        <h1 className="text-5xl lg:text-7xl font-black font-poppins leading-tight mb-4">
                            <span className="gradient-text">भारत का</span>
                            <br />
                            <span className="text-white">AI Content</span>
                            <br />
                            <span className="gradient-text-cyan">Studio</span>
                        </h1>

                        <div className="mb-6">
                            <MorphingText />
                        </div>

                        <p className="text-slate-300 text-lg mb-8 leading-relaxed max-w-lg">
                            Speak in your language. Publish to the world.
                            Transform any idea into Instagram Reels, WhatsApp campaigns, SEO blogs — in <strong className="text-white">under 10 minutes</strong>.
                        </p>

                        <div className="flex flex-wrap gap-4 mb-10">
                            <Link to="/signup" className="btn-primary flex items-center gap-2 text-base">
                                🎙️ Try Voice Demo
                            </Link>
                            <Link to="/signup" className="btn-outline flex items-center gap-2 text-base">
                                Start Free Campaign →
                            </Link>
                        </div>

                        {/* Animated stats */}
                        <div className="flex gap-10">
                            <CounterStat value={22} suffix="+" label="Languages" />
                            <CounterStat value={15} suffix="+" label="Platforms" />
                            <CounterStat value={99} prefix="₹" label="/month" />
                        </div>
                    </motion.div>

                    {/* RIGHT: 3D Globe */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, delay: 0.3 }}
                        className="h-[500px] lg:h-[620px] relative"
                    >
                        <Suspense fallback={
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="relative">
                                    <div className="w-48 h-48 rounded-full border-2 border-orange-500/30 animate-spin" />
                                    <div className="absolute inset-4 rounded-full border-2 border-cyan-500/30 animate-spin" style={{ animationDirection: 'reverse' }} />
                                    <div className="absolute inset-8 rounded-full border-2 border-yellow-500/30 animate-spin" />
                                </div>
                            </div>
                        }>
                            <IndiaGlobe />
                        </Suspense>
                    </motion.div>
                </div>

                <WaveBackground />
            </section>

            {/* ═══════════════════════════════════════
          RURAL STORIES + PROBLEM SECTION
      ═══════════════════════════════════════ */}
            <RuralStoriesSection />

            {/* ═══════════════════════════════════════
          IMPACT NUMBERS
      ═══════════════════════════════════════ */}
            <ImpactNumbers />

            {/* ═══════════════════════════════════════
          PIPELINE SLIDES — 3D Animated Carousel
      ═══════════════════════════════════════ */}
            <section className="py-24 px-6 lg:px-12 relative overflow-hidden" style={{ background: 'rgba(13,27,64,0.4)' }}>
                {/* Subtle particle network in back */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <ParticleNet color="#00D4FF" pointCount={50} maxDistance={100} speed={0.15} className="absolute inset-0" />
                </div>

                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="text-center mb-12">
                        <h2 className="section-heading">How It Works</h2>
                        <p className="text-slate-400 text-lg">5 AI agents, 10 minutes, 15 platforms — one simple input</p>
                    </div>

                    <PipelineSlides autoPlay={true} interval={4000} />
                </div>
            </section>

            {/* ═══════════════════════════════════════
          FEATURES GRID
      ═══════════════════════════════════════ */}
            <section id="features" className="py-24 px-6 lg:px-12">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="section-heading">Everything You Need</h2>
                        <p className="text-slate-400 text-lg">Built specifically for India's 63 Million small businesses</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {FEATURES.map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                className="feature-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ y: -4, scale: 1.02 }}
                            >
                                <motion.div
                                    className="text-3xl mb-3"
                                    whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.2 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    {feature.icon}
                                </motion.div>
                                <h3 className="font-bold font-poppins text-white mb-1">{feature.title}</h3>
                                <p className="text-slate-400 text-sm mb-3">{feature.desc}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-mono text-slate-500">{feature.impact}</span>
                                    <span className="text-xl font-black font-poppins" style={{ color: feature.color }}>
                                        {feature.stat}
                                    </span>
                                </div>
                                <motion.div
                                    className="mt-2 h-0.5 rounded-full"
                                    style={{ background: `${feature.color}40` }}
                                    whileHover={{ background: feature.color, height: '2px' }}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════
          COMPARISON
      ═══════════════════════════════════════ */}
            <section className="py-20 px-6 lg:px-12 bg-[#0D1B40]/30">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="section-heading">Why BharatMedia?</h2>
                    <p className="text-slate-400 mb-8">No other tool was built for India's diversity</p>
                    <ComparisonTable />
                </div>
            </section>

            {/* ═══════════════════════════════════════
          PRICING
      ═══════════════════════════════════════ */}
            <section id="pricing" className="py-24 px-6 lg:px-12">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="section-heading">Simple, Fair Pricing</h2>
                    <p className="text-slate-400 text-lg mb-4">Built for India. Priced for Bharat.</p>

                    {/* Live cost calculator */}
                    <motion.div
                        className="inline-flex items-center gap-3 px-5 py-3 rounded-xl mb-10 glass-card border-cyan-500/20"
                        animate={{ boxShadow: ['0 0 10px rgba(0,212,255,0.1)', '0 0 30px rgba(0,212,255,0.25)', '0 0 10px rgba(0,212,255,0.1)'] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    >
                        <span className="text-cyan-400">💡</span>
                        <span className="text-slate-300 text-sm">This Diwali campaign would cost</span>
                        <span className="text-2xl font-black font-poppins gradient-text">₹0.43</span>
                        <span className="text-slate-400 text-sm">to generate with Nova AI</span>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {PRICING_PLANS.map(plan => (
                            <PricingCard key={plan.tier} {...plan} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════ */}
            <section id="testimonials" className="py-20 px-6 lg:px-12 relative overflow-hidden" style={{ background: 'rgba(13,27,64,0.4)' }}>
                <div className="absolute inset-0 pointer-events-none opacity-15">
                    <FogOverlay color="#F7C948" opacity={0.05} className="absolute inset-0" />
                </div>
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <h2 className="section-heading">Stories from Bharat</h2>
                    <p className="text-slate-400 text-lg mb-12">Real Indian businesses, real results</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map(t => (
                            <TestimonialCard key={t.name} {...t} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════
          FINAL CTA with particle network
      ═══════════════════════════════════════ */}
            <section className="py-24 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <ParticleNet color="#FF6B35" pointCount={60} maxDistance={120} speed={0.25} className="absolute inset-0" />
                </div>
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, transparent 30%, rgba(10,15,30,0.9) 100%)' }} />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto relative z-10"
                >
                    <h2 className="text-5xl lg:text-6xl font-black font-poppins mb-4">
                        <span className="gradient-text">Ready to go viral</span>
                        <br />
                        <span className="text-white">in your language?</span>
                    </h2>
                    <p className="text-slate-400 text-lg mb-8">Join 10,000+ Indian SMBs publishing culturally intelligent content</p>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Link to="/signup" className="btn-primary text-lg py-4 px-10 inline-block">
                            🚀 Create Your First Campaign — Free
                        </Link>
                    </motion.div>
                    <p className="text-slate-600 text-sm mt-4 font-mono">No credit card · No setup · 5 campaigns free forever</p>
                </motion.div>
            </section>

            <Footer />
        </div>
    );
}
