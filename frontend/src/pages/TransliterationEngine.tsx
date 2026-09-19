/**
 * TransliterationEngine — Hinglish / Tanglish Live Transliteration Engine
 *
 * Inspired by:
 *   - indic-transliteration/indic_transliteration_py
 *   - Google's nisaba (Indic script processing utilities)
 *
 * Features:
 *  - Real-time 3-way script switcher
 *  - Input: Romanized phonetics
 *  - Output: (1) Native Devanagari/Dravidian Script
 *            (2) Romanized Hinglish/Tanglish (Gen-Z captions)
 *            (3) Hybrid Code-Mixed Banner (bold Hindi in English sentence)
 *  - Language selector: Hindi, Tamil, Telugu, Bengali, Kannada, Punjabi
 */

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';

// ─── Language Configs ──────────────────────────────────────────────────────────
interface LangConfig {
    code: string;
    name: string;
    nativeName: string;
    emoji: string;
    color: string;
    script: string;
    phonemeMap: Record<string, string>;
    sampleRoman: string;
    sampleHybrid: string;
}

const LANGUAGES: LangConfig[] = [
    {
        code: 'hi',
        name: 'Hindi',
        nativeName: 'हिन्दी',
        emoji: '🇮🇳',
        color: '#f97316',
        script: 'Devanagari',
        phonemeMap: {
            a: 'अ',
            aa: 'आ',
            i: 'इ',
            ii: 'ई',
            u: 'उ',
            uu: 'ऊ',
            ka: 'क',
            kha: 'ख',
            ga: 'ग',
            gha: 'घ',
            cha: 'च',
            chha: 'छ',
            ja: 'ज',
            jha: 'झ',
            ta: 'त',
            tha: 'थ',
            da: 'द',
            dha: 'ध',
            na: 'न',
            pa: 'प',
            pha: 'फ',
            ba: 'ब',
            bha: 'भ',
            ma: 'म',
            ya: 'य',
            ra: 'र',
            la: 'ल',
            va: 'व',
            wa: 'व',
            sha: 'श',
            sa: 'स',
            ha: 'ह',
            aaj: 'आज',
            hi: 'ही',
            yeh: 'यह',
            hai: 'है',
            karo: 'करो',
            bhai: 'भाई',
            dost: 'दोस्त',
            offer: 'ऑफर',
            free: 'फ्री',
            diwali: 'दिवाली',
            holi: 'होली',
            puja: 'पूजा',
            accha: 'अच्छा',
            bahut: 'बहुत',
            sahi: 'सही',
            mast: 'मस्त',
            aur: 'और',
            nahi: 'नहीं',
            kya: 'क्या',
            lekin: 'लेकिन',
        },
        sampleRoman: 'Aaj ka offer bahut accha hai bhai! Free delivery ke saath mast deal milegi.',
        sampleHybrid: 'बहुत kadak deal — आज hi grab karo! Free delivery 🔥',
    },
    {
        code: 'ta',
        name: 'Tamil',
        nativeName: 'தமிழ்',
        emoji: '🌴',
        color: '#22d3ee',
        script: 'Tamil',
        phonemeMap: {
            vanakkam: 'வணக்கம்',
            nalla: 'நல்ல',
            super: 'சூப்பர்',
            gethu: 'கெத்து',
            mass: 'மாஸ்',
            da: 'டா',
            bro: 'ப்ரோ',
            pongal: 'பொங்கல்',
            onam: 'ஓணம்',
            deepavali: 'தீபாவளி',
            varanga: 'வாங்க',
            epdi: 'எப்படி',
            enna: 'என்ன',
            ayyo: 'அய்யோ',
            machan: 'மச்சான்',
            adipoli: 'அடிபொளி',
        },
        sampleRoman:
            'Vanakkam! Pongal super offer varuthu. Nalla deal, gethu price, adipoli quality!',
        sampleHybrid: 'அடிபொளி deal varuthu! Get it before ஸ்டாக் runs out 🌾',
    },
    {
        code: 'bn',
        name: 'Bengali',
        nativeName: 'বাংলা',
        emoji: '🎨',
        color: '#f43f5e',
        script: 'Bengali',
        phonemeMap: {
            kemon: 'কেমন',
            acho: 'আছো',
            bhalo: 'ভালো',
            darun: 'দারুণ',
            babu: 'বাবু',
            didi: 'দিদি',
            bhai: 'ভাই',
            durga: 'দুর্গা',
            puja: 'পূজা',
            kali: 'কালী',
            offer: 'অফার',
            free: 'ফ্রি',
            niye: 'নিয়ে',
            moshai: 'মশাই',
            ami: 'আমি',
            tumi: 'তুমি',
        },
        sampleRoman: 'Darun offer! Durga Puja te ekta bhalo deal niye eshechi. Tumi ki janao?',
        sampleHybrid: 'দারুণ Puja deal এসে গেছে! Free delivery সাথে grab karo 🎨',
    },
    {
        code: 'kn',
        name: 'Kannada',
        nativeName: 'ಕನ್ನಡ',
        emoji: '🏛️',
        color: '#eab308',
        script: 'Kannada',
        phonemeMap: {
            channagide: 'ಚೆನ್ನಾಗಿದೆ',
            kano: 'ಕಣೋ',
            eno: 'ಏನೋ',
            namma: 'ನಮ್ಮ',
            bengaluru: 'ಬೆಂಗಳೂರು',
            mysuru: 'ಮೈಸೂರು',
            dasara: 'ದಸರಾ',
            ugadi: 'ಯುಗಾದಿ',
            super: 'ಸೂಪರ್',
            mast: 'ಮಸ್ತ್',
            beku: 'ಬೇಕು',
        },
        sampleRoman:
            'Channagide kano! Namma Bengaluru special Dasara offer — super price, mast quality!',
        sampleHybrid: 'ಚೆನ್ನಾಗಿದೆ deal! Namma Dasara offer grab ಮಾಡು 🏛️',
    },
    {
        code: 'pa',
        name: 'Punjabi',
        nativeName: 'ਪੰਜਾਬੀ',
        emoji: '🌻',
        color: '#f59e0b',
        script: 'Gurmukhi',
        phonemeMap: {
            sat: 'ਸਤ',
            sri: 'ਸ੍ਰੀ',
            akal: 'ਅਕਾਲ',
            wadde: 'ਵੱਡੇ',
            sohna: 'ਸੋਹਣਾ',
            paaji: 'ਪਾਜੀ',
            puttar: 'ਪੁੱਤਰ',
            baisakhi: 'ਵਿਸਾਖੀ',
            lohri: 'ਲੋਹੜੀ',
            diwali: 'ਦੀਵਾਲੀ',
            chak: 'ਚੱਕ',
            de: 'ਦੇ',
            deal: 'ਡੀਲ',
            mast: 'ਮਸਤ',
        },
        sampleRoman:
            'Paaji, wadde offer aa gaye! Baisakhi special deal — sohna price, mast quality!',
        sampleHybrid: 'ਵੱਡੇ offer ਆ ਗਏ Paaji! Grab karo before ਸਟਾਕ runs out 🌻',
    },
    {
        code: 'te',
        name: 'Telugu',
        nativeName: 'తెలుగు',
        emoji: '🌾',
        color: '#10b981',
        script: 'Telugu',
        phonemeMap: {
            bagundi: 'బాగుంది',
            chala: 'చాలా',
            super: 'సూపర్',
            anna: 'అన్నా',
            akka: 'అక్క',
            babu: 'బాబు',
            sankranthi: 'సంక్రాంతి',
            ugadi: 'ఉగాది',
            diwali: 'దీపావళి',
            manchi: 'మంచి',
            deal: 'డీల్',
            free: 'ఫ్రీ',
        },
        sampleRoman:
            'Anna! Bagundi deal vacchindi! Sankranthi lo chala manchi offer — super price!',
        sampleHybrid: 'బాగుంది deal Anna! Sankranthi special grab చేయండి 🌾',
    },
];

