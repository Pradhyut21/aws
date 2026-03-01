import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import FestivalWidget from '../components/ui/FestivalWidget';
import { PLATFORMS } from '../lib/constants';
import { MOCK_ANALYTICS } from '../lib/mockData';
import { useMemo } from 'react';

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

    const STAT_CARDS = [
        { icon: '🚀', label: 'Campaigns Created', value: total > 0 ? String(total) : '0', color: '#FF6B35' },
        { icon: '🌐', label: 'Languages Used', value: langSet.size > 0 ? String(langSet.size) : '—', color: '#F7C948' },
        { icon: '🗺️', label: 'States Targeted', value: stateCount > 0 ? String(stateCount) : '—', color: '#00D4FF' },
        { icon: '👥', label: 'Est. Reach', value: total > 0 ? `${(total * 24).toLocaleString('en-IN')}+` : '—', color: '#00FF88' },
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

                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {STAT_CARDS.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card p-5 feature-card"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl">{stat.icon}</span>
                                <div className="w-2 h-2 rounded-full" style={{ background: stat.color, boxShadow: `0 0 8px ${stat.color}` }} />
                            </div>
                            <div className="text-3xl font-black font-poppins" style={{ color: stat.color }}>{stat.value}</div>
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
            </main>
        </div>
    );
}
