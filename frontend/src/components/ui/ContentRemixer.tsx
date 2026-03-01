import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from './ToastProvider';

interface RemixTone {
    id: string;
    emoji: string;
    label: string;
    color: string;
    sampleSuffix: string;
}

const REMIX_TONES: RemixTone[] = [
    { id: 'festival', emoji: '🎆', label: 'Festival Mode', color: '#F7C948', sampleSuffix: '🎆 Diwali Special! Great deals this festive season. Hurry!' },
    { id: 'urgent', emoji: '⚡', label: 'Urgent Sale', color: '#FF4444', sampleSuffix: '⚡ LAST 24 HOURS! Don\'t miss this deal — stock is running out!' },
    { id: 'premium', emoji: '👑', label: 'Premium Feel', color: '#9B5DE5', sampleSuffix: '👑 Exclusive collection for those who appreciate the finest.' },
    { id: 'friendly', emoji: '🤝', label: 'Friendly Local', color: '#00FF88', sampleSuffix: '🙏 Namaskar friends! Come visit us — like family, always!' },
    { id: 'viral', emoji: '🔥', label: 'Viral/Trendy', color: '#FF6B35', sampleSuffix: '🔥 Everyone\'s talking about it! See why → limited stock!' },
    { id: 'trust', emoji: '🛡️', label: 'Trust Builder', color: '#00D4FF', sampleSuffix: '✅ 10 years in business · 5000+ happy customers · 100% genuine.' },
];

interface ContentRemixerProps {
    originalCaption: string;
    platform: string;
}

export default function ContentRemixer({ originalCaption, platform }: ContentRemixerProps) {
    const [activeTone, setActiveTone] = useState<string | null>(null);
    const [remixedText, setRemixedText] = useState('');
    const [loading, setLoading] = useState(false);
    const { success } = useToast();

    const remixCaption = (tone: RemixTone) => {
        setActiveTone(tone.id);
        setLoading(true);
        // Simulate AI remixing
        setTimeout(() => {
            const remixed = `${originalCaption.slice(0, 80).trim()}...\n\n${tone.sampleSuffix}`;
            setRemixedText(remixed);
            setLoading(false);
        }, 900);
    };

    const copyRemixed = () => {
        navigator.clipboard.writeText(remixedText);
        success('Remixed caption copied! 🔄');
    };

    return (
        <div className="glass-card p-5 border-purple-500/20">
            <h4 className="font-bold font-poppins text-white mb-1 flex items-center gap-2">
                🔄 AI Content Remixer
                <span className="text-xs font-mono text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded border border-purple-400/20">
                    Nova Pro
                </span>
            </h4>
            <p className="text-slate-400 text-xs mb-4">Re-tone your {platform} caption for different occasions</p>

            {/* Tone buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
                {REMIX_TONES.map(tone => (
                    <button
                        key={tone.id}
                        onClick={() => remixCaption(tone)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
                        style={{
                            background: activeTone === tone.id ? `${tone.color}20` : 'rgba(255,255,255,0.04)',
                            borderColor: activeTone === tone.id ? `${tone.color}60` : 'rgba(255,255,255,0.08)',
                            color: activeTone === tone.id ? tone.color : '#94A3B8',
                            boxShadow: activeTone === tone.id ? `0 0 12px ${tone.color}30` : 'none',
                        }}
                    >
                        <span>{tone.emoji}</span> {tone.label}
                    </button>
                ))}
            </div>

            {/* Result */}
            <AnimatePresence>
                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2 text-sm text-slate-400 py-3">
                        <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                        AI remixing tone...
                    </motion.div>
                )}
                {remixedText && !loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl p-4"
                        style={{ background: 'rgba(155,93,229,0.08)', border: '1px solid rgba(155,93,229,0.2)' }}
                    >
                        <p className="text-slate-200 text-sm whitespace-pre-line leading-relaxed mb-3">{remixedText}</p>
                        <button onClick={copyRemixed}
                            className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
                            📋 Copy remixed version
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