// ─── Transliteration Engine ────────────────────────────────────────────────────
function transliterateToNative(text: string, lang: LangConfig): string {
    let result = text;
    // Sort by length (longest first) to avoid partial replacements
    const entries = Object.entries(lang.phonemeMap).sort((a, b) => b[0].length - a[0].length);
    entries.forEach(([roman, native]) => {
        const regex = new RegExp(`\\b${roman}\\b`, 'gi');
        result = result.replace(regex, native);
    });
    return result || text;
}

function transliterateToHinglish(text: string, lang: LangConfig): string {
    // Make it sound more authentic Hinglish/Tanglish
    const words = text.split(' ');
    return words
        .map((word, i) => {
            if (i % 3 === 0 && lang.code === 'hi')
                return word.charAt(0).toUpperCase() + word.slice(1);
            if (i % 4 === 1 && lang.code === 'ta') return word + ' da';
            return word;
        })
        .join(' ');
}

function makeHybridMix(text: string, lang: LangConfig): string {
    if (!lang.sampleHybrid) return text;
    // Return the pre-crafted hybrid for the sample, or try to mix for custom
    const words = text.split(' ');
    const nativeEntries = Object.entries(lang.phonemeMap);
    return words
        .map((word, i) => {
            const match = nativeEntries.find(
                ([roman]) => roman.toLowerCase() === word.toLowerCase()
            );
            if (match && i % 2 === 0) return match[1];
            return word;
        })
        .join(' ');
}

