/**
 * DialectAtlas — Interactive Bharat Regional Cultural Map
 *
 * Inspired by:
 *   - sshyam-gupta/react-datamaps-india (indie SVG map component)
 *   - geohacker/india (topojson-india state boundaries)
 *
 * Features:
 *  - Clickable glowing SVG map of India (simplified state polygons)
 *  - Regional Pulse Card: active festival, channel dominance, cultural tone, slang words
 *  - 1-click "Target this State" → pre-fills New Campaign params via URL
 *  - Language hint and persona thumbnail per state
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';

// ─── Regional Data ─────────────────────────────────────────────────────────────
interface RegionData {
    id: string;
    name: string;
    capital: string;
    language: string;
    langCode: string;
    avatar: string;
    color: string;
    glowColor: string;
    festival: string;
    festivalDate: string;
    channelDominance: { whatsapp: number; instagram: number; facebook: number; youtube: number };
    culturalTone: string;
    toneEmoji: string;
    slangs: { word: string; meaning: string; impact: string }[];
    persona: string;
    bizType: string;
}

const REGIONS: Record<string, RegionData> = {
    MH: {
        id: 'MH',
        name: 'Maharashtra',
        capital: 'Mumbai',
        language: 'Marathi',
        langCode: 'mr',
        avatar: '🦁',
        color: '#f97316',
        glowColor: '#f9731660',
        festival: 'Ganesh Utsav',
        festivalDate: 'Aug–Sep',
        channelDominance: { whatsapp: 72, instagram: 85, facebook: 45, youtube: 68 },
        culturalTone: 'Bold, Festive & Inclusive (Aamchi Mumbai energy)',
        toneEmoji: '🔥',
        slangs: [
            {
                word: 'Kadak',
                meaning: 'Strong / Excellent (Pune/Mumbai)',
                impact: '+28% youth engagement',
            },
            { word: 'Bindaas', meaning: 'Carefree & Cool', impact: '+18% Gen-Z resonance' },
            { word: 'Aamchi', meaning: 'Our own / local pride', impact: '+22% community trust' },
        ],
        persona: '👩‍💻 College Creator, Pune',
        bizType: 'D2C Fashion & Food',
    },
    TN: {
        id: 'TN',
        name: 'Tamil Nadu',
        capital: 'Chennai',
        language: 'Tamil',
        langCode: 'ta',
        avatar: '🌴',
        color: '#22d3ee',
        glowColor: '#22d3ee60',
        festival: 'Pongal',
        festivalDate: 'Jan 14–17',
        channelDominance: { whatsapp: 80, instagram: 62, facebook: 70, youtube: 88 },
        culturalTone: 'Kinship, Pride & Self-respect (Vanakkam Nanba)',
        toneEmoji: '🙏',
        slangs: [
            { word: 'Gethu', meaning: 'Impressive / Grand', impact: '+31% aspirational brands' },
            {
                word: 'Mass',
                meaning: 'Huge presence / Celebrity-level',
                impact: '+24% hero product trust',
            },
            {
                word: 'Super',
                meaning: 'Excellent / Approval',
                impact: '+19% general approval rating',
            },
        ],
        persona: '🧔🏾‍♂️ Textile Merchant, Coimbatore',
        bizType: 'Textiles & Agriculture',
    },
    UP: {
        id: 'UP',
        name: 'Uttar Pradesh',
        capital: 'Lucknow',
        language: 'Hindi',
        langCode: 'hi',
        avatar: '🕌',
        color: '#a855f7',
        glowColor: '#a855f760',
        festival: 'Chhath Puja',
        festivalDate: 'Oct–Nov',
        channelDominance: { whatsapp: 88, instagram: 42, facebook: 75, youtube: 65 },
        culturalTone: 'Respect, Value & Tradition (Aap ki seva mein)',
        toneEmoji: '🙌',
        slangs: [
            { word: 'Zabardast', meaning: 'Extraordinary / Wow', impact: '+26% purchase intent' },
            {
                word: 'Khatarnak',
                meaning: 'Dangerously good / Extreme',
                impact: '+20% scarcity appeal',
            },
            {
                word: 'Bhai sahab',
                meaning: 'Respectful address',
                impact: '+32% Tier-3 trust factor',
            },
        ],
        persona: '👨🏽‍🌾 Kirana Store Owner, Kanpur',
        bizType: 'FMCG & Kirana Wholesale',
    },
    WB: {
        id: 'WB',
        name: 'West Bengal',
        capital: 'Kolkata',
        language: 'Bengali',
        langCode: 'bn',
        avatar: '🎨',
        color: '#f43f5e',
        glowColor: '#f43f5e60',
        festival: 'Durga Puja',
        festivalDate: 'Oct (5 days)',
        channelDominance: { whatsapp: 70, instagram: 55, facebook: 82, youtube: 60 },
        culturalTone: 'Intellectual, Artistic & Emotionally-rich (Babu Moshai)',
        toneEmoji: '🎭',
        slangs: [
            {
                word: 'Babu Moshai',
                meaning: 'Warm familiar address (like "dear sir")',
                impact: '+29% senior trust',
            },
            { word: 'Bhalo', meaning: 'Good / Nice', impact: '+15% quality perception' },
            { word: 'Darun', meaning: 'Amazing / Wonderful', impact: '+22% emotional response' },
        ],
        persona: '👩‍🎨 Cultural Artist, Kolkata',
        bizType: 'Education & Artisan Crafts',
    },
    KA: {
        id: 'KA',
        name: 'Karnataka',
        capital: 'Bengaluru',
        language: 'Kannada',
        langCode: 'kn',
        avatar: '🏛️',
        color: '#eab308',
        glowColor: '#eab30860',
        festival: 'Dasara (Mysuru Dasara)',
        festivalDate: 'Oct',
        channelDominance: { whatsapp: 65, instagram: 78, facebook: 48, youtube: 72 },
        culturalTone: 'Tech-forward, Modern & Aspirational (Namma Bengaluru pride)',
        toneEmoji: '🚀',
        slangs: [
            {
                word: 'Kano',
                meaning: 'Hey / Listen (friendly)',
                impact: '+20% informal brand appeal',
            },
            {
                word: 'Channagide',
                meaning: 'It is good / I like this',
                impact: '+18% approval sentiment',
            },
            {
                word: 'Ondhu tilk',
                meaning: 'Just a moment / One second',
                impact: 'Patience & trust builder',
            },
        ],
        persona: '🧑‍💻 Tech Professional, Bangalore',
        bizType: 'SaaS, EdTech & D2C',
    },
    GJ: {
        id: 'GJ',
        name: 'Gujarat',
        capital: 'Gandhinagar',
        language: 'Gujarati',
        langCode: 'gu',
        avatar: '💎',
        color: '#10b981',
        glowColor: '#10b98160',
        festival: 'Navratri (Garba)',
        festivalDate: 'Oct (9 nights)',
        channelDominance: { whatsapp: 82, instagram: 70, facebook: 55, youtube: 60 },
        culturalTone: 'Business-minded, Community-driven & Festive (Jai Jalaram)',
        toneEmoji: '💰',
        slangs: [
            {
                word: 'Kyaru',
                meaning: 'When? (Eager buyer signal)',
                impact: '+27% urgency response',
            },
            { word: 'Dhanda', meaning: 'Business / Deal', impact: '+22% B2B resonance' },
            { word: 'Mast', meaning: 'Excellent / Fun', impact: '+19% lifestyle product appeal' },
        ],
        persona: '💼 Diamond Merchant, Surat',
        bizType: 'Textiles, Diamonds & FMCG',
    },
    PB: {
        id: 'PB',
        name: 'Punjab',
        capital: 'Chandigarh',
        language: 'Punjabi',
        langCode: 'pa',
        avatar: '🌻',
        color: '#f59e0b',
        glowColor: '#f59e0b60',
        festival: 'Baisakhi',
        festivalDate: 'April 13–14',
        channelDominance: { whatsapp: 78, instagram: 76, facebook: 65, youtube: 70 },
        culturalTone: 'High Energy, Generous & Celebratory (Chardi Kala)',
        toneEmoji: '💪',
        slangs: [
            {
                word: 'Vadde',
                meaning: 'Big / Grand (aspirational)',
                impact: '+30% premium product fit',
            },
            {
                word: 'Sohna',
                meaning: 'Beautiful / Lovely',
                impact: '+24% personal care & fashion',
            },
            {
                word: 'Jugaad',
                meaning: 'Ingenious hack / Smart fix',
                impact: '+21% startup/tech appeal',
            },
        ],
        persona: '🌾 Farmer Entrepreneur, Ludhiana',
        bizType: 'Agriculture & Fashion',
    },
    KL: {
        id: 'KL',
        name: 'Kerala',
        capital: 'Thiruvananthapuram',
        language: 'Malayalam',
        langCode: 'ml',
        avatar: '🌊',
        color: '#06b6d4',
        glowColor: '#06b6d460',
        festival: 'Onam',
        festivalDate: 'Aug–Sep (10 days)',
        channelDominance: { whatsapp: 75, instagram: 65, facebook: 72, youtube: 80 },
        culturalTone: 'Literate, Thoughtful & Community-proud (Nammude Keralam)',
        toneEmoji: '🌿',
        slangs: [
            { word: 'Adipoli', meaning: 'Awesome / Superb', impact: '+26% youth engagement' },
            {
                word: 'Mone / Mole',
                meaning: 'Affectionate address (son/daughter)',
                impact: '+28% emotional marketing',
            },
            {
                word: 'Enthu',
                meaning: 'What? / Really? (curiosity)',
                impact: 'Hooks attention well',
            },
        ],
        persona: '👩‍⚕️ Nurse Entrepreneur, Kochi',
        bizType: 'Health, Education & Gulf remittance',
    },
};

// ─── Simplified SVG Map Paths (approximate state shapes for India) ──────────────
// These are simplified representational positions, not actual topojson
const STATE_RECTS: Record<string, { x: number; y: number; w: number; h: number; path?: string }> = {
    PB: { x: 55, y: 60, w: 55, h: 50 },
    GJ: { x: 30, y: 170, w: 60, h: 80 },
    MH: { x: 90, y: 200, w: 90, h: 90 },
    UP: { x: 140, y: 95, w: 90, h: 80 },
    WB: { x: 230, y: 150, w: 55, h: 70 },
    KA: { x: 100, y: 295, w: 70, h: 75 },
    TN: { x: 135, y: 360, w: 60, h: 80 },
    KL: { x: 105, y: 380, w: 40, h: 65 },
};

// ─── Channel Bar ──────────────────────────────────────────────────────────────
function ChannelBar({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div style={{ marginBottom: '0.4rem' }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    color: '#94a3b8',
                    fontSize: '0.72rem',
                    marginBottom: '0.2rem',
                }}
            >
                <span>{label}</span>
                <span style={{ color }}>{value}%</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '999px', height: 5 }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{
                        height: '100%',
                        borderRadius: '999px',
                        background: color,
                        boxShadow: `0 0 6px ${color}`,
                    }}
                />
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DialectAtlas() {
    const navigate = useNavigate();
    const [selected, setSelected] = useState<string | null>('MH');
    const [hovering, setHovering] = useState<string | null>(null);

    const region = selected ? REGIONS[selected] : null;

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                background: 'linear-gradient(135deg,#080814 0%,#0d0820 50%,#080e14 100%)',
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
                            marginBottom: '0.25rem',
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
                                background: 'rgba(34,211,238,0.1)',
                                border: '1px solid rgba(34,211,238,0.2)',
                                borderRadius: '999px',
                                padding: '0.2rem 0.7rem',
                                fontSize: '0.7rem',
                                color: '#22d3ee',
                                fontWeight: 600,
                            }}
                        >
                            🗺️ DIALECT ATLAS
                        </div>
                    </div>
                    <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
                        🗺️ Bharat Dialect Atlas
                    </h1>
                    <p style={{ color: '#64748b', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
                        Click any state to explore regional culture, active festivals, platform
                        behaviour & slang intelligence.
                    </p>
                </motion.div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '380px 1fr',
                        gap: '1.5rem',
                        maxWidth: 1200,
                    }}
                >
                    {/* Map Panel */}
                    <div>
                        <div
                            style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: '1.25rem',
                                padding: '1.25rem',
                                position: 'relative',
                            }}
                        >
                            <div
                                style={{
                                    color: '#64748b',
                                    fontSize: '0.75rem',
                                    marginBottom: '0.75rem',
                                    textAlign: 'center',
                                }}
                            >
                                Click a state to explore its cultural intelligence
                            </div>

                            {/* SVG Map */}
                            <svg
                                viewBox="0 0 320 500"
                                style={{ width: '100%', height: 'auto', cursor: 'pointer' }}
                            >
                                {/* Map background */}
                                <rect x="0" y="0" width="320" height="500" fill="transparent" />

                                {/* State blocks */}
                                {Object.entries(STATE_RECTS).map(([stateId, pos]) => {
                                    const reg = REGIONS[stateId];
                                    if (!reg) return null;
                                    const isSelected = selected === stateId;
                                    const isHovering = hovering === stateId;
                                    const active = isSelected || isHovering;

                                    return (
                                        <g key={stateId}>
                                            <rect
                                                x={pos.x}
                                                y={pos.y}
                                                width={pos.w}
                                                height={pos.h}
                                                rx={8}
                                                fill={
                                                    active
                                                        ? reg.color + '22'
                                                        : 'rgba(255,255,255,0.04)'
                                                }
                                                stroke={
                                                    active ? reg.color : 'rgba(255,255,255,0.12)'
                                                }
                                                strokeWidth={active ? 2 : 1}
                                                style={{
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    filter: isSelected
                                                        ? `drop-shadow(0 0 8px ${reg.glowColor})`
                                                        : 'none',
                                                }}
                                                onClick={() => setSelected(stateId)}
                                                onMouseEnter={() => setHovering(stateId)}
                                                onMouseLeave={() => setHovering(null)}
                                            />
                                            <text
                                                x={pos.x + pos.w / 2}
                                                y={pos.y + pos.h / 2 - 6}
                                                textAnchor="middle"
                                                fontSize={14}
                                                style={{
                                                    pointerEvents: 'none',
                                                    userSelect: 'none',
                                                }}
                                            >
                                                {reg.avatar}
                                            </text>
                                            <text
                                                x={pos.x + pos.w / 2}
                                                y={pos.y + pos.h / 2 + 10}
                                                textAnchor="middle"
                                                fontSize={8}
                                                fill={active ? reg.color : '#475569'}
                                                fontWeight={active ? 700 : 400}
                                                style={{
                                                    pointerEvents: 'none',
                                                    userSelect: 'none',
                                                    transition: 'all 0.2s',
                                                }}
                                                onClick={() => setSelected(stateId)}
                                                onMouseEnter={() => setHovering(stateId)}
                                                onMouseLeave={() => setHovering(null)}
                                            >
                                                {reg.name}
                                            </text>
                                        </g>
                                    );
                                })}

                                {/* India outline hint */}
                                <text
                                    x="160"
                                    y="480"
                                    textAnchor="middle"
                                    fontSize={9}
                                    fill="#1e293b"
                                    fontStyle="italic"
                                >
                                    Simplified region map — more states coming soon
                                </text>
                            </svg>

                            {/* State button grid — easier to click */}
                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '0.4rem',
                                    marginTop: '0.85rem',
                                }}
                            >
                                {Object.values(REGIONS).map(r => (
                                    <button
                                        key={r.id}
                                        onClick={() => setSelected(r.id)}
                                        style={{
                                            background:
                                                selected === r.id
                                                    ? r.color + '22'
                                                    : 'rgba(255,255,255,0.04)',
                                            border: `1px solid ${selected === r.id ? r.color : 'rgba(255,255,255,0.1)'}`,
                                            borderRadius: '0.5rem',
                                            padding: '0.3rem 0.65rem',
                                            color: selected === r.id ? r.color : '#64748b',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem',
                                            fontWeight: selected === r.id ? 700 : 400,
                                            transition: 'all 0.15s',
                                            boxShadow:
                                                selected === r.id
                                                    ? `0 0 8px ${r.glowColor}`
                                                    : 'none',
                                        }}
                                    >
                                        {r.avatar} {r.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Regional Pulse Card */}
                    <div>
                        <AnimatePresence mode="wait">
                            {region && (
                                <motion.div
                                    key={region.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    {/* State Hero */}
                                    <div
                                        style={{
                                            background: `linear-gradient(135deg, ${region.color}18, ${region.color}08)`,
                                            border: `1px solid ${region.color}40`,
                                            borderRadius: '1.25rem',
                                            padding: '1.5rem',
                                            marginBottom: '1rem',
                                            boxShadow: `0 0 40px ${region.glowColor}`,
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1rem',
                                                marginBottom: '1rem',
                                            }}
                                        >
                                            <div style={{ fontSize: '3.5rem', lineHeight: 1 }}>
                                                {region.avatar}
                                            </div>
                                            <div>
                                                <h2
                                                    style={{
                                                        color: region.color,
                                                        fontSize: '1.5rem',
                                                        fontWeight: 800,
                                                        margin: 0,
                                                    }}
                                                >
                                                    {region.name}
                                                </h2>
                                                <div
                                                    style={{
                                                        color: '#94a3b8',
                                                        fontSize: '0.82rem',
                                                        marginTop: '0.2rem',
                                                    }}
                                                >
                                                    {region.capital} · {region.language} ·{' '}
                                                    {region.bizType}
                                                </div>
                                                <div
                                                    style={{
                                                        color: '#64748b',
                                                        fontSize: '0.78rem',
                                                        marginTop: '0.1rem',
                                                    }}
                                                >
                                                    Top Persona: {region.persona}
                                                </div>
                                            </div>
                                            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                                <div
                                                    style={{
                                                        background: region.color + '22',
                                                        border: `1px solid ${region.color}40`,
                                                        borderRadius: '0.75rem',
                                                        padding: '0.5rem 0.875rem',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            color: '#64748b',
                                                            fontSize: '0.68rem',
                                                            marginBottom: '0.2rem',
                                                        }}
                                                    >
                                                        ACTIVE FESTIVAL
                                                    </div>
                                                    <div
                                                        style={{
                                                            color: region.color,
                                                            fontWeight: 700,
                                                            fontSize: '0.9rem',
                                                        }}
                                                    >
                                                        {region.festival}
                                                    </div>
                                                    <div
                                                        style={{
                                                            color: '#64748b',
                                                            fontSize: '0.72rem',
                                                        }}
                                                    >
                                                        {region.festivalDate}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Cultural Tone */}
                                        <div
                                            style={{
                                                background: 'rgba(0,0,0,0.2)',
                                                borderRadius: '0.875rem',
                                                padding: '0.875rem 1rem',
                                                marginBottom: '1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.65rem',
                                            }}
                                        >
                                            <span style={{ fontSize: '1.5rem' }}>
                                                {region.toneEmoji}
                                            </span>
                                            <div>
                                                <div
                                                    style={{
                                                        color: '#94a3b8',
                                                        fontSize: '0.68rem',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.08em',
                                                    }}
                                                >
                                                    Cultural Communication Tone
                                                </div>
                                                <div
                                                    style={{
                                                        color: '#f1f5f9',
                                                        fontSize: '0.875rem',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {region.culturalTone}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Channel Dominance */}
                                        <div style={{ marginBottom: '1rem' }}>
                                            <div
                                                style={{
                                                    color: '#64748b',
                                                    fontSize: '0.72rem',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.08em',
                                                    marginBottom: '0.5rem',
                                                }}
                                            >
                                                Platform Dominance
                                            </div>
                                            <ChannelBar
                                                label="📱 WhatsApp"
                                                value={region.channelDominance.whatsapp}
                                                color="#25D366"
                                            />
                                            <ChannelBar
                                                label="📸 Instagram"
                                                value={region.channelDominance.instagram}
                                                color="#E1306C"
                                            />
                                            <ChannelBar
                                                label="👥 Facebook"
                                                value={region.channelDominance.facebook}
                                                color="#1877F2"
                                            />
                                            <ChannelBar
                                                label="▶ YouTube"
                                                value={region.channelDominance.youtube}
                                                color="#FF0000"
                                            />
                                        </div>

                                        {/* Slang Intelligence */}
                                        <div>
                                            <div
                                                style={{
                                                    color: '#64748b',
                                                    fontSize: '0.72rem',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.08em',
                                                    marginBottom: '0.5rem',
                                                }}
                                            >
                                                🔑 High-Resonance Slang & Cultural Hooks
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '0.5rem',
                                                }}
                                            >
                                                {region.slangs.map(s => (
                                                    <div
                                                        key={s.word}
                                                        style={{
                                                            background: 'rgba(0,0,0,0.2)',
                                                            border: `1px solid ${region.color}20`,
                                                            borderRadius: '0.75rem',
                                                            padding: '0.7rem 0.875rem',
                                                            display: 'flex',
                                                            alignItems: 'flex-start',
                                                            gap: '0.75rem',
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                background: region.color + '22',
                                                                color: region.color,
                                                                borderRadius: '0.4rem',
                                                                padding: '0.1rem 0.5rem',
                                                                fontSize: '0.8rem',
                                                                fontWeight: 800,
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            {s.word}
                                                        </span>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div
                                                                style={{
                                                                    color: '#e2e8f0',
                                                                    fontSize: '0.8rem',
                                                                }}
                                                            >
                                                                {s.meaning}
                                                            </div>
                                                            <div
                                                                style={{
                                                                    color: '#4ade80',
                                                                    fontSize: '0.7rem',
                                                                    marginTop: '0.15rem',
                                                                }}
                                                            >
                                                                💡 {s.impact}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() =>
                                            navigate(
                                                `/campaign/new?region=${region.id}&lang=${region.langCode}&festival=${encodeURIComponent(region.festival)}`
                                            )
                                        }
                                        style={{
                                            width: '100%',
                                            padding: '0.9rem 1.5rem',
                                            background: `linear-gradient(135deg, ${region.color}, ${region.color}99)`,
                                            border: 'none',
                                            borderRadius: '0.875rem',
                                            cursor: 'pointer',
                                            color: '#fff',
                                            fontWeight: 800,
                                            fontSize: '0.95rem',
                                            boxShadow: `0 4px 20px ${region.glowColor}`,
                                            fontFamily: 'Inter, system-ui, sans-serif',
                                        }}
                                    >
                                        🚀 Generate Campaign for {region.name} →
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
}
