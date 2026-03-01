import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import Sidebar from '../components/layout/Sidebar';
import ROICalculator from '../components/ui/ROICalculator';

const CUSTOM_TOOLTIP_STYLE = {
    backgroundColor: '#0D1B40', border: '1px solid rgba(255,107,53,0.2)',
    borderRadius: '8px', color: '#F5F5F5', fontSize: 12,
};

const LANG_NAMES: Record<string, string> = {
    hi: 'Hindi', ta: 'Tamil', te: 'Telugu', kn: 'Kannada',
    ml: 'Malayalam', bn: 'Bengali', mr: 'Marathi', gu: 'Gujarati',
    pa: 'Punjabi', ur: 'Urdu', en: 'English',
};

const LANG_COLORS = ['#FF6B35', '#F7C948', '#00D4FF', '#00FF88', '#A855F7', '#EC4899', '#14B8A6', '#F97316', '#8B5CF6', '#06B6D4', '#84CC16'];

const STATE_POSITIONS: Record<string, [number, number]> = {
    'Delhi': [48, 22], 'Punjab': [40, 18], 'Uttar Pradesh': [55, 28], 'Rajasthan': [38, 35],
    'Gujarat': [30, 45], 'Maharashtra': [38, 55], 'Karnataka': [40, 65], 'Tamil Nadu': [45, 75],
    'West Bengal': [65, 40], 'Andhra Pradesh': [50, 65], 'Madhya Pradesh': [50, 42],
    'Kerala': [42, 73], 'Telangana': [48, 62], 'Odisha': [60, 52], 'Bihar': [62, 30],
    'Jharkhand': [63, 40], 'Haryana': [44, 22], 'Himachal Pradesh': [44, 15],
};

interface StoredCampaign {
    businessType?: string;
    language?: string;
    regions?: string[];
    input?: string;
    createdAt?: string;
    result?: any;
}