// ─── Output Card ───────────────────────────────────────────────────────────────
function OutputCard({
    title,
    icon,
    content,
    color,
    sublabel,
}: {
    title: string;
    icon: string;
    content: string;
    color: string;
    sublabel: string;
}) {
    const [copied, setCopied] = useState(false);
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: `${color}10`,
                border: `1px solid ${color}30`,
                borderRadius: '1rem',
                padding: '1.1rem',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.6rem',
                    justifyContent: 'space-between',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>{icon}</span>
                    <span style={{ color, fontWeight: 700, fontSize: '0.82rem' }}>{title}</span>
                </div>
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(content);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                    }}
                    style={{
                        background: copied ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: '0.4rem',
                        padding: '0.2rem 0.6rem',
                        cursor: 'pointer',
                        color: copied ? '#4ade80' : '#64748b',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                    }}
                >
                    {copied ? '✅ Copied!' : '📋 Copy'}
                </button>
            </div>
            <div style={{ color, fontSize: '0.72rem', marginBottom: '0.4rem', opacity: 0.7 }}>
                {sublabel}
            </div>
            <div
                style={{
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '0.65rem',
                    padding: '0.75rem',
                    color: '#f1f5f9',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    minHeight: 60,
                    wordBreak: 'break-word',
                }}
            >
                {content || (
                    <span style={{ color: '#475569', fontStyle: 'italic' }}>
                        Output will appear here…
                    </span>
                )}
            </div>
        </motion.div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TransliterationEngine() {
    const navigate = useNavigate();
    const [langIdx, setLangIdx] = useState(0);
    const [input, setInput] = useState('');

    const lang = LANGUAGES[langIdx];

    const outputs = useMemo(() => {
        if (!input.trim()) return { native: '', hinglish: '', hybrid: '' };
        return {
            native: transliterateToNative(input, lang),
            hinglish: transliterateToHinglish(input, lang),
            hybrid: makeHybridMix(input, lang),
        };
    }, [input, lang]);

    const loadSample = useCallback(() => {
        setInput(lang.sampleRoman);
    }, [lang]);

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                background: 'linear-gradient(135deg,#060814 0%,#0a0a20 50%,#060814 100%)',
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
                                background: 'rgba(168,85,247,0.12)',
                                border: '1px solid rgba(168,85,247,0.25)',
                                borderRadius: 999,
                                padding: '0.2rem 0.7rem',
                                fontSize: '0.7rem',
                                color: '#a855f7',
                                fontWeight: 700,
                            }}
                        >
                            ⌨️ TRANSLITERATION ENGINE
                        </div>
                    </div>
                    <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
                        ⌨️ Hinglish / Tanglish Transliteration
                    </h1>
                    <p style={{ color: '#64748b', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
                        Type in Romanized phonetics → get Native Script, Hinglish, and Hybrid
                        code-mixed output instantly.
                    </p>
                </motion.div>

                {/* Language Selector */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    style={{
                        display: 'flex',
                        gap: '0.5rem',
                        flexWrap: 'wrap',
                        marginBottom: '1.5rem',
                    }}
                >
                    {LANGUAGES.map((l, i) => (
                        <button
                            key={l.code}
                            onClick={() => {
                                setLangIdx(i);
                                setInput('');
                            }}
                            style={{
                                background:
                                    langIdx === i ? l.color + '18' : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${langIdx === i ? l.color : 'rgba(255,255,255,0.1)'}`,
                                borderRadius: '0.65rem',
                                padding: '0.5rem 1rem',
                                color: langIdx === i ? l.color : '#64748b',
                                cursor: 'pointer',
                                fontWeight: langIdx === i ? 700 : 400,
                                fontSize: '0.82rem',
                                transition: 'all 0.15s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                boxShadow: langIdx === i ? `0 0 12px ${l.color}25` : 'none',
                            }}
                        >
                            <span>{l.emoji}</span>
                            <span>{l.name}</span>
                            <span style={{ color: l.color, opacity: 0.7, fontSize: '0.75rem' }}>
                                {l.nativeName}
                            </span>
                        </button>
                    ))}
                </motion.div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1.5rem',
                        maxWidth: 1100,
                    }}
                >
                    {/* Left — Input */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '1rem',
                                padding: '1.25rem',
                                marginBottom: '1rem',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '0.6rem',
                                }}
                            >
                                <label
                                    style={{
                                        color: '#94a3b8',
                                        fontSize: '0.78rem',
                                        fontWeight: 700,
                                    }}
                                >
                                    ⌨️ TYPE IN ROMAN PHONETICS ({lang.script} OUTPUT)
                                </label>
                                <button
                                    onClick={loadSample}
                                    style={{
                                        background: `${lang.color}18`,
                                        border: `1px solid ${lang.color}30`,
                                        borderRadius: '0.4rem',
                                        padding: '0.2rem 0.6rem',
                                        cursor: 'pointer',
                                        color: lang.color,
                                        fontSize: '0.72rem',
                                        fontWeight: 600,
                                    }}
                                >
                                    Load {lang.name} Sample
                                </button>
                            </div>
                            <textarea
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                rows={5}
                                placeholder={`Type your campaign text in Roman letters…\n\nExample: "${lang.sampleRoman.substring(0, 60)}..."`}
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
                                    marginTop: '0.5rem',
                                    color: '#475569',
                                    fontSize: '0.75rem',
                                }}
                            >
                                💡 The engine maps common phonemes to {lang.script} script. For
                                production, integrate with{' '}
                                <span style={{ color: lang.color }}>indic-transliteration</span>{' '}
                                library.
                            </div>
                        </motion.div>

                        {/* Language Info Card */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            style={{
                                background: `${lang.color}10`,
                                border: `1px solid ${lang.color}25`,
                                borderRadius: '0.875rem',
                                padding: '1rem',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.65rem',
                                    marginBottom: '0.6rem',
                                }}
                            >
                                <span style={{ fontSize: '1.8rem' }}>{lang.emoji}</span>
                                <div>
                                    <div
                                        style={{
                                            color: lang.color,
                                            fontWeight: 800,
                                            fontSize: '0.95rem',
                                        }}
                                    >
                                        {lang.name} — {lang.nativeName}
                                    </div>
                                    <div style={{ color: '#64748b', fontSize: '0.72rem' }}>
                                        Script: {lang.script}
                                    </div>
                                </div>
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '0.78rem', lineHeight: 1.6 }}>
                                <strong style={{ color: '#e2e8f0' }}>Hybrid Sample:</strong>
                                <br />
                                <span style={{ color: lang.color }}>{lang.sampleHybrid}</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right — 3 Outputs */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={lang.code}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}
                            >
                                <OutputCard
                                    title={`1. Native ${lang.script}`}
                                    icon="🔤"
                                    content={outputs.native}
                                    color={lang.color}
                                    sublabel={`Phoneme-mapped to ${lang.script} — authentic regional script`}
                                />
                                <OutputCard
                                    title="2. Romanized Hinglish / Tanglish"
                                    icon="✍️"
                                    content={outputs.hinglish}
                                    color="#a855f7"
                                    sublabel="Gen-Z caption style — Roman letters, Indian soul"
                                />
                                <OutputCard
                                    title="3. Hybrid Code-Mixed Banner"
                                    icon="🔀"
                                    content={outputs.hybrid}
                                    color="#4ade80"
                                    sublabel="Bold native keywords embedded in English — viral format"
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Use Cases */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    style={{ marginTop: '1.5rem', maxWidth: 1100 }}
                >
                    <div
                        style={{
                            color: '#64748b',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            marginBottom: '0.6rem',
                        }}
                    >
                        🎯 When to use each format
                    </div>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '0.75rem',
                        }}
                    >
                        {[
                            {
                                icon: '🔤',
                                title: 'Native Script',
                                color: lang.color,
                                uses: [
                                    'WhatsApp Status captions',
                                    'Regional newspaper ads',
                                    'Tier-2 city hoarding text',
                                    'SMS campaigns in local market',
                                ],
                            },
                            {
                                icon: '✍️',
                                title: 'Hinglish / Tanglish',
                                color: '#a855f7',
                                uses: [
                                    'Instagram Reel captions',
                                    'YouTube video titles',
                                    'Twitter/X threads',
                                    'Gen-Z audience campaigns',
                                ],
                            },
                            {
                                icon: '🔀',
                                title: 'Hybrid Code-Mix',
                                color: '#4ade80',
                                uses: [
                                    'WhatsApp forwards (viral)',
                                    'Facebook group posts',
                                    'Email subject lines',
                                    'Push notification copy',
                                ],
                            },
                        ].map(card => (
                            <div
                                key={card.title}
                                style={{
                                    background: `${card.color}10`,
                                    border: `1px solid ${card.color}25`,
                                    borderRadius: '0.875rem',
                                    padding: '0.9rem',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        marginBottom: '0.6rem',
                                    }}
                                >
                                    <span>{card.icon}</span>
                                    <span
                                        style={{
                                            color: card.color,
                                            fontWeight: 700,
                                            fontSize: '0.82rem',
                                        }}
                                    >
                                        {card.title}
                                    </span>
                                </div>
                                {card.uses.map(u => (
                                    <div
                                        key={u}
                                        style={{
                                            color: '#94a3b8',
                                            fontSize: '0.75rem',
                                            marginBottom: '0.25rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.35rem',
                                        }}
                                    >
                                        <span style={{ color: card.color, opacity: 0.6 }}>•</span>{' '}
                                        {u}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
