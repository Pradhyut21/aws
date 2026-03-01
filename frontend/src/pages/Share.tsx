import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MOCK_CAMPAIGN } from '../lib/mockData';
import { useToast } from '../components/ui/ToastProvider';

// QR code placeholder using CSS
function QRPlaceholder({ value }: { value: string }) {
    return (
        <div className="w-28 h-28 rounded-xl flex items-center justify-center text-center p-2"
            style={{ background: '#fff' }}>
            <div className="text-[8px] leading-tight text-slate-800 font-mono break-all opacity-60">{value.slice(0, 60)}</div>
        </div>
    );
}

const PLATFORM_LABELS: Record<string, { emoji: string; color: string }> = {
    instagram: { emoji: '📸', color: '#E1306C' },
    whatsapp: { emoji: '💬', color: '#25D366' },
    facebook: { emoji: '👍', color: '#1877F2' },
    youtube: { emoji: '▶️', color: '#FF0000' },
};

export default function Share() {
    const { id } = useParams<{ id: string }>();
    const campaign = MOCK_CAMPAIGN; // In production: fetch by id
    const { success } = useToast();

    const shareUrl = `${window.location.origin}/c/${id || 'demo'}`;
    const copyLink = () => { navigator.clipboard.writeText(shareUrl); success('Link copied to clipboard! 🔗'); };

    return (
        <div className="min-h-screen bg-bg-primary" style={{ background: 'linear-gradient(135deg, #0A0F1E 0%, #0D1B40 100%)' }}>
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
                <Link to="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                        style={{ background: 'linear-gradient(135deg, #FF6B35, #F7C948)' }}>🇮🇳</div>
                    <span className="font-bold font-poppins gradient-text">BharatMedia</span>
                </Link>
                <span className="text-slate-600 text-sm flex-1">/ Campaign Preview</span>
                <Link to="/campaign/new" className="btn-primary py-1.5 px-4 text-xs">Create Yours →</Link>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-10">
                {/* Campaign meta */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border border-orange-500/30 text-orange-400 bg-orange-500/10 mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        Live Campaign · India 🇮🇳
                    </div>
                    <h1 className="text-4xl font-black font-poppins gradient-text mb-2">Varanasi Silk Sarees</h1>
                    <p className="text-slate-400">Diwali Campaign · Hindi · Generated with Amazon Bedrock Nova Pro</p>

                    {/* BharatScore */}
                    <div className="inline-flex items-center gap-3 mt-4 px-5 py-2.5 rounded-xl glass-card">
                        <span className="text-green-400 text-xl">⭐</span>
                        <div className="text-left">
                            <p className="text-white font-bold font-poppins">BharatScore™ 87/100</p>
                            <p className="text-slate-500 text-xs">Culturally optimized · Passed all guardrails</p>
                        </div>
                    </div>
                </motion.div>

                {/* Content grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {(campaign.content?.images || []).slice(0, 2).map((img: { id: string; url: string; platform: string }, i: number) => (
                        <motion.div key={img.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                            className="rounded-2xl overflow-hidden border border-white/10">
                            <img src={img.url} alt={img.platform} className="w-full h-48 object-cover" />
                            <div className="p-3 flex items-center gap-2 bg-white/4">
                                <span>{PLATFORM_LABELS[img.platform]?.emoji}</span>
                                <span className="text-slate-400 text-xs capitalize">{img.platform} post</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Captions Preview */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                    className="glass-card p-6 mb-8">
                    <h2 className="font-bold font-poppins text-white mb-4">📝 Campaign Captions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(campaign.content?.captions || {}).slice(0, 4).map(([platform, caption]) => (
                            <div key={platform} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span>{PLATFORM_LABELS[platform]?.emoji}</span>
                                    <span className="text-xs font-semibold text-slate-300 capitalize">{platform}</span>
                                </div>
                                <p className="text-slate-400 text-xs line-clamp-3 whitespace-pre-line">{String(caption)}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Share panel */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="glass-card p-6 text-center border-orange-500/20">
                    <h2 className="font-bold font-poppins text-white mb-1">🔗 Share this Campaign</h2>
                    <p className="text-slate-400 text-sm mb-5">Send this link to clients, investors, or your team</p>

                    <div className="flex items-center gap-3 justify-center mb-5">
                        <QRPlaceholder value={shareUrl} />
                        <div className="text-left">
                            <p className="text-xs text-slate-400 mb-2">Shareable URL:</p>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/4">
                                <span className="text-xs font-mono text-slate-300 truncate max-w-40">{shareUrl}</span>
                            </div>
                            <button onClick={copyLink} className="mt-2 text-orange-400 text-xs hover:text-orange-300 transition-colors">
                                📋 Copy Link
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center">
                        {['Copy Link', 'WhatsApp', 'Twitter/X', 'LinkedIn'].map(s => (
                            <button key={s} onClick={copyLink}
                                className="px-4 py-2 rounded-xl text-xs font-medium glass-card hover:border-orange-500/30 transition-all text-slate-300">
                                {s === 'Copy Link' ? '📋' : s === 'WhatsApp' ? '💬' : s === 'Twitter/X' ? '🐦' : '💼'} {s}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* CTA */}
                <div className="text-center mt-10">
                    <p className="text-slate-400 mb-4">Want campaigns like this for your business?</p>
                    <Link to="/campaign/new" className="btn-primary text-base py-3 px-8 inline-block">
                        🚀 Create Free Campaign
                    </Link>
                </div>
            </div>
        </div>
    );
}