function loadCampaigns(): StoredCampaign[] {
    try {
        const raw = localStorage.getItem('bm_campaigns');
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

export function saveCampaignToHistory(data: StoredCampaign) {
    try {
        const existing = loadCampaigns();
        existing.unshift({ ...data, createdAt: new Date().toISOString() });
        localStorage.setItem('bm_campaigns', JSON.stringify(existing.slice(0, 50)));
    } catch { /* ignore */ }
}

export default function Analytics() {
    const campaigns = useMemo(() => loadCampaigns(), []);
    const total = campaigns.length;

    // States used
    const stateCounts: Record<string, number> = {};
    campaigns.forEach(c => (c.regions || []).forEach(r => {
        stateCounts[r] = (stateCounts[r] || 0) + 1;
    }));

    // Languages used
    const langCounts: Record<string, number> = {};
    campaigns.forEach(c => {
        if (c.language) langCounts[c.language] = (langCounts[c.language] || 0) + 1;
    });

    // Business types
    const bizCounts: Record<string, number> = {};
    campaigns.forEach(c => {
        if (c.businessType) bizCounts[c.businessType] = (bizCounts[c.businessType] || 0) + 1;
    });

    const stateBar = Object.entries(stateCounts)
        .sort((a, b) => b[1] - a[1]).slice(0, 8)
        .map(([state, count]) => ({ state: state.length > 10 ? state.slice(0, 10) : state, count }));

    const langPie = Object.entries(langCounts).map(([lang, count], i) => ({
        language: LANG_NAMES[lang] || lang, count, color: LANG_COLORS[i % LANG_COLORS.length]
    }));

    const bizBar = Object.entries(bizCounts)
        .sort((a, b) => b[1] - a[1]).slice(0, 6)
        .map(([biz, count]) => ({ biz: biz.length > 12 ? biz.slice(0, 12) : biz, count }));

    const topStates = Object.keys(stateCounts);

    const isEmpty = total === 0;

    return (
        <div className="min-h-screen flex">
            <Sidebar />
            <main className="flex-1 ml-[220px] p-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-3xl font-black font-poppins gradient-text">Your Analytics</h1>
                    <p className="text-slate-400 mt-1">
                        {isEmpty ? 'Generate your first campaign to see analytics here!' : `Based on ${total} campaign${total !== 1 ? 's' : ''} you've created`}
                    </p>
                </motion.div>

                {isEmpty ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="text-7xl mb-4">📊</div>
                        <h2 className="text-2xl font-bold text-white font-poppins mb-2">No campaigns yet</h2>
                        <p className="text-slate-400 mb-6">Create your first campaign and your analytics will appear here automatically.</p>
                        <a href="/campaign/new" className="btn-primary">🚀 Create First Campaign</a>
                    </motion.div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            {[
                                { label: 'Campaigns Created', value: String(total), icon: '🚀', delta: 'this session' },
                                { label: 'States Targeted', value: String(Object.keys(stateCounts).length), icon: '🗺️', delta: 'unique states' },
                                { label: 'Languages Used', value: String(Object.keys(langCounts).length), icon: '🌐', delta: 'languages' },
                                { label: 'Business Types', value: String(Object.keys(bizCounts).length), icon: '🏪', delta: 'categories' },
                            ].map((stat, i) => (
                                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }} className="glass-card p-5 feature-card">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-2xl">{stat.icon}</span>
                                        <span className="text-xs font-semibold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full">{stat.delta}</span>
                                    </div>
                                    <div className="text-3xl font-black font-poppins gradient-text">{stat.value}</div>
                                    <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* States bar */}
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-5">
                                <h3 className="font-bold font-poppins text-white mb-4">States You've Targeted</h3>
                                {stateBar.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={stateBar}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="state" tick={{ fill: '#94A3B8', fontSize: 10 }} tickLine={false} />
                                            <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                                            <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                                            <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="url(#stateGrad)">
                                                <defs>
                                                    <linearGradient id="stateGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#FF6B35" />
                                                        <stop offset="100%" stopColor="#F7C948" />
                                                    </linearGradient>
                                                </defs>
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : <p className="text-slate-500 text-sm py-16 text-center">Select states when creating campaigns</p>}
                            </motion.div>

                            {/* Language donut */}
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card p-5">
                                <h3 className="font-bold font-poppins text-white mb-4">Languages Used</h3>
                                {langPie.length > 0 ? (
                                    <div className="flex items-center gap-6">
                                        <ResponsiveContainer width="50%" height={180}>
                                            <PieChart>
                                                <Pie data={langPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="count" nameKey="language">
                                                    {langPie.map((entry, i) => (
                                                        <Cell key={i} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="space-y-2">
                                            {langPie.map(entry => (
                                                <div key={entry.language} className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: entry.color }} />
                                                    <span className="text-slate-300 text-sm">{entry.language}</span>
                                                    <span className="text-slate-500 text-sm ml-auto">{entry.count}×</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : <p className="text-slate-500 text-sm py-16 text-center">Language data will appear here</p>}
                            </motion.div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* India Map with user states highlighted */}
                            <div className="glass-card p-5 relative">
                                <h3 className="font-bold font-poppins text-white mb-4">Your Target States — India Map</h3>
                                <div className="relative h-64 bg-[#060c1a] rounded-xl overflow-hidden">
                                    <svg viewBox="0 0 100 100" className="w-full h-full opacity-30">
                                        <path d="M35 15 C45 12 60 14 70 18 C80 22 85 30 87 40 C89 50 85 60 78 68 C70 76 60 82 50 86 C40 82 30 76 22 68 C15 60 11 50 13 40 C15 30 20 22 30 18 Z"
                                            fill="#0D1B40" stroke="#FF6B35" strokeWidth="0.5" />
                                    </svg>
                                    {Object.entries(STATE_POSITIONS).map(([state, [x, y]]) => {
                                        const count = stateCounts[state] || 0;
                                        const isUsed = count > 0;
                                        const size = isUsed ? 8 + count * 3 : 4;
                                        return (
                                            <div key={state} className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
                                                style={{ left: `${x}%`, top: `${y}%` }}>
                                                <div className="rounded-full transition-all duration-300 cursor-pointer hover:scale-150"
                                                    title={isUsed ? `${state}: ${count} campaign${count > 1 ? 's' : ''}` : state}
                                                    style={{
                                                        width: size, height: size,
                                                        background: isUsed ? `rgba(255, 107, 53, 0.9)` : 'rgba(255,255,255,0.1)',
                                                        boxShadow: isUsed ? `0 0 ${size * 2}px rgba(255,107,53,0.7)` : 'none',
                                                    }} />
                                                {isUsed && (
                                                    <span className="text-[7px] text-orange-300 mt-0.5 whitespace-nowrap font-mono">{state}</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {topStates.filter(s => !STATE_POSITIONS[s]).length > 0 && (
                                        <div className="absolute bottom-2 left-2 right-2 text-[9px] text-slate-500 font-mono">
                                            +{topStates.filter(s => !STATE_POSITIONS[s]).join(', ')}
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mt-2 font-mono">🔴 States you've targeted · Brighter = more campaigns</p>
                            </div>

                            {/* Business types */}
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card p-5">
                                <h3 className="font-bold font-poppins text-white mb-4">Business Types Used</h3>
                                {bizBar.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={bizBar} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                            <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                                            <YAxis dataKey="biz" type="category" tick={{ fill: '#94A3B8', fontSize: 10 }} tickLine={false} width={80} />
                                            <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                                            <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="#A855F7" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : <p className="text-slate-500 text-sm py-16 text-center">Business type data will appear here</p>}
                            </motion.div>
                        </div>

                        {/* Recent campaigns list */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="glass-card p-5 mb-6">
                            <h3 className="font-bold font-poppins text-white mb-4">Recent Campaigns</h3>
                            <div className="space-y-2">
                                {campaigns.slice(0, 5).map((c, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                        <span className="text-xl">🚀</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium truncate">{c.input?.slice(0, 60) || 'Campaign'}</p>
                                            <p className="text-slate-500 text-xs">{c.businessType} · {(c.regions || []).join(', ')} · {LANG_NAMES[c.language || 'en'] || c.language}</p>
                                        </div>
                                        <span className="text-xs text-slate-600 font-mono flex-shrink-0">
                                            {c.createdAt ? new Date(c.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                            <ROICalculator />
                        </motion.div>
                    </>
                )}
            </main>
        </div>
    );
}
