/**
 * PosterStudio — 1-Click WhatsApp Festival Status & Greeting Poster Studio
 *
 * Inspired by:
 *   - bubkoo/html-to-image (⭐4.8k — Client-side DOM to high-res PNG)
 *   - fabricjs/fabric.js (⭐27k — Canvas engine for overlays)
 *
 * Features:
 *  - Festive theme selector: Diwali, Ganesh, Eid, Pongal, Independence Day, Holi, Navratri
 *  - Brand customization: name, WhatsApp number, tagline
 *  - Instant 9:16 WhatsApp Status & 1:1 Instagram Feed download via html-to-image
 *  - Ornate Indian gold borders, Diya/Rangoli vector motifs per festival
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toPng } from 'html-to-image';
import Sidebar from '../components/layout/Sidebar';

// ─── Festival Themes ───────────────────────────────────────────────────────────
interface FestivalTheme {
    id: string;
    name: string;
    emoji: string;
    headline: string;
    subline: string;
    gradient: string;
    accentColor: string;
    borderColor: string;
    motif: string;
    dateHint: string;
    lang: string;
}

const FESTIVALS: FestivalTheme[] = [
    {
        id: 'diwali',
        name: 'Diwali Dhamaka',
        emoji: '🪔',
        headline: 'शुभ दीपावली',
        subline: 'May this Diwali light up your life with joy, peace & prosperity!',
        gradient: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 50%, #1a0500 100%)',
        accentColor: '#f59e0b',
        borderColor: '#fbbf24',
        motif: '🪔✨🎆🌟🎊',
        dateHint: 'October / November',
        lang: 'Hindi',
    },
    {
        id: 'pongal',
        name: 'Pongal Kondattam',
        emoji: '🌾',
        headline: 'இனிய பொங்கல் நல்வாழ்த்துக்கள்',
        subline: 'Wishing you a harvest of joy, health and abundance this Pongal!',
        gradient: 'linear-gradient(135deg, #001a06 0%, #00330d 50%, #001a06 100%)',
        accentColor: '#22c55e',
        borderColor: '#4ade80',
        motif: '🌾🌻🪣🌿🎋',
        dateHint: 'January 14–17',
        lang: 'Tamil',
    },
    {
        id: 'eid',
        name: 'Eid Mubarak',
        emoji: '🌙',
        headline: 'عيد مبارك',
        subline: 'Eid Mubarak! May this blessed occasion bring you joy and peace.',
        gradient: 'linear-gradient(135deg, #001425 0%, #002640 50%, #001425 100%)',
        accentColor: '#22d3ee',
        borderColor: '#67e8f9',
        motif: '🌙⭐🕌✨🌟',
        dateHint: 'Ramzan / Bakrid',
        lang: 'Urdu / English',
    },
    {
        id: 'ganesh',
        name: 'Ganesh Utsav',
        emoji: '🐘',
        headline: 'गणपती बाप्पा मोरया!',
        subline: 'Celebrating the festival of wisdom, prosperity and new beginnings!',
        gradient: 'linear-gradient(135deg, #1a0800 0%, #2d1500 50%, #1a0a00 100%)',
        accentColor: '#f97316',
        borderColor: '#fb923c',
        motif: '🐘🌸🍊🌺✨',
        dateHint: 'Aug–Sep (11 days)',
        lang: 'Marathi / Hindi',
    },
    {
        id: 'independence',
        name: 'Independence Day',
        emoji: '🇮🇳',
        headline: 'जय हिन्द! 🇮🇳',
        subline: 'Happy Independence Day! Celebrating 78 years of proud, free India.',
        gradient: 'linear-gradient(135deg, #0a1a00 0%, #001a0a 50%, #1a0a0a 100%)',
        accentColor: '#4ade80',
        borderColor: '#86efac',
        motif: '🇮🇳🏏🦚🌺✨',
        dateHint: 'August 15',
        lang: 'Hindi / English',
    },
    {
        id: 'holi',
        name: 'Holi Festival',
        emoji: '🎨',
        headline: 'होली की ढेर सारी शुभकामनाएँ!',
        subline: 'May your life be as colorful as the colors of Holi! Play safe!',
        gradient: 'linear-gradient(135deg, #1a0020 0%, #20001a 50%, #001220 100%)',
        accentColor: '#e879f9',
        borderColor: '#f0abfc',
        motif: '🎨🌈💜🟣🔵',
        dateHint: 'March (Purnima)',
        lang: 'Hindi / English',
    },
    {
        id: 'navratri',
        name: 'Navratri Garba',
        emoji: '💃',
        headline: 'नवरात्रि की हार्दिक शुभकामनाएँ',
        subline: 'Garba nights, dandiya beats, divine blessings — Happy Navratri!',
        gradient: 'linear-gradient(135deg, #1a0014 0%, #2d0022 50%, #1a0014 100%)',
        accentColor: '#c026d3',
        borderColor: '#e879f9',
        motif: '💃🏮🌺🙏✨',
        dateHint: 'October (9 nights)',
        lang: 'Gujarati / Hindi',
    },
];

// ─── Poster Canvas ─────────────────────────────────────────────────────────────
interface PosterProps {
    theme: FestivalTheme;
    brandName: string;
    tagline: string;
    phone: string;
    mode: '9:16' | '1:1';
}

function PosterCanvas({ theme, brandName, tagline, phone, mode }: PosterProps) {
    const is916 = mode === '9:16';
    const w = is916 ? 240 : 280;
    const h = is916 ? 426 : 280;

    return (
        <div
            style={{
                width: w,
                height: h,
                background: theme.gradient,
                borderRadius: '1rem',
                border: `3px solid ${theme.borderColor}`,
                boxShadow: `0 0 40px ${theme.accentColor}40, inset 0 0 60px rgba(0,0,0,0.4)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1rem',
                overflow: 'hidden',
                position: 'relative',
                fontFamily: 'Inter, system-ui, sans-serif',
            }}
        >
            {/* Corner ornaments */}
            {['0 0', `${w - 20}px 0`, `0 ${h - 20}px`, `${w - 20}px ${h - 20}px`].map((pos, i) => (
                <div
                    key={i}
                    style={{
                        position: 'absolute',
                        left: pos.split(' ')[0],
                        top: pos.split(' ')[1],
                        color: theme.accentColor,
                        fontSize: '0.9rem',
                        opacity: 0.7,
                        userSelect: 'none',
                    }}
                >
                    ✦
                </div>
            ))}

            {/* Top motifs */}
            <div style={{ textAlign: 'center', zIndex: 1 }}>
                <div style={{ fontSize: is916 ? '2rem' : '1.5rem', letterSpacing: '0.15em' }}>
                    {theme.motif.split('').join('')}
                </div>
                <div
                    style={{
                        marginTop: '0.5rem',
                        color: theme.accentColor,
                        fontSize: is916 ? '0.65rem' : '0.6rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        opacity: 0.7,
                    }}
                >
                    {theme.lang} · {theme.dateHint}
                </div>
            </div>

            {/* Festival name + headline */}
            <div style={{ textAlign: 'center', zIndex: 1 }}>
                <div
                    style={{
                        color: theme.accentColor,
                        fontSize: is916 ? '0.72rem' : '0.65rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        marginBottom: '0.5rem',
                        opacity: 0.8,
                    }}
                >
                    {theme.name}
                </div>
                <div
                    style={{
                        color: '#fff',
                        fontSize: is916 ? '1.3rem' : '1.1rem',
                        fontWeight: 900,
                        lineHeight: 1.25,
                        marginBottom: '0.6rem',
                        textShadow: `0 0 20px ${theme.accentColor}`,
                    }}
                >
                    {theme.headline}
                </div>
                <div
                    style={{
                        color: theme.accentColor + 'cc',
                        fontSize: is916 ? '0.65rem' : '0.6rem',
                        lineHeight: 1.5,
                        maxWidth: '85%',
                        margin: '0 auto',
                    }}
                >
                    {theme.subline}
                </div>
            </div>

            {/* Divider */}
            <div
                style={{
                    width: '70%',
                    height: 1,
                    background: `linear-gradient(90deg, transparent, ${theme.accentColor}, transparent)`,
                    opacity: 0.5,
                }}
            />

            {/* Brand footer */}
            <div style={{ textAlign: 'center', zIndex: 1, width: '100%' }}>
                <div
                    style={{
                        color: '#fff',
                        fontSize: is916 ? '0.95rem' : '0.85rem',
                        fontWeight: 800,
                    }}
                >
                    {brandName || 'Your Brand Name'}
                </div>
                {tagline && (
                    <div
                        style={{
                            color: theme.accentColor + 'aa',
                            fontSize: is916 ? '0.6rem' : '0.55rem',
                            marginTop: 2,
                        }}
                    >
                        {tagline}
                    </div>
                )}
                {phone && (
                    <div
                        style={{
                            marginTop: '0.35rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            background: `${theme.accentColor}20`,
                            borderRadius: 999,
                            padding: '0.15rem 0.65rem',
                            border: `1px solid ${theme.accentColor}40`,
                        }}
                    >
                        <span style={{ fontSize: '0.7rem' }}>📱</span>
                        <span
                            style={{
                                color: theme.accentColor,
                                fontSize: is916 ? '0.65rem' : '0.6rem',
                                fontWeight: 700,
                            }}
                        >
                            {phone}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PosterStudio() {
    const navigate = useNavigate();
    const [festival, setFestival] = useState(0);
    const [brandName, setBrandName] = useState('');
    const [tagline, setTagline] = useState('');
    const [phone, setPhone] = useState('');
    const [downloading, setDownloading] = useState<string | null>(null);
    const poster916Ref = useRef<HTMLDivElement>(null);
    const poster11Ref = useRef<HTMLDivElement>(null);

    const theme = FESTIVALS[festival];

    const downloadPoster = async (mode: '9:16' | '1:1') => {
        const ref = mode === '9:16' ? poster916Ref : poster11Ref;
        if (!ref.current) return;
        setDownloading(mode);
        try {
            const dataUrl = await toPng(ref.current, { quality: 1, pixelRatio: 3 });
            const link = document.createElement('a');
            link.download = `${theme.id}_${mode.replace(':', 'x')}_poster.png`;
            link.href = dataUrl;
            link.click();
        } catch (e) {
            console.error('Download failed:', e);
        }
        setDownloading(null);
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                background: 'linear-gradient(135deg,#0a0814 0%,#0a1408 50%,#140a08 100%)',
            }}
        >
            <Sidebar />
            <main
                style={{
                    flex: 1,
                    marginLeft: 220,
                    padding: '2rem',
                    fontFamily: 'Inter, system-ui, sans-serif',
                }}
            >
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '1.5rem' }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            marginBottom: '0.3rem',
                        }}
                    >
                        <button
                            onClick={() => navigate('/dashboard')}
                            style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#94a3b8',
                                borderRadius: '0.5rem',
                                padding: '0.4rem 0.9rem',
                                cursor: 'pointer',
                                fontSize: '0.82rem',
                            }}
                        >
                            ← Dashboard
                        </button>
                        <div
                            style={{
                                background: 'rgba(245,158,11,0.12)',
                                border: '1px solid rgba(245,158,11,0.25)',
                                borderRadius: 999,
                                padding: '0.2rem 0.7rem',
                                fontSize: '0.7rem',
                                color: '#f59e0b',
                                fontWeight: 700,
                            }}
                        >
                            🎨 POSTER STUDIO
                        </div>
                    </div>
                    <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
                        🎉 Festival Poster Studio
                    </h1>
                    <p style={{ color: '#64748b', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
                        1-click WhatsApp Status & Instagram Feed poster generator for Indian
                        festivals. Download as 9:16 or 1:1.
                    </p>
                </motion.div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '320px 1fr',
                        gap: '1.5rem',
                        maxWidth: 1100,
                    }}
                >
                    {/* Controls */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        {/* Festival Picker */}
                        <div
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: '1rem',
                                padding: '1rem',
                            }}
                        >
                            <div
                                style={{
                                    color: '#64748b',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    marginBottom: '0.65rem',
                                }}
                            >
                                🎊 Festival Theme
                            </div>
                            <div
                                style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
                            >
                                {FESTIVALS.map((f, i) => (
                                    <button
                                        key={f.id}
                                        onClick={() => setFestival(i)}
                                        style={{
                                            background:
                                                festival === i
                                                    ? f.accentColor + '18'
                                                    : 'rgba(255,255,255,0.03)',
                                            border: `1px solid ${festival === i ? f.accentColor : 'rgba(255,255,255,0.07)'}`,
                                            borderRadius: '0.65rem',
                                            padding: '0.55rem 0.85rem',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.65rem',
                                            transition: 'all 0.15s',
                                            boxShadow:
                                                festival === i
                                                    ? `0 0 12px ${f.accentColor}25`
                                                    : 'none',
                                        }}
                                    >
                                        <span style={{ fontSize: '1.2rem' }}>{f.emoji}</span>
                                        <div>
                                            <div
                                                style={{
                                                    color:
                                                        festival === i ? f.accentColor : '#e2e8f0',
                                                    fontWeight: 700,
                                                    fontSize: '0.82rem',
                                                }}
                                            >
                                                {f.name}
                                            </div>
                                            <div style={{ color: '#64748b', fontSize: '0.68rem' }}>
                                                {f.dateHint}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Brand Fields */}
                        <div
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: '1rem',
                                padding: '1rem',
                            }}
                        >
                            <div
                                style={{
                                    color: '#64748b',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    marginBottom: '0.65rem',
                                }}
                            >
                                🏪 Your Brand
                            </div>
                            {[
                                {
                                    label: 'Brand / Shop Name',
                                    value: brandName,
                                    set: setBrandName,
                                    placeholder: 'e.g. Raju Silk House',
                                },
                                {
                                    label: 'Tagline (optional)',
                                    value: tagline,
                                    set: setTagline,
                                    placeholder: 'e.g. Pure & Authentic Since 1985',
                                },
                                {
                                    label: 'WhatsApp Number',
                                    value: phone,
                                    set: setPhone,
                                    placeholder: 'e.g. +91 98765 43210',
                                },
                            ].map(field => (
                                <div key={field.label} style={{ marginBottom: '0.6rem' }}>
                                    <label
                                        style={{
                                            color: '#94a3b8',
                                            fontSize: '0.72rem',
                                            fontWeight: 600,
                                            display: 'block',
                                            marginBottom: '0.25rem',
                                        }}
                                    >
                                        {field.label}
                                    </label>
                                    <input
                                        value={field.value}
                                        onChange={e => field.set(e.target.value)}
                                        placeholder={field.placeholder}
                                        style={{
                                            width: '100%',
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '0.5rem',
                                            padding: '0.55rem 0.75rem',
                                            color: '#f1f5f9',
                                            fontSize: '0.85rem',
                                            fontFamily: 'Inter, system-ui, sans-serif',
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Preview & Download */}
                    <div>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1.5rem',
                                alignItems: 'start',
                            }}
                        >
                            {/* 9:16 Preview */}
                            <div>
                                <div
                                    style={{
                                        color: '#64748b',
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                        marginBottom: '0.65rem',
                                    }}
                                >
                                    📱 9:16 — WhatsApp Status
                                </div>
                                <div ref={poster916Ref} style={{ display: 'inline-block' }}>
                                    <PosterCanvas
                                        theme={theme}
                                        brandName={brandName}
                                        tagline={tagline}
                                        phone={phone}
                                        mode="9:16"
                                    />
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => downloadPoster('9:16')}
                                    disabled={downloading === '9:16'}
                                    style={{
                                        marginTop: '0.75rem',
                                        width: 240,
                                        background:
                                            downloading === '9:16'
                                                ? 'rgba(255,255,255,0.06)'
                                                : 'rgba(37,211,102,0.12)',
                                        border: `1px solid ${downloading === '9:16' ? 'rgba(255,255,255,0.1)' : 'rgba(37,211,102,0.3)'}`,
                                        borderRadius: '0.75rem',
                                        padding: '0.6rem',
                                        cursor: 'pointer',
                                        color: downloading === '9:16' ? '#475569' : '#25D366',
                                        fontWeight: 700,
                                        fontSize: '0.85rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                    }}
                                >
                                    {downloading === '9:16'
                                        ? '⏳ Generating…'
                                        : '📤 Download WhatsApp'}
                                </motion.button>
                            </div>

                            {/* 1:1 Preview */}
                            <div>
                                <div
                                    style={{
                                        color: '#64748b',
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                        marginBottom: '0.65rem',
                                    }}
                                >
                                    📸 1:1 — Instagram Feed
                                </div>
                                <div ref={poster11Ref} style={{ display: 'inline-block' }}>
                                    <PosterCanvas
                                        theme={theme}
                                        brandName={brandName}
                                        tagline={tagline}
                                        phone={phone}
                                        mode="1:1"
                                    />
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => downloadPoster('1:1')}
                                    disabled={downloading === '1:1'}
                                    style={{
                                        marginTop: '0.75rem',
                                        width: 280,
                                        background:
                                            downloading === '1:1'
                                                ? 'rgba(255,255,255,0.06)'
                                                : 'rgba(225,48,108,0.12)',
                                        border: `1px solid ${downloading === '1:1' ? 'rgba(255,255,255,0.1)' : 'rgba(225,48,108,0.3)'}`,
                                        borderRadius: '0.75rem',
                                        padding: '0.6rem',
                                        cursor: 'pointer',
                                        color: downloading === '1:1' ? '#475569' : '#E1306C',
                                        fontWeight: 700,
                                        fontSize: '0.85rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                    }}
                                >
                                    {downloading === '1:1'
                                        ? '⏳ Generating…'
                                        : '📸 Download Instagram'}
                                </motion.button>
                            </div>
                        </div>

                        {/* Feature note */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            style={{
                                marginTop: '1.5rem',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '0.875rem',
                                padding: '0.9rem 1.1rem',
                                color: '#64748b',
                                fontSize: '0.78rem',
                                lineHeight: 1.6,
                            }}
                        >
                            💡{' '}
                            <strong style={{ color: '#94a3b8' }}>Powered by html-to-image</strong> —
                            downloads high-res PNG at 3× pixel density. No server needed, runs
                            entirely in your browser. Add your brand name above to personalize!
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}
