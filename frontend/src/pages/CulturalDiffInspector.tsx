/**
 * CulturalDiffInspector — Bharat Slang & Cultural Diff Inspector
 *
 * Inspired by:
 *   - lingodotdev/lingo.dev (AI-first localization with cultural context memory)
 *   - anoopkunchukuttan/indic_nlp_library (AI4Bharat Indic NLP toolkit)
 *   - amplication/react-diff-viewer-continued (Split/unified semantic diff)
 *
 * Features:
 *  - Side-by-side before/after diff with semantic highlights
 *  - Interactive slang chips: hover to reveal region, uplift %, cultural nuance
 *  - Regional selector to target specific Indian language/dialect styles
 *  - Transforms AI generation from black-box into educational, trust-building tool
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';

// ─── Slang Database ────────────────────────────────────────────────────────────
interface SlangEntry {
    word: string;
    region: string;
    dialect: string;
    meaning: string;
    emotionalResonance: string;
    uplift: string;
    why: string;
    color: string;
}

const SLANG_DB: SlangEntry[] = [
    {
        word: 'Kadak',
        region: 'Maharashtra / Pune',
        dialect: 'Western Maharashtra colloquial',
        meaning: 'Strong / Excellent / Premium',
        emotionalResonance: 'Youth + Kirana store owners',
        uplift: '+28% youth engagement',
        why: 'Signals quality without sounding corporate. Authentically Marathi street slang.',
        color: '#f97316',
    },
    {
        word: 'Bindaas',
        region: 'Maharashtra / Mumbai',
        dialect: 'Mumbai street Hindi-Marathi',
        meaning: 'Carefree, Confident & Cool',
        emotionalResonance: 'Gen-Z, Millennials',
        uplift: '+18% Gen-Z resonance',
        why: 'Implies bold purchasing without overthinking — perfect for fashion & lifestyle.',
        color: '#a855f7',
    },
    {
        word: 'Jugaad',
        region: 'Pan-India (Hindi belt)',
        dialect: 'Hinglish / Tier-2 cities',
        meaning: 'Ingenious workaround / Smart fix',
        emotionalResonance: 'SMB owners, startup crowd',
        uplift: '+21% startup/tech appeal',
        why: 'Celebrates frugal innovation — highly resonant with self-made entrepreneurs.',
        color: '#eab308',
    },
    {
        word: 'Gethu',
        region: 'Tamil Nadu',
        dialect: 'Tamil colloquial (Chennai/Coimbatore)',
        meaning: 'Grand / Impressive / Aspirational',
        emotionalResonance: 'Youth, aspirational brands',
        uplift: '+31% aspirational brand trust',
        why: 'Tamil slang for something that commands respect — heroes, premium products.',
        color: '#22d3ee',
    },
    {
        word: 'Mass',
        region: 'Tamil Nadu / Andhra',
        dialect: 'South Indian colloquial',
        meaning: 'Celebrity-level presence / Huge',
        emotionalResonance: 'Hero product marketing',
        uplift: '+24% hero product trust',
        why: 'Used for anything that commands crowd-level respect. Great for hero SKUs.',
        color: '#06b6d4',
    },
    {
        word: 'Zabardast',
        region: 'Uttar Pradesh / Delhi',
        dialect: 'Awadhi-Hindi / Bhojpuri influence',
        meaning: 'Extraordinary / Beyond expectations',
        emotionalResonance: 'Tier-2/3 male audience',
        uplift: '+26% purchase intent UP',
        why: 'Hyperbolic praise that drives FOMO. Works perfectly with limited offers.',
        color: '#a855f7',
    },
    {
        word: 'Khatarnak',
        region: 'UP / Bihar / Delhi',
        dialect: 'Street Hindi',
        meaning: 'Dangerously good / Extreme quality',
        emotionalResonance: 'Youth, action consumers',
        uplift: '+20% scarcity appeal',
        why: 'Usually means dangerous — but in street slang signals extreme quality or deal.',
        color: '#ef4444',
    },
    {
        word: 'Adipoli',
        region: 'Kerala',
        dialect: 'Malayalam colloquial',
        meaning: 'Awesome / Superb (beyond great)',
        emotionalResonance: 'Kerala youth market',
        uplift: '+26% Kerala youth engagement',
        why: 'Combination of "adikku" (beat) — implies the product beats all competition.',
        color: '#06b6d4',
    },
    {
        word: 'Babu Moshai',
        region: 'West Bengal',
        dialect: 'Bengali colloquial (familiar)',
        meaning: 'Warm familiar address (like "dear friend")',
        emotionalResonance: 'Senior, educated Bengali audience',
        uplift: '+29% senior trust WB',
        why: 'Soumitro Chatterjee immortalized this in Satyajit Ray films. Deep cultural resonance.',
        color: '#f43f5e',
    },
    {
        word: 'Vadde',
        region: 'Punjab',
        dialect: 'Punjabi colloquial',
        meaning: 'Big / Grand / Premium',
        emotionalResonance: 'Punjabi aspirational buyers',
        uplift: '+30% premium product fit PB',
        why: 'Punjabi pride in bigness — grand celebrations, generous hospitality. Premium signal.',
        color: '#f59e0b',
    },
];

// ─── Regional Transformations ──────────────────────────────────────────────────
interface Transformation {
    id: string;
    label: string;
    flag: string;
    original: string;
    localized: string;
    slangs: string[];
    score: { before: number; after: number };
}

const TRANSFORMATIONS: Transformation[] = [
    {
        id: 'mh',
        label: 'Maharashtra (Hinglish/Marathi)',
        flag: '🦁',
        original:
            'Our premium tea leaves offer the best quality for your enjoyment. Order now with free delivery.',
        localized:
            'Bindaas try karo yaar! 🔥 Kadak chai ki guarantee — ekdum fresh & premium. Aaj hi order karo, FREE delivery 🚀',
        slangs: ['Bindaas', 'Kadak'],
        score: { before: 34, after: 81 },
    },
    {
        id: 'tn',
        label: 'Tamil Nadu (Tamil/Tanglish)',
        flag: '🌴',
        original:
            'Introducing our new product collection. Buy now at great prices with discount offers.',
        localized:
            'Ayyo super da! 🎊 Gethu collection vandhudhuchu! Mass discount — ipo vaangama poita vera chance illai bro 🔥',
        slangs: ['Gethu', 'Mass'],
        score: { before: 28, after: 79 },
    },
    {
        id: 'up',
        label: 'Uttar Pradesh (Hindi/Hinglish)',
        flag: '🕌',
        original: 'Limited time offer. Shop now for the best products at competitive prices.',
        localized:
            'Bhai sahab, yeh toh Zabardast deal hai! 💥 Khatarnak quality, seedha factory se — limited stock, abhi hi grab karo!',
        slangs: ['Zabardast', 'Khatarnak'],
        score: { before: 31, after: 83 },
    },
    {
        id: 'pb',
        label: 'Punjab (Punjabi/Hinglish)',
        flag: '🌻',
        original: 'High quality items for every occasion. Special festive discount available now.',
        localized:
            'Vadde celebration da time aa gaya! 🎉 Jugaad karo nahi — sohne products, sohni quality, direct Ludhiana se! Grab karo!',
        slangs: ['Vadde', 'Jugaad'],
        score: { before: 29, after: 77 },
    },
];

// ─── Slang Tooltip ────────────────────────────────────────────────────────────
function SlangChip({ word, onHover }: { word: string; onHover: (s: SlangEntry | null) => void }) {
    const entry = SLANG_DB.find(s => s.word === word);
    if (!entry)
        return (
            <span
                style={{
                    background: '#22c55e22',
                    color: '#22c55e',
                    borderRadius: 4,
                    padding: '0 4px',
                    fontWeight: 700,
                }}
            >
                {word}
            </span>
        );
    return (
        <motion.span
            whileHover={{ scale: 1.08 }}
            onMouseEnter={() => onHover(entry)}
            onMouseLeave={() => onHover(null)}
            style={{
                background: entry.color + '22',
                color: entry.color,
                border: `1px solid ${entry.color}50`,
                borderRadius: 6,
                padding: '1px 7px',
                fontWeight: 800,
                fontSize: '0.9em',
                cursor: 'pointer',
                display: 'inline-block',
                boxShadow: `0 0 8px ${entry.color}30`,
                transition: 'all 0.15s',
            }}
        >
            ✨{word}
        </motion.span>
    );
}

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
    const r = 28;
    const circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;
    return (
        <div style={{ textAlign: 'center' }}>
            <svg width={70} height={70}>
                <circle
                    cx={35}
                    cy={35}
                    r={r}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth={5}
                />
                <motion.circle
                    cx={35}
                    cy={35}
                    r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth={5}
                    strokeDasharray={circ}
                    strokeDashoffset={circ - dash}
                    strokeLinecap="round"
                    transform="rotate(-90 35 35)"
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: circ - dash }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ filter: `drop-shadow(0 0 6px ${color})` }}
                />
                <text x={35} y={38} textAnchor="middle" fontSize={14} fontWeight={800} fill={color}>
                    {score}
                </text>
            </svg>
            <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '-4px' }}>{label}</div>
        </div>
    );
}

// ─── Render localized text with slang chips ───────────────────────────────────
function renderWithChips(text: string, slangs: string[], onHover: (s: SlangEntry | null) => void) {
    let parts: (string | JSX.Element)[] = [text];
    slangs.forEach(slang => {
        parts = parts.flatMap(part => {
            if (typeof part !== 'string') return [part];
            const idx = part.indexOf(slang);
            if (idx === -1) return [part];
            return [
                part.slice(0, idx),
                <SlangChip key={slang} word={slang} onHover={onHover} />,
                part.slice(idx + slang.length),
            ];
        });
    });
    return parts;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CulturalDiffInspector() {
    const navigate = useNavigate();
    const [selected, setSelected] = useState(0);
    const [hoveredSlang, setHoveredSlang] = useState<SlangEntry | null>(null);
    const [customOriginal, setCustomOriginal] = useState('');
    const [showCustom, setShowCustom] = useState(false);

    const tx = TRANSFORMATIONS[selected];
    const renderedLocalized = useMemo(
        () => renderWithChips(tx.localized, tx.slangs, setHoveredSlang),
        [tx]
    );

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                background: 'linear-gradient(135deg,#080a14 0%,#0d0a20 50%,#080e14 100%)',
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
                            ✨ CULTURAL DIFF INSPECTOR
                        </div>
                    </div>
                    <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
                        🇮🇳 Bharat Slang & Cultural Diff
                    </h1>
                    <p style={{ color: '#64748b', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
                        See exactly why culturally-localized copy scores higher — hover on glowing
                        slang chips for regional intelligence.
                    </p>
                </motion.div>

                {/* Region Selector */}
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
                    {TRANSFORMATIONS.map((t, i) => (
                        <button
                            key={t.id}
                            onClick={() => setSelected(i)}
                            style={{
                                background:
                                    selected === i
                                        ? 'rgba(168,85,247,0.15)'
                                        : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${selected === i ? '#a855f7' : 'rgba(255,255,255,0.1)'}`,
                                borderRadius: '0.65rem',
                                padding: '0.45rem 0.9rem',
                                color: selected === i ? '#a855f7' : '#64748b',
                                cursor: 'pointer',
                                fontWeight: selected === i ? 700 : 400,
                                fontSize: '0.82rem',
                                transition: 'all 0.15s',
                                boxShadow:
                                    selected === i ? '0 0 12px rgba(168,85,247,0.2)' : 'none',
                            }}
                        >
                            {t.flag} {t.label}
                        </button>
                    ))}
                    <button
                        onClick={() => setShowCustom(!showCustom)}
                        style={{
                            background: showCustom
                                ? 'rgba(249,115,22,0.15)'
                                : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${showCustom ? '#f97316' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: '0.65rem',
                            padding: '0.45rem 0.9rem',
                            color: showCustom ? '#f97316' : '#64748b',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            transition: 'all 0.15s',
                        }}
                    >
                        ✏️ Try Your Own
                    </button>
                </motion.div>

                {/* Custom input */}
                <AnimatePresence>
                    {showCustom && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{
                                marginBottom: '1rem',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '0.875rem',
                                padding: '1rem',
                            }}
                        >
                            <label
                                style={{
                                    color: '#94a3b8',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    display: 'block',
                                    marginBottom: '0.4rem',
                                }}
                            >
                                YOUR COPY (ORIGINAL)
                            </label>
                            <textarea
                                value={customOriginal}
                                onChange={e => setCustomOriginal(e.target.value)}
                                rows={2}
                                placeholder="Type your generic English/Hindi copy here…"
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '0.6rem',
                                    padding: '0.65rem',
                                    color: '#f1f5f9',
                                    fontSize: '0.875rem',
                                    fontFamily: 'Inter, system-ui, sans-serif',
                                    resize: 'vertical',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1.25rem',
                        maxWidth: 1200,
                    }}
                >
                    {/* Before Panel */}
                    <motion.div
                        key={`before-${selected}`}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{
                            background: 'rgba(248,113,113,0.05)',
                            border: '1px solid rgba(248,113,113,0.2)',
                            borderRadius: '1.1rem',
                            padding: '1.25rem',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '0.9rem',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1rem' }}>❌</span>
                                <span
                                    style={{
                                        color: '#f87171',
                                        fontWeight: 700,
                                        fontSize: '0.82rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.06em',
                                    }}
                                >
                                    Generic / Original
                                </span>
                            </div>
                            <ScoreRing
                                score={tx.score.before}
                                label="BharatScore"
                                color="#f87171"
                            />
                        </div>
                        <div
                            style={{
                                background: 'rgba(248,113,113,0.08)',
                                borderRadius: '0.75rem',
                                padding: '1rem',
                                color: '#cbd5e1',
                                fontSize: '0.9rem',
                                lineHeight: 1.6,
                                minHeight: 80,
                            }}
                        >
                            {showCustom && customOriginal ? customOriginal : tx.original}
                        </div>
                        <div
                            style={{
                                marginTop: '0.85rem',
                                display: 'flex',
                                gap: '0.5rem',
                                flexWrap: 'wrap',
                            }}
                        >
                            {['Generic', 'Corporate tone', 'No regional hook', 'Low trust'].map(
                                t => (
                                    <span
                                        key={t}
                                        style={{
                                            background: 'rgba(248,113,113,0.1)',
                                            color: '#f87171',
                                            border: '1px solid rgba(248,113,113,0.2)',
                                            borderRadius: 999,
                                            padding: '0.15rem 0.6rem',
                                            fontSize: '0.7rem',
                                        }}
                                    >
                                        — {t}
                                    </span>
                                )
                            )}
                        </div>
                    </motion.div>

                    {/* After Panel */}
                    <motion.div
                        key={`after-${selected}`}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{
                            background: 'rgba(74,222,128,0.05)',
                            border: '1px solid rgba(74,222,128,0.2)',
                            borderRadius: '1.1rem',
                            padding: '1.25rem',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '0.9rem',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1rem' }}>✅</span>
                                <span
                                    style={{
                                        color: '#4ade80',
                                        fontWeight: 700,
                                        fontSize: '0.82rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.06em',
                                    }}
                                >
                                    Culturally Localized
                                </span>
                            </div>
                            <ScoreRing score={tx.score.after} label="BharatScore" color="#4ade80" />
                        </div>
                        <div
                            style={{
                                background: 'rgba(74,222,128,0.06)',
                                borderRadius: '0.75rem',
                                padding: '1rem',
                                color: '#e2e8f0',
                                fontSize: '0.9rem',
                                lineHeight: 1.8,
                                minHeight: 80,
                            }}
                        >
                            {renderedLocalized}
                        </div>
                        <div
                            style={{
                                marginTop: '0.85rem',
                                display: 'flex',
                                gap: '0.5rem',
                                flexWrap: 'wrap',
                            }}
                        >
                            {[
                                'Regional slang',
                                'Emotional hook',
                                'Native code-mix',
                                'High trust',
                            ].map(t => (
                                <span
                                    key={t}
                                    style={{
                                        background: 'rgba(74,222,128,0.1)',
                                        color: '#4ade80',
                                        border: '1px solid rgba(74,222,128,0.2)',
                                        borderRadius: 999,
                                        padding: '0.15rem 0.6rem',
                                        fontSize: '0.7rem',
                                    }}
                                >
                                    + {t}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Slang Intelligence Tooltip Panel */}
                <AnimatePresence>
                    {hoveredSlang && (
                        <motion.div
                            key={hoveredSlang.word}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }}
                            style={{
                                marginTop: '1.25rem',
                                maxWidth: 1200,
                                background: `linear-gradient(135deg, ${hoveredSlang.color}18, ${hoveredSlang.color}08)`,
                                border: `1px solid ${hoveredSlang.color}40`,
                                borderRadius: '1rem',
                                padding: '1.1rem 1.4rem',
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 1fr',
                                gap: '1rem',
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        color: hoveredSlang.color,
                                        fontWeight: 800,
                                        fontSize: '1.1rem',
                                        marginBottom: '0.25rem',
                                    }}
                                >
                                    ✨ "{hoveredSlang.word}"
                                </div>
                                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                                    {hoveredSlang.meaning}
                                </div>
                            </div>
                            <div>
                                <div
                                    style={{
                                        color: '#64748b',
                                        fontSize: '0.68rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                        marginBottom: '0.2rem',
                                    }}
                                >
                                    Region & Dialect
                                </div>
                                <div style={{ color: '#e2e8f0', fontSize: '0.82rem' }}>
                                    {hoveredSlang.region}
                                </div>
                                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                    {hoveredSlang.dialect}
                                </div>
                            </div>
                            <div>
                                <div
                                    style={{
                                        color: '#64748b',
                                        fontSize: '0.68rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                        marginBottom: '0.2rem',
                                    }}
                                >
                                    Emotional Uplift
                                </div>
                                <div
                                    style={{
                                        color: '#4ade80',
                                        fontWeight: 700,
                                        fontSize: '0.85rem',
                                    }}
                                >
                                    💡 {hoveredSlang.uplift}
                                </div>
                                <div
                                    style={{
                                        color: '#64748b',
                                        fontSize: '0.72rem',
                                        marginTop: '0.15rem',
                                    }}
                                >
                                    For: {hoveredSlang.emotionalResonance}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Why it works */}
                {hoveredSlang && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            maxWidth: 1200,
                            marginTop: '0.75rem',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '0.75rem',
                            padding: '0.85rem 1.25rem',
                            color: '#94a3b8',
                            fontSize: '0.82rem',
                            lineHeight: 1.6,
                        }}
                    >
                        <span style={{ color: '#fbbf24', fontWeight: 700 }}>🎯 Why it works: </span>
                        {hoveredSlang.why}
                    </motion.div>
                )}

                {/* Slang Lexicon Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{ marginTop: '2rem', maxWidth: 1200 }}
                >
                    <div
                        style={{
                            color: '#64748b',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            marginBottom: '0.75rem',
                        }}
                    >
                        📚 Bharat Slang Lexicon — hover on glowing chips in copy above
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {SLANG_DB.map(s => (
                            <motion.span
                                key={s.word}
                                whileHover={{ scale: 1.1 }}
                                onMouseEnter={() => setHoveredSlang(s)}
                                onMouseLeave={() => setHoveredSlang(null)}
                                style={{
                                    background: s.color + '18',
                                    color: s.color,
                                    border: `1px solid ${s.color}40`,
                                    borderRadius: 8,
                                    padding: '0.3rem 0.8rem',
                                    fontWeight: 700,
                                    fontSize: '0.82rem',
                                    cursor: 'pointer',
                                    boxShadow: `0 0 8px ${s.color}20`,
                                }}
                            >
                                {s.word}
                                <span
                                    style={{
                                        color: '#64748b',
                                        fontWeight: 400,
                                        fontSize: '0.72rem',
                                        marginLeft: '0.4rem',
                                    }}
                                >
                                    {s.region.split('/')[0].trim()}
                                </span>
                            </motion.span>
                        ))}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
