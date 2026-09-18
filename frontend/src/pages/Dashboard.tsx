import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import Sidebar from '../components/layout/Sidebar';
import FestivalWidget from '../components/ui/FestivalWidget';
import { PLATFORMS } from '../lib/constants';
import { MOCK_ANALYTICS } from '../lib/mockData';
import { useMemo, useState, useEffect } from 'react';

// Load real campaign history from localStorage
function loadCampaignHistory() {
    try {
        const raw = localStorage.getItem('bm_campaigns');
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

export default function Dashboard() {
    const navigate = useNavigate();
    const campaigns = useMemo(() => loadCampaignHistory(), []);
    const total = campaigns.length;
    const langSet = new Set(campaigns.map((c: { language: string }) => c.language).filter(Boolean));
    const stateCount = new Set(campaigns.flatMap((c: { regions: string[] }) => c.regions || [])).size;
    const [statsVisible, setStatsVisible] = useState(false);

    // Avg BharatScore from campaign history
    const avgScore = useMemo(() => {
        const scored = campaigns.filter((c: any) => c?.result?.bharatScore?.total);
        if (scored.length === 0) return 0;
        const sum = scored.reduce((acc: number, c: any) => acc + (c.result.bharatScore.total ?? 0), 0);
        return Math.round(sum / scored.length);
    }, [campaigns]);

    // Trigger count-up on mount
    useEffect(() => {
        const t = setTimeout(() => setStatsVisible(true), 200);
        return () => clearTimeout(t);
    }, []);

    const STAT_CARDS = [
        { icon: '🚀', label: 'Campaigns Created', value: total, suffix: '', color: '#FF6B35', decimals: 0 },
        { icon: '🌐', label: 'Languages Used', value: langSet.size, suffix: '', color: '#F7C948', decimals: 0 },
        { icon: '🗺️', label: 'States Targeted', value: stateCount, suffix: '', color: '#00D4FF', decimals: 0 },
        { icon: '👥', label: 'Est. Reach', value: total * 24, suffix: total > 0 ? '+' : '', color: '#00FF88', decimals: 0 },
        { icon: '⭐', label: 'Avg BharatScore', value: avgScore, suffix: '/100', color: '#A855F7', decimals: 0 },
    ];



    return (
        <div className="min-h-screen flex">
            <Sidebar />

            <main className="flex-1 ml-[220px] p-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div>
                        <h1 className="text-3xl font-black font-poppins gradient-text">Welcome! 👋</h1>
                        <p className="text-slate-400 mt-1">
                            {total > 0 ? `${total} campaign${total !== 1 ? 's' : ''} created — keep growing!` : 'Create your first campaign to get started'}
                        </p>
                    </div>
                    <Link to="/campaign/new" className="btn-primary flex items-center gap-2">
                        ＋ New Campaign
                    </Link>
                </motion.div>

                {/* Stat cards — count-up animation on mount */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    {STAT_CARDS.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="glass-card p-5 feature-card relative overflow-hidden"
                            style={{ '--glow': stat.color } as React.CSSProperties}
                        >
                            {/* Animated shimmer top border */}
                            <div className="absolute top-0 left-0 right-0 h-[1px]"
                                style={{ background: `linear-gradient(90deg, transparent, ${stat.color}80, transparent)` }} />
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl">{stat.icon}</span>
                                <div className="w-2 h-2 rounded-full animate-pulse"
                                    style={{ background: stat.color, boxShadow: `0 0 8px ${stat.color}` }} />
                            </div>
                            <div className="text-3xl font-black font-poppins" style={{ color: stat.color }}>
                                {statsVisible && stat.value > 0 ? (
                                    <>
                                        <CountUp
                                            start={0}
                                            end={stat.value}
                                            duration={1.4}
                                            delay={i * 0.08}
                                            decimals={stat.decimals}
                                            separator=","
                                            useEasing={true}
                                        />
                                        {stat.suffix}
                                    </>
                                ) : (
                                    <span>{stat.value > 0 ? `${stat.value}${stat.suffix}` : '—'}</span>
                                )}
                            </div>
                            <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Campaigns */}
                    <div className="lg:col-span-2">
                        <h2 className="font-bold font-poppins text-white text-lg mb-4">Recent Campaigns</h2>
                        {campaigns.length === 0 ? (
                            <div className="glass-card p-10 text-center">
                                <div className="text-5xl mb-3">🚀</div>
                                <p className="text-slate-400 mb-4">No campaigns yet. Create your first one!</p>
                                <Link to="/campaign/new" className="btn-primary">Generate Campaign</Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {campaigns.slice(0, 6).map((c: { language: string; businessType: string; input: string; regions: string[]; createdAt: string }, i: number) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.08 }}
                                        className="glass-card p-4 flex items-center gap-4 hover:border-orange-500/20 transition-all cursor-pointer"
                                        onClick={() => {
                                            sessionStorage.setItem('recentCampaign', JSON.stringify(c));
                                            navigate('/campaign/new');
                                        }}
                                    >
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                                            style={{ background: 'rgba(0,255,136,0.15)' }}>
                                            ✅
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-white text-sm truncate">{c.input?.slice(0, 50) || c.businessType}</p>
                                            <p className="text-slate-400 text-xs">{c.businessType} · {(c.regions || []).join(', ') || 'India'} · {c.language?.toUpperCase()}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="text-xs text-slate-500 font-mono">
                                                {c.createdAt ? new Date(c.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </div>
                                        </div>
                                        <div className="px-2 py-1 rounded-lg text-xs font-semibold flex-shrink-0 text-green-400 bg-green-400/10">
                                            Live
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar widgets */}
                    <div className="space-y-5">
                        <FestivalWidget onCreateCampaign={() => navigate('/campaign/new')} />

                        {/* Platform performance mini */}
                        <div className="glass-card p-5">
                            <h3 className="font-bold font-poppins text-white mb-4 text-sm">Platform Performance</h3>
                            <div className="space-y-3">
                                {MOCK_ANALYTICS.platformBreakdown.map(p => {
                                    const platform = PLATFORMS.find(pl => pl.name === p.platform);
                                    const maxReach = Math.max(...MOCK_ANALYTICS.platformBreakdown.map(x => x.reach));
                                    return (
                                        <div key={p.platform}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm text-slate-300 flex items-center gap-2">
                                                    <span>{platform?.emoji}</span> {p.platform}
                                                </span>
                                                <span className="text-xs text-slate-400">{(p.reach / 1000).toFixed(0)}K</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(p.reach / maxReach) * 100}%` }}
                                                    transition={{ duration: 1, delay: 0.3 }}
                                                    className="h-full rounded-full"
                                                    style={{ background: `linear-gradient(90deg, #FF6B35, #F7C948)` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* V3 Feature Shortcuts */}
                <div className="mt-8">
                    <h2 className="font-bold font-poppins text-white text-lg mb-4">🚀 V3 AI Engine</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { icon: '🧠', label: 'BharatBrain',    sub: 'Brand memory · S3 + DynamoDB',  path: '/brain',        color: '#7c3aed' },
                            { icon: '🧪', label: 'Experiment Lab', sub: 'A/B variants per campaign',     path: '/experiments',  color: '#0891b2' },
                            { icon: '🔬', label: 'Agent Trace',    sub: 'Decision log per campaign',     path: '/trace',        color: '#059669' },
                            { icon: '📡', label: 'Market Pulse',   sub: 'Signals + Learning memory',     path: '/market-pulse', color: '#d97706' },
                        ].map(card => (
                            <Link key={card.path} to={card.path}
                                style={{ textDecoration: 'none' }}
                                className="glass-card p-5 feature-card hover:scale-[1.02] transition-transform">
                                <div className="text-3xl mb-2">{card.icon}</div>
                                <div className="font-bold text-white text-sm" style={{ color: card.color }}>{card.label}</div>
                                <div className="text-slate-500 text-xs mt-1">{card.sub}</div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* GitHub Ideas — 8 Innovative Bharat-Native Features */}
                <div className="mt-10">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="font-bold font-poppins text-white text-lg">🇮🇳 Innovative Bharat Tools</h2>
                                <span style={{
                                    background: 'linear-gradient(135deg,rgba(251,191,36,0.2),rgba(249,115,22,0.2))',
                                    border: '1px solid rgba(251,191,36,0.35)',
                                    borderRadius: 999, padding: '0.15rem 0.65rem',
                                    fontSize: '0.65rem', color: '#fbbf24', fontWeight: 700,
                                }}>8 FEATURES</span>
                            </div>
                            <p className="text-slate-500 text-xs">Specialized tools for India's cultural diversity, voice-first markets & regional intelligence</p>
                        </div>
                        <Link to="/dialect-atlas" style={{ textDecoration: 'none', fontSize: '0.78rem', color: '#f97316', fontWeight: 600 }}
                            className="hover:text-orange-300 transition-colors">
                            Explore All →
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            {
                                icon: '🗺️', label: 'Dialect Atlas',
                                sub: 'Interactive India map · regional pulse',
                                path: '/dialect-atlas',
                                gradient: 'linear-gradient(135deg,rgba(249,115,22,0.15),rgba(251,191,36,0.08))',
                                border: 'rgba(249,115,22,0.3)',
                                glow: '#f97316',
                                badge: 'Geo · Visual',
                            },
                            {
                                icon: '💬', label: 'Focus Group',
                                sub: 'Live WhatsApp persona debate sim',
                                path: '/focus-group',
                                gradient: 'linear-gradient(135deg,rgba(168,85,247,0.15),rgba(34,211,238,0.08))',
                                border: 'rgba(168,85,247,0.3)',
                                glow: '#a855f7',
                                badge: 'Multi-Agent',
                            },
                            {
                                icon: '✨', label: 'Slang Diff',
                                sub: 'Cultural copy diff · slang tooltips',
                                path: '/cultural-diff',
                                gradient: 'linear-gradient(135deg,rgba(74,222,128,0.15),rgba(34,211,238,0.08))',
                                border: 'rgba(74,222,128,0.3)',
                                glow: '#4ade80',
                                badge: 'Cultural NLP',
                            },
                            {
                                icon: '🛡️', label: 'Sensitivity Guard',
                                sub: '6-point cultural safety audit',
                                path: '/sensitivity',
                                gradient: 'linear-gradient(135deg,rgba(251,191,36,0.15),rgba(248,113,113,0.08))',
                                border: 'rgba(251,191,36,0.3)',
                                glow: '#fbbf24',
                                badge: 'AI Safety',
                            },
                            {
                                icon: '🎙️', label: 'Voice Studio',
                                sub: 'RJ voice synth · audio waveform',
                                path: '/audio-studio',
                                gradient: 'linear-gradient(135deg,rgba(239,68,68,0.15),rgba(249,115,22,0.08))',
                                border: 'rgba(239,68,68,0.3)',
                                glow: '#ef4444',
                                badge: 'Multimodal',
                            },
                            {
                                icon: '🎨', label: 'Poster Studio',
                                sub: 'Festival WhatsApp poster generator',
                                path: '/poster-studio',
                                gradient: 'linear-gradient(135deg,rgba(217,70,239,0.15),rgba(168,85,247,0.08))',
                                border: 'rgba(217,70,239,0.3)',
                                glow: '#d946ef',
                                badge: 'Viral Content',
                            },
                            {
                                icon: '⌨️', label: 'Transliterator',
                                sub: 'Hinglish / Tanglish real-time engine',
                                path: '/transliteration',
                                gradient: 'linear-gradient(135deg,rgba(34,211,238,0.15),rgba(99,102,241,0.08))',
                                border: 'rgba(34,211,238,0.3)',
                                glow: '#22d3ee',
                                badge: 'Language',
                            },
                            {
                                icon: '⌘', label: 'Command Palette',
                                sub: 'Press Ctrl+K — BharatScore instant audit',
                                path: '/dashboard',
                                gradient: 'linear-gradient(135deg,rgba(148,163,184,0.1),rgba(71,85,105,0.08))',
                                border: 'rgba(148,163,184,0.2)',
                                glow: '#94a3b8',
                                badge: 'Pro UX',
                                onClick: true,
                            },
                        ].map(card => (
                            <motion.div
                                key={card.path + card.label}
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    background: card.gradient,
                                    border: `1px solid ${card.border}`,
                                    borderRadius: '0.875rem',
                                    padding: '1.1rem',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    textDecoration: 'none',
                                    transition: 'box-shadow 0.2s',
                                }}
                                className="feature-card"
                                onClick={() => {
                                    if ((card as any).onClick) {
                                        // Dispatch ctrl+k event for command palette
                                        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
                                    } else {
                                        navigate(card.path);
                                    }
                                }}
                            >
                                {/* Glow dot */}
                                <div style={{
                                    position: 'absolute', top: 10, right: 10,
                                    width: 6, height: 6, borderRadius: '50%',
                                    background: card.glow,
                                    boxShadow: `0 0 8px ${card.glow}`,
                                    animation: 'pulse 2s infinite',
                                }} />
                                <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{card.icon}</div>
                                <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.2rem' }}>{card.label}</div>
                                <div style={{ color: '#64748b', fontSize: '0.72rem', lineHeight: 1.5, marginBottom: '0.5rem' }}>{card.sub}</div>
                                <span style={{
                                    background: `${card.glow}20`,
                                    color: card.glow,
                                    border: `1px solid ${card.glow}40`,
                                    borderRadius: 999,
                                    padding: '0.1rem 0.5rem',
                                    fontSize: '0.62rem',
                                    fontWeight: 700,
                                }}>{card.badge}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
