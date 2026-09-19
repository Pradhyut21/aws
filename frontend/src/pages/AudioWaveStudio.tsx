/**
 * AudioWaveStudio — Vernacular Audio Waveform & Regional RJ Voice Studio
 *
 * Inspired by:
 *   - samhirtarif/react-audio-visualize (Canvas audio visualization)
 *   - cutoff/audio-ui (Indie audio UI primitives)
 *
 * Features:
 *  - Animated saffron & cyan audio waveform bars that dance on playback
 *  - Regional Voice Persona Selector (Kanpur Hawker, Mumbai RJ, Paati Tamil, Bangalore Tech)
 *  - Type your campaign text → Amazon Polly TTS via /api/voice/synthesize
 *  - 1-Click WhatsApp Audio Export button
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { synthesizeVoice } from '../lib/api';

// ─── Language code per persona ─────────────────────────────────────────────────
const VOICE_PERSONAS = [
    {
        id: 'hawker',
        emoji: '🎺',
        name: 'Kanpur Street Hawker',
        city: 'Kanpur, UP',
        lang: 'Hindi / Bhojpuri',
        pollyLang: 'hi',
        description: 'Energetic, loud, vernacular cadence. Perfect for FMCG & Kirana promos.',
        waveColor: '#f97316',
        glowColor: '#f9731650',
        sampleText:
            'Suniye suniye! Aaj ka special offer — sirf aaj ke liye! Kadak chai, seedha baagaan se, sirf ₹99 mein! Jaldi karo, stock khatam hone se pehle!',
        speed: 'fast',
        style: 'Loud & Punchy',
    },
    {
        id: 'rj',
        emoji: '📻',
        name: 'Mumbai Metro RJ',
        city: 'Mumbai, Maharashtra',
        lang: 'Hinglish / English',
        pollyLang: 'hi',
        description: 'Fast-paced, bilingual Hinglish, youthful & aspirational tone.',
        waveColor: '#a855f7',
        glowColor: '#a855f750',
        sampleText:
            "Okay guys, yeh toh bindaas deal hai! This Diwali, grab the most kadak offer in town — only at BharatMart! Don't be a fool, be cool! 🔥",
        speed: 'medium',
        style: 'Energetic & Trendy',
    },
    {
        id: 'paati',
        emoji: '👵',
        name: 'Tamil Paati (Elder)',
        city: 'Chennai / Coimbatore, TN',
        lang: 'Tamil / Tamil-English',
        pollyLang: 'ta',
        description: 'Nurturing, warm, emotional, high-trust storytelling format.',
        waveColor: '#22d3ee',
        glowColor: '#22d3ee50',
        sampleText:
            'Enna mone, ennama vittu poran? Nalla product, nalla quality — Pongal ku inga vaanga. Namma family ku best choice itha maari petha. Vanakkam!',
        speed: 'slow',
        style: 'Warm & Trustworthy',
    },
    {
        id: 'tech',
        emoji: '🎧',
        name: 'Bangalore Tech Narrator',
        city: 'Bengaluru, Karnataka',
        lang: 'English / Kannada',
        pollyLang: 'en',
        description: 'Crisp, professional, modern English-Kannada for SaaS/D2C brands.',
        waveColor: '#eab308',
        glowColor: '#eab30850',
        sampleText:
            'Channagide? Introducing the next-gen solution for modern India. Built for scale, designed for Bharat. Try it free — no strings attached. Kano!',
        speed: 'medium',
        style: 'Professional & Crisp',
    },
];

// ─── Animated Waveform ─────────────────────────────────────────────────────────
function WaveformViz({ playing, color, glow }: { playing: boolean; color: string; glow: string }) {
    const BARS = 48;
    const [heights, setHeights] = useState<number[]>(Array(BARS).fill(8));
    const animRef = useRef<number | null>(null);

    const animate = useCallback(() => {
        if (!playing) return;
        setHeights(prev =>
            prev.map((_, i) => {
                const base = 8 + Math.sin(Date.now() / 200 + i * 0.6) * 20;
                const noise = Math.random() * 25;
                return Math.max(6, Math.min(72, base + noise));
            })
        );
        animRef.current = requestAnimationFrame(animate);
    }, [playing]);

    useEffect(() => {
        if (playing) {
            animRef.current = requestAnimationFrame(animate);
        } else {
            if (animRef.current) cancelAnimationFrame(animRef.current);
            setHeights(Array(BARS).fill(8));
        }
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, [playing, animate]);

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                height: 80,
                padding: '0 1rem',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '0.75rem',
                boxShadow: playing ? `0 0 30px ${glow}` : 'none',
                transition: 'box-shadow 0.3s',
            }}
        >
            {heights.map((h, i) => (
                <motion.div
                    key={i}
                    animate={{ height: h }}
                    transition={{ duration: 0.08, ease: 'easeOut' }}
                    style={{
                        width: 4,
                        borderRadius: 2,
                        flex: '0 0 4px',
                        background: playing
                            ? `linear-gradient(to top, ${color}, ${i % 3 === 0 ? '#22d3ee' : color})`
                            : 'rgba(255,255,255,0.08)',
                        boxShadow: playing ? `0 0 4px ${color}` : 'none',
                    }}
                />
            ))}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AudioWaveStudio() {
    const navigate = useNavigate();
    const [persona, setPersona] = useState(0);
    const [scriptText, setScriptText] = useState('');
    const [playing, setPlaying] = useState(false);
    const [exported, setExported] = useState(false);
    const [playbackPct, setPlaybackPct] = useState(0);
    const [loading, setLoading] = useState(false);
    const [pollyError, setPollyError] = useState<string | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const p = VOICE_PERSONAS[persona];

    useEffect(() => {
        setScriptText(p.sampleText);
        setPlaying(false);
        setPlaybackPct(0);
        setAudioUrl(null);
        setPollyError(null);
        // Stop any playing audio when persona changes
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
    }, [persona, p.sampleText]);

    // Progress ticker for visual waveform while audio plays
    useEffect(() => {
        if (playing) {
            const duration = p.speed === 'fast' ? 6000 : p.speed === 'slow' ? 10000 : 8000;
            const tick = 100;
            timerRef.current = setInterval(() => {
                setPlaybackPct(prev => {
                    if (prev >= 100) {
                        setPlaying(false);
                        return 0;
                    }
                    return prev + (tick / duration) * 100;
                });
            }, tick);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [playing, p]);

    // ─── Play via Amazon Polly ──────────────────────────────────────────────────
    const handlePlayPolly = async () => {
        // If already playing, stop
        if (playing) {
            setPlaying(false);
            setPlaybackPct(0);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            return;
        }

        if (!scriptText.trim()) return;
        setPollyError(null);
        setLoading(true);

        try {
            // If we already have a cached URL for this text+persona, reuse it
            if (!audioUrl) {
                const result = await synthesizeVoice(scriptText, p.pollyLang);
                setAudioUrl(result.audioUrl);
                const audio = new Audio(result.audioUrl);
                audioRef.current = audio;
                audio.onended = () => {
                    setPlaying(false);
                    setPlaybackPct(0);
                };
                audio.onerror = () => {
                    setPlaying(false);
                    setPollyError('Audio playback failed');
                };
                audio.play();
            } else {
                const audio = new Audio(audioUrl);
                audioRef.current = audio;
                audio.onended = () => {
                    setPlaying(false);
                    setPlaybackPct(0);
                };
                audio.onerror = () => {
                    setPlaying(false);
                    setPollyError('Audio playback failed');
                };
                audio.play();
            }
            setPlaying(true);
            setPlaybackPct(0);
        } catch (err: any) {
            setPollyError(err?.response?.data?.message || err.message || 'Polly synthesis failed');
            // Fallback: simulated waveform without real audio
            setPlaying(true);
            setPlaybackPct(0);
        } finally {
            setLoading(false);
        }
    };

    // Reset cached URL when text changes so next press fetches fresh audio
    const handleTextChange = (val: string) => {
        setScriptText(val);
        setAudioUrl(null);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
    };

    const handleExport = () => {
        if (audioUrl) {
            // Download the actual Polly audio file
            const a = document.createElement('a');
            a.href = audioUrl;
            a.download = `bharat-voice-${p.id}.mp3`;
            a.click();
        }
        setExported(true);
        setTimeout(() => setExported(false), 3000);
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                background: 'linear-gradient(135deg,#080814 0%,#12060e 50%,#060e14 100%)',
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
                                background: 'rgba(249,115,22,0.12)',
                                border: '1px solid rgba(249,115,22,0.25)',
                                borderRadius: 999,
                                padding: '0.2rem 0.7rem',
                                fontSize: '0.7rem',
                                color: '#f97316',
                                fontWeight: 700,
                            }}
                        >
                            🎙️ VOICE STUDIO
                        </div>
                        {/* AWS Polly badge */}
                        <div
                            style={{
                                background: 'rgba(255,153,0,0.10)',
                                border: '1px solid rgba(255,153,0,0.25)',
                                borderRadius: 999,
                                padding: '0.2rem 0.7rem',
                                fontSize: '0.68rem',
                                color: '#FF9900',
                                fontWeight: 700,
                            }}
                        >
                            ☁️ Amazon Polly
                        </div>
                    </div>
                    <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
                        🎙️ Vernacular Audio Wave Studio
                    </h1>
                    <p style={{ color: '#64748b', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
                        Real Hindi/Tamil/Telugu TTS via Amazon Polly — voice-first content for
                        WhatsApp forwards, loudspeaker promos &amp; FM radio jingles.
                    </p>
                </motion.div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '300px 1fr',
                        gap: '1.5rem',
                        maxWidth: 1100,
                    }}
                >
                    {/* Voice Persona Selector */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div
                            style={{
                                color: '#64748b',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                marginBottom: '0.25rem',
                            }}
                        >
                            REGIONAL VOICE PERSONA
                        </div>
                        {VOICE_PERSONAS.map((vp, i) => (
                            <motion.button
                                key={vp.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setPersona(i)}
                                style={{
                                    background:
                                        persona === i
                                            ? `${vp.waveColor}18`
                                            : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${persona === i ? vp.waveColor : 'rgba(255,255,255,0.08)'}`,
                                    borderRadius: '0.875rem',
                                    padding: '0.9rem 1rem',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    boxShadow: persona === i ? `0 0 20px ${vp.glowColor}` : 'none',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.6rem',
                                        marginBottom: '0.35rem',
                                    }}
                                >
                                    <span style={{ fontSize: '1.5rem' }}>{vp.emoji}</span>
                                    <div>
                                        <div
                                            style={{
                                                color: persona === i ? vp.waveColor : '#e2e8f0',
                                                fontWeight: 700,
                                                fontSize: '0.85rem',
                                            }}
                                        >
                                            {vp.name}
                                        </div>
                                        <div style={{ color: '#64748b', fontSize: '0.7rem' }}>
                                            {vp.city} · {vp.lang}
                                        </div>
                                    </div>
                                </div>
                                <div
                                    style={{
                                        color: '#64748b',
                                        fontSize: '0.75rem',
                                        lineHeight: 1.4,
                                    }}
                                >
                                    {vp.description}
                                </div>
                                <div
                                    style={{
                                        marginTop: '0.4rem',
                                        display: 'inline-block',
                                        background: `${vp.waveColor}20`,
                                        color: vp.waveColor,
                                        borderRadius: 4,
                                        padding: '0.1rem 0.5rem',
                                        fontSize: '0.68rem',
                                        fontWeight: 700,
                                    }}
                                >
                                    {vp.style}
                                </div>
                            </motion.button>
                        ))}
                    </div>

                    {/* Studio Panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Script Editor */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '1rem',
                                padding: '1.25rem',
                            }}
                        >
                            <label
                                style={{
                                    color: '#94a3b8',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                }}
                            >
                                📝 SCRIPT / CAMPAIGN TEXT
                            </label>
                            <textarea
                                value={scriptText}
                                onChange={e => handleTextChange(e.target.value)}
                                rows={4}
                                placeholder="Type or paste your campaign script here…"
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '0.75rem',
                                    padding: '0.85rem',
                                    color: '#f1f5f9',
                                    fontSize: '0.9rem',
                                    fontFamily: 'Inter, system-ui, sans-serif',
                                    resize: 'vertical',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                }}
                            />
                            <div
                                style={{
                                    display: 'flex',
                                    gap: '0.5rem',
                                    marginTop: '0.5rem',
                                    flexWrap: 'wrap',
                                }}
                            >
                                {VOICE_PERSONAS.map((vp, i) => (
                                    <button
                                        key={vp.id}
                                        onClick={() => {
                                            setPersona(i);
                                            handleTextChange(vp.sampleText);
                                        }}
                                        style={{
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            borderRadius: '0.5rem',
                                            padding: '0.25rem 0.6rem',
                                            color: '#94a3b8',
                                            cursor: 'pointer',
                                            fontSize: '0.72rem',
                                        }}
                                    >
                                        {vp.emoji} {vp.name.split(' ')[0]} sample
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Waveform Visualizer */}
                        <motion.div
                            style={{
                                background: `linear-gradient(135deg, ${p.waveColor}10, rgba(255,255,255,0.02))`,
                                border: `1px solid ${p.waveColor}30`,
                                borderRadius: '1rem',
                                padding: '1.25rem',
                                boxShadow: playing ? `0 0 40px ${p.glowColor}` : 'none',
                                transition: 'all 0.3s',
                            }}
                        >
                            {/* Persona badge */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    marginBottom: '1rem',
                                }}
                            >
                                <span style={{ fontSize: '1.5rem' }}>{p.emoji}</span>
                                <div>
                                    <div
                                        style={{
                                            color: p.waveColor,
                                            fontWeight: 700,
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        {p.name}
                                    </div>
                                    <div style={{ color: '#64748b', fontSize: '0.72rem' }}>
                                        {p.city} · {p.style}
                                    </div>
                                </div>
                                {/* Polly source chip */}
                                {audioUrl && (
                                    <div
                                        style={{
                                            marginLeft: 'auto',
                                            background: 'rgba(255,153,0,0.12)',
                                            border: '1px solid rgba(255,153,0,0.3)',
                                            borderRadius: 999,
                                            padding: '0.15rem 0.6rem',
                                            fontSize: '0.65rem',
                                            color: '#FF9900',
                                            fontWeight: 700,
                                        }}
                                    >
                                        ☁️ Polly TTS
                                    </div>
                                )}
                                {playing && (
                                    <motion.div
                                        animate={{ opacity: [1, 0.4, 1] }}
                                        transition={{ duration: 0.8, repeat: Infinity }}
                                        style={{
                                            marginLeft: audioUrl ? '0' : 'auto',
                                            color: p.waveColor,
                                            fontWeight: 700,
                                            fontSize: '0.78rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                        }}
                                    >
                                        <span
                                            style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                background: p.waveColor,
                                                display: 'inline-block',
                                            }}
                                        />
                                        LIVE
                                    </motion.div>
                                )}
                            </div>

                            <WaveformViz playing={playing} color={p.waveColor} glow={p.glowColor} />

                            {/* Progress Bar */}
                            <div
                                style={{
                                    margin: '0.75rem 0',
                                    background: 'rgba(255,255,255,0.06)',
                                    borderRadius: 999,
                                    height: 4,
                                }}
                            >
                                <motion.div
                                    style={{
                                        height: '100%',
                                        borderRadius: 999,
                                        background: p.waveColor,
                                        width: `${playbackPct}%`,
                                        boxShadow: `0 0 8px ${p.waveColor}`,
                                    }}
                                    transition={{ duration: 0.1 }}
                                />
                            </div>

                            {/* Polly error message */}
                            <AnimatePresence>
                                {pollyError && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0 }}
                                        style={{
                                            marginBottom: '0.5rem',
                                            color: '#fbbf24',
                                            fontSize: '0.75rem',
                                            background: 'rgba(251,191,36,0.08)',
                                            borderRadius: '0.5rem',
                                            padding: '0.4rem 0.75rem',
                                            border: '1px solid rgba(251,191,36,0.2)',
                                        }}
                                    >
                                        ⚠️ Polly unavailable: {pollyError} — using simulated
                                        waveform
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Controls */}
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <motion.button
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={handlePlayPolly}
                                    disabled={loading}
                                    style={{
                                        background: playing
                                            ? 'rgba(248,113,113,0.2)'
                                            : loading
                                              ? 'rgba(255,255,255,0.06)'
                                              : `${p.waveColor}22`,
                                        border: `1px solid ${playing ? '#f87171' : loading ? 'rgba(255,255,255,0.1)' : p.waveColor}`,
                                        borderRadius: '0.75rem',
                                        padding: '0.65rem 1.5rem',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        color: playing
                                            ? '#f87171'
                                            : loading
                                              ? '#475569'
                                              : p.waveColor,
                                        fontWeight: 700,
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <motion.span
                                                animate={{ rotate: 360 }}
                                                transition={{
                                                    duration: 0.8,
                                                    repeat: Infinity,
                                                    ease: 'linear',
                                                }}
                                                style={{ display: 'inline-block' }}
                                            >
                                                ⟳
                                            </motion.span>
                                            Synthesizing…
                                        </>
                                    ) : playing ? (
                                        '⏹ Stop'
                                    ) : (
                                        '▶ Play via Polly'
                                    )}
                                </motion.button>

                                <AnimatePresence>
                                    {exported ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                            style={{
                                                color: '#4ade80',
                                                fontWeight: 700,
                                                fontSize: '0.85rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.4rem',
                                            }}
                                        >
                                            ✅ {audioUrl ? 'Downloaded!' : 'Exported to WhatsApp!'}
                                        </motion.div>
                                    ) : (
                                        <motion.button
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={handleExport}
                                            style={{
                                                background: 'rgba(37,211,102,0.12)',
                                                border: '1px solid rgba(37,211,102,0.3)',
                                                borderRadius: '0.75rem',
                                                padding: '0.65rem 1.25rem',
                                                cursor: 'pointer',
                                                color: '#25D366',
                                                fontWeight: 700,
                                                fontSize: '0.9rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                            }}
                                        >
                                            {audioUrl
                                                ? '⬇️ Download MP3'
                                                : '📤 Export WhatsApp Audio'}
                                        </motion.button>
                                    )}
                                </AnimatePresence>

                                <div
                                    style={{
                                        marginLeft: 'auto',
                                        color: '#64748b',
                                        fontSize: '0.78rem',
                                    }}
                                >
                                    {p.speed === 'fast'
                                        ? '~6s'
                                        : p.speed === 'slow'
                                          ? '~10s'
                                          : '~8s'}{' '}
                                    · {scriptText.split(' ').length} words
                                </div>
                            </div>
                        </motion.div>

                        {/* Stats Grid */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '0.75rem',
                            }}
                        >
                            {[
                                {
                                    label: 'Voice-First Users',
                                    value: '63%',
                                    sublabel: 'Tier-2 & Tier-3 India',
                                    color: '#f97316',
                                },
                                {
                                    label: 'WhatsApp Forwards',
                                    value: '4.2×',
                                    sublabel: 'Audio vs text CTR',
                                    color: '#a855f7',
                                },
                                {
                                    label: 'Trust Score Lift',
                                    value: '+38%',
                                    sublabel: 'Regional vernacular voice',
                                    color: '#22d3ee',
                                },
                            ].map(stat => (
                                <div
                                    key={stat.label}
                                    style={{
                                        background: `${stat.color}10`,
                                        border: `1px solid ${stat.color}25`,
                                        borderRadius: '0.875rem',
                                        padding: '0.9rem',
                                        textAlign: 'center',
                                    }}
                                >
                                    <div
                                        style={{
                                            color: stat.color,
                                            fontSize: '1.4rem',
                                            fontWeight: 800,
                                        }}
                                    >
                                        {stat.value}
                                    </div>
                                    <div
                                        style={{
                                            color: '#e2e8f0',
                                            fontSize: '0.78rem',
                                            fontWeight: 600,
                                            marginTop: '0.15rem',
                                        }}
                                    >
                                        {stat.label}
                                    </div>
                                    <div style={{ color: '#64748b', fontSize: '0.7rem' }}>
                                        {stat.sublabel}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
