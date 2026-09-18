/**
 * BharatFocusGroup — Live WhatsApp Persona Debate Simulator
 *
 * Inspired by:
 *   - camel-ai/camel (⭐6k — communicative agent role-play)
 *   - The-Swarm-Corporation/Marketing-Swarm-Template
 *
 * Features:
 *  - Paste any campaign copy → 3 distinct Indian personas debate it live
 *  - Animated WhatsApp-style typing bubbles, read receipts
 *  - Personas: Kirana owner (Kanpur), Gen-Z creator (Pune), Textile merchant (Coimbatore)
 *  - Live vote ticker: Buy / Needs Tweak / Reject
 *  - Cultural consensus BharatScore computed from votes
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { toast } from 'sonner';

// ─── Personas ─────────────────────────────────────────────────────────────────
const PERSONAS = [
    {
        id: 'ramesh',
        avatar: '👨🏽‍🌾',
        name: 'Ramesh Verma',
        role: 'Kirana Store Owner',
        city: 'Kanpur, UP',
        lang: 'Hindi / Hinglish',
        color: '#f97316',
        bgColor: 'rgba(249,115,22,0.12)',
        borderColor: 'rgba(249,115,22,0.3)',
        traits: ['Price-Conscious', 'Trust-Driven', 'Word-of-Mouth'],
    },
    {
        id: 'ananya',
        avatar: '👩🏻‍💻',
        name: 'Ananya Kulkarni',
        role: 'College Creator / Influencer',
        city: 'Pune, Maharashtra',
        lang: 'English / Marathi',
        color: '#a855f7',
        bgColor: 'rgba(168,85,247,0.12)',
        borderColor: 'rgba(168,85,247,0.3)',
        traits: ['Trend-Savvy', 'Aesthetic-First', 'Short Attention'],
    },
    {
        id: 'murugan',
        avatar: '🧔🏾‍♂️',
        name: 'Murugan Kannan',
        role: 'Textile Wholesaler',
        city: 'Coimbatore, Tamil Nadu',
        lang: 'Tamil / Tamil-English',
        color: '#22d3ee',
        bgColor: 'rgba(34,211,238,0.12)',
        borderColor: 'rgba(34,211,238,0.3)',
        traits: ['Delivery-Focused', 'Festival-Aware', 'Quality-Driven'],
    },
];

// ─── Debate Message Generator ──────────────────────────────────────────────────
function generateDebate(copy: string): ChatMessage[] {
    const lower = copy.toLowerCase();
    const hasPrice = /\d+%|₹\d|rupee|off|discount|free|मुफ्त|फ्री/i.test(copy);
    const hasFestival = /diwali|holi|eid|pongal|navratri|ganesh|onam|deepavali|festival|उत्सव/i.test(copy);
    const hasUrgency = /today|limited|only|hurry|अभी|जल्दी|last|deadline|சீக்கிரம்/i.test(copy);
    const isHindi = /[\u0900-\u097F]/.test(copy);
    const isTamil = /[\u0B80-\u0BFF]/.test(copy);
    const isEnglishOnly = !isHindi && !isTamil && !/[\u0C00-\u0C7F\u0980-\u09FF]/.test(copy);

    const messages: Omit<ChatMessage, 'id' | 'ts'>[] = [];

    // Ramesh (Kirana, UP) — opens the thread
    if (hasPrice) {
        messages.push({ persona: 'ramesh', text: `Bhai yeh offer thoda acha lag raha hai! Lekin discount ka proof chahiye — logo abhi card nahi maante, cash pe trust hai 💪`, vote: 'tweak' });
    } else if (isEnglishOnly) {
        messages.push({ persona: 'ramesh', text: `Yaar yeh English mein kya likha hai? Hamare Kanpur mein customers Hindi mein hi baat karte hain. Hindi mein likho toh 3 guna response milega 🙏`, vote: 'reject' });
    } else if (isHindi) {
        messages.push({ persona: 'ramesh', text: `Wah bhai! Bhasha bilkul sahi hai. Bas ek kaam karo — dukaan ka WhatsApp number aur delivery time saaf likho. Customers pehle yahi poochhte hain!`, vote: 'buy' });
    } else {
        messages.push({ persona: 'ramesh', text: `Dekhte hain... thoda aur catchy hona chahiye tha. Price clearly mention karo toh achha lagega`, vote: 'tweak' });
    }

    // Ananya (Gen-Z, Pune) — replies next
    if (hasFestival) {
        messages.push({ persona: 'ananya', text: `YASSSS finally a brand that gets festival vibes!! 🎉 The energy is immaculate but you NEED a trending audio recommendation for the Reel version. Also add a countdown timer aesthetic 🔥`, vote: 'buy' });
    } else if (isEnglishOnly) {
        messages.push({ persona: 'ananya', text: `Okay the English is giving very corporate energy 😬 For Instagram? Nobody reads full paragraphs. Just give me: one punchy line, one hook emoji, and a CTA. The rest is noise lol`, vote: 'reject' });
    } else if (hasUrgency) {
        messages.push({ persona: 'ananya', text: `The urgency is REAL and I am here for it ⚡ But the copy needs a meme format — like "POV: you got the Kadak deal before your friends did" — that would literally blow up on Stories`, vote: 'buy' });
    } else {
        messages.push({ persona: 'ananya', text: `Hmm it's okay? Not bad but nothing that makes me want to screenshot and share tbh. Needs a stronger hook in the first 3 words. That's where 80% of people stop reading 📱`, vote: 'tweak' });
    }

    // Murugan (Coimbatore) — analytical, delivery-focused
    if (hasFestival) {
        messages.push({ persona: 'murugan', text: `Nalla irukku! Festival angle super idea. Enna, delivery date clearly specify panningala? Deepavali ku munnaadi reach aguma? Coimbatore la people order cancel panniduvanga if it's not clear 🙅`, vote: 'tweak' });
    } else if (hasPrice && !hasUrgency) {
        messages.push({ persona: 'murugan', text: `Discount percentage okay da, but for wholesale customers — minimum order quantity mention pannu. And cash-on-delivery available-a? Rural Tamil Nadu la that's non-negotiable bro 💯`, vote: 'tweak' });
    } else if (isTamil) {
        messages.push({ persona: 'murugan', text: `Ayyo super! Tamil la irukku means already half the trust is earned 🎊 Just add return policy clarity — Coimbatore market la trust = clear policy. Add that and this campaign is 🔥`, vote: 'buy' });
    } else {
        messages.push({ persona: 'murugan', text: `From a Tier-2 market perspective — this is decent but too metro-focused. Rural customers care about: (1) delivery time, (2) COD, (3) local language. Miss even one → skip. Fix these and it's a solid campaign`, vote: 'tweak' });
    }

    // Add a consensus message
    const votes = messages.map(m => m.vote);
    const buyCount = votes.filter(v => v === 'buy').length;
    const rejectCount = votes.filter(v => v === 'reject').length;

    if (buyCount >= 2) {
        messages.push({ persona: 'ananya', text: `Okay group consensus: this is actually solid! Ramesh bhai and Murugan anna both gave thumbs up — that's basically the whole Bharat market right there 😂🙌`, vote: null });
    } else if (rejectCount >= 2) {
        messages.push({ persona: 'ramesh', text: `Bhai log sab agree kar rahe hain — thoda aur kaam karna padega. Bhasha aur price dono improve karo. Phir dobara try karo!`, vote: null });
    } else {
        messages.push({ persona: 'murugan', text: `Okay team — 50-50 verdict. This campaign needs 2 tweaks: regional language & delivery clarity. Fix those and we vote again 🔄`, vote: null });
    }

    return messages.map((m, i) => ({ ...m, id: `msg-${i}`, ts: Date.now() + i * 1000 }));
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChatMessage {
    id: string;
    persona: string;
    text: string;
    vote: 'buy' | 'tweak' | 'reject' | null;
    ts: number;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function TypingBubble({ color }: { color: string }) {
    return (
        <div style={{ display: 'flex', gap: '3px', padding: '8px 12px', alignItems: 'center' }}>
            {[0, 1, 2].map(i => (
                <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                    transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.18 }}
                    style={{ width: 6, height: 6, borderRadius: '50%', background: color }}
                />
            ))}
        </div>
    );
}

function VoteChip({ vote }: { vote: 'buy' | 'tweak' | 'reject' }) {
    const map = {
        buy: { icon: '👍', label: 'Buy Now', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
        tweak: { icon: '🤔', label: 'Needs Tweak', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
        reject: { icon: '❌', label: 'Reject', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
    };
    const v = map[vote];
    return (
        <span style={{
            background: v.bg, color: v.color, border: `1px solid ${v.color}40`,
            borderRadius: '999px', padding: '0.1rem 0.55rem', fontSize: '0.7rem', fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.35rem',
        }}>
            {v.icon} {v.label}
        </span>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BharatFocusGroup() {
    const navigate = useNavigate();
    const [campaignCopy, setCampaignCopy] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [typing, setTyping] = useState<string | null>(null);
    const [running, setRunning] = useState(false);
    const [done, setDone] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Votes tally
    const voteTally = messages.reduce(
        (acc, m) => { if (m.vote) acc[m.vote] = (acc[m.vote] || 0) + 1; return acc; },
        { buy: 0, tweak: 0, reject: 0 } as Record<string, number>
    );
    const consensusScore = Math.round(
        ((voteTally.buy * 100 + voteTally.tweak * 60 + voteTally.reject * 20) /
            Math.max(1, (voteTally.buy + voteTally.tweak + voteTally.reject))) || 0
    );

    const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => scrollToBottom(), [messages, typing]);

    const runFocusGroup = useCallback(async () => {
        if (campaignCopy.trim().length < 10) {
            toast.error('Please paste your campaign copy first (min 10 characters)');
            return;
        }
        setMessages([]);
        setDone(false);
        setRunning(true);

        const allMessages = generateDebate(campaignCopy);
        toast.promise(
            new Promise<string>(resolve => setTimeout(() => resolve('Focus group complete!'), allMessages.length * 1400 + 500)),
            { loading: '🗣️ Personas are debating your copy…', success: '✅ Focus group concluded!', error: 'Error running focus group' }
        );

        for (let i = 0; i < allMessages.length; i++) {
            const msg = allMessages[i];
            const persona = PERSONAS.find(p => p.id === msg.persona)!;
            setTyping(msg.persona);
            await new Promise(r => setTimeout(r, 900 + Math.random() * 500));
            setTyping(null);
            setMessages(prev => [...prev, msg]);
            await new Promise(r => setTimeout(r, 400));
        }

        setRunning(false);
        setDone(true);
    }, [campaignCopy]);

    const SAMPLE_COPIES = [
        'Bhai ka Diwali Dhamaka! 🎉 Get 30% OFF on all electronics. Limited stock — order karo aaj hi! ₹999 se shuru. Free delivery across India. Grab now! 🛒',
        'This Pongal, celebrate with style. Traditional silk sarees starting ₹1499. Authentic weaves, direct from Kanchipuram weavers. Cash on delivery available. Vanakkam! 🌾',
        'New product launch — premium health supplement. Science-backed formula. Order online now.',
    ];

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg,#0a0a14 0%,#0d0a1a 50%,#0a1410 100%)' }}>
            <Sidebar />
            <main style={{ flex: 1, marginLeft: 220, padding: '2rem', fontFamily: 'Inter, system-ui, sans-serif' }}>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                        <button onClick={() => navigate('/dashboard')} style={{
                            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                            color: '#94a3b8', borderRadius: '0.5rem', padding: '0.4rem 0.9rem', cursor: 'pointer', fontSize: '0.82rem',
                        }}>← Dashboard</button>
                        <div style={{
                            background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)',
                            borderRadius: '999px', padding: '0.2rem 0.7rem', fontSize: '0.7rem', color: '#4ade80', fontWeight: 600,
                        }}>💬 FOCUS GROUP SIMULATOR</div>
                    </div>
                    <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
                        🇮🇳 Bharat Focus Group
                    </h1>
                    <p style={{ color: '#64748b', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
                        Paste your campaign copy below — 3 real Indian consumer personas will debate it live in WhatsApp style.
                    </p>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', maxWidth: 1200 }}>

                    {/* Left — Chat */}
                    <div>
                        {/* Input */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                            style={{
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '1rem', padding: '1.25rem', marginBottom: '1rem',
                            }}>
                            <label style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                                📋 YOUR CAMPAIGN COPY
                            </label>
                            <textarea
                                value={campaignCopy}
                                onChange={e => setCampaignCopy(e.target.value)}
                                rows={4}
                                placeholder="Paste your ad copy, WhatsApp message, or campaign headline here…"
                                style={{
                                    width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '0.75rem', padding: '0.85rem 1rem', color: '#f1f5f9', fontSize: '0.9rem',
                                    fontFamily: 'Inter, system-ui, sans-serif', resize: 'vertical', outline: 'none',
                                    boxSizing: 'border-box',
                                }}
                            />
                            {/* Sample copies */}
                            <div style={{ marginTop: '0.65rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                <span style={{ color: '#475569', fontSize: '0.75rem', alignSelf: 'center' }}>Try sample:</span>
                                {SAMPLE_COPIES.map((s, i) => (
                                    <button key={i} onClick={() => setCampaignCopy(s)} style={{
                                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '0.5rem', padding: '0.25rem 0.65rem', color: '#94a3b8', cursor: 'pointer',
                                        fontSize: '0.73rem', transition: 'all 0.15s',
                                    }}>
                                        {['Diwali Hindi 🎉', 'Pongal Tamil 🌾', 'Generic English 🤷'][i]}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={runFocusGroup}
                                disabled={running || campaignCopy.trim().length < 10}
                                style={{
                                    marginTop: '0.85rem', width: '100%',
                                    background: running ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                                    border: 'none', borderRadius: '0.75rem', padding: '0.7rem',
                                    color: running ? '#475569' : '#fff', fontWeight: 700, fontSize: '0.9rem',
                                    cursor: running ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                                }}
                            >
                                {running ? '🗣️ Debate in Progress…' : '▶ Run Bharat Focus Group'}
                            </button>
                        </motion.div>

                        {/* WhatsApp Chat Window */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(13,31,22,0.95), rgba(10,20,15,0.98))',
                            border: '1px solid rgba(37,211,102,0.2)',
                            borderRadius: '1.25rem', overflow: 'hidden',
                            boxShadow: '0 4px 32px rgba(37,211,102,0.06)',
                        }}>
                            {/* WhatsApp Header */}
                            <div style={{
                                background: 'rgba(37,211,102,0.08)', borderBottom: '1px solid rgba(37,211,102,0.15)',
                                padding: '0.9rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                            }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%',
                                    background: 'linear-gradient(135deg,#25D366,#128C7E)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.1rem',
                                }}>🇮🇳</div>
                                <div>
                                    <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.9rem' }}>Bharat Market Focus Group</div>
                                    <div style={{ color: '#25D366', fontSize: '0.72rem' }}>{PERSONAS.length} members · AI-simulated consumer debate</div>
                                </div>
                                <div style={{ marginLeft: 'auto', color: '#4ade80', fontSize: '0.75rem' }}>
                                    {running ? '● Live' : done ? '✓ Done' : '○ Idle'}
                                </div>
                            </div>

                            {/* Messages */}
                            <div style={{ minHeight: 280, maxHeight: 440, overflowY: 'auto', padding: '1rem' }}>
                                {messages.length === 0 && !running && (
                                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#1a3028' }}>
                                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💬</div>
                                        <div style={{ color: '#2d5040', fontSize: '0.85rem' }}>Paste your campaign copy above and hit Run</div>
                                    </div>
                                )}

                                <AnimatePresence>
                                    {messages.map(msg => {
                                        const persona = PERSONAS.find(p => p.id === msg.persona)!;
                                        return (
                                            <motion.div
                                                key={msg.id}
                                                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                transition={{ duration: 0.3 }}
                                                style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.1rem', alignItems: 'flex-end' }}
                                            >
                                                <div style={{ fontSize: '1.6rem', flexShrink: 0, lineHeight: 1 }}>{persona.avatar}</div>
                                                <div style={{ maxWidth: '75%' }}>
                                                    <div style={{ color: persona.color, fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                                                        {persona.name} · {persona.city}
                                                    </div>
                                                    <div style={{
                                                        background: persona.bgColor, border: `1px solid ${persona.borderColor}`,
                                                        borderRadius: '0 0.875rem 0.875rem 0.875rem', padding: '0.7rem 0.9rem',
                                                    }}>
                                                        <p style={{ color: '#e2e8f0', fontSize: '0.875rem', margin: 0, lineHeight: 1.5 }}>{msg.text}</p>
                                                        {msg.vote && <div style={{ marginTop: '0.25rem' }}><VoteChip vote={msg.vote} /></div>}
                                                        <div style={{ color: '#1e4030', fontSize: '0.65rem', marginTop: '0.35rem', textAlign: 'right' }}>
                                                            {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} ✓✓
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>

                                {/* Typing indicator */}
                                <AnimatePresence>
                                    {typing && (
                                        <motion.div
                                            key="typing"
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-end' }}
                                        >
                                            <div style={{ fontSize: '1.6rem', lineHeight: 1 }}>
                                                {PERSONAS.find(p => p.id === typing)?.avatar}
                                            </div>
                                            <div style={{
                                                background: PERSONAS.find(p => p.id === typing)?.bgColor,
                                                border: `1px solid ${PERSONAS.find(p => p.id === typing)?.borderColor}`,
                                                borderRadius: '0 0.875rem 0.875rem 0.875rem',
                                            }}>
                                                <TypingBubble color={PERSONAS.find(p => p.id === typing)?.color || '#fff'} />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <div ref={chatEndRef} />
                            </div>
                        </div>
                    </div>

                    {/* Right — Personas + Score */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Persona Cards */}
                        {PERSONAS.map((p, i) => (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                style={{
                                    background: p.bgColor, border: `1px solid ${p.borderColor}`,
                                    borderRadius: '1rem', padding: '1rem',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
                                    <span style={{ fontSize: '1.75rem' }}>{p.avatar}</span>
                                    <div>
                                        <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem' }}>{p.name}</div>
                                        <div style={{ color: p.color, fontSize: '0.72rem' }}>{p.role}</div>
                                        <div style={{ color: '#64748b', fontSize: '0.7rem' }}>{p.city} · {p.lang}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                                    {p.traits.map(t => (
                                        <span key={t} style={{
                                            background: 'rgba(255,255,255,0.06)', color: '#94a3b8',
                                            border: '1px solid rgba(255,255,255,0.08)', borderRadius: '999px',
                                            padding: '0.1rem 0.5rem', fontSize: '0.67rem',
                                        }}>{t}</span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}

                        {/* Live Consensus Score */}
                        <AnimatePresence>
                            {done && (
                                <motion.div
                                    key="consensus"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{
                                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '1rem', padding: '1.25rem', textAlign: 'center',
                                    }}
                                >
                                    <div style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                        Focus Group Consensus
                                    </div>
                                    <div style={{
                                        fontSize: '3rem', fontWeight: 900, color: consensusScore >= 70 ? '#4ade80' : consensusScore >= 50 ? '#fbbf24' : '#f87171',
                                        lineHeight: 1, textShadow: `0 0 24px ${consensusScore >= 70 ? '#4ade8080' : '#fbbf2480'}`,
                                    }}>
                                        {consensusScore}
                                    </div>
                                    <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.25rem' }}>/ 100 Cultural BharatScore</div>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.85rem' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ color: '#4ade80', fontWeight: 700 }}>{voteTally.buy}</div>
                                            <div style={{ color: '#64748b', fontSize: '0.68rem' }}>Buy 👍</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ color: '#fbbf24', fontWeight: 700 }}>{voteTally.tweak}</div>
                                            <div style={{ color: '#64748b', fontSize: '0.68rem' }}>Tweak 🤔</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ color: '#f87171', fontWeight: 700 }}>{voteTally.reject}</div>
                                            <div style={{ color: '#64748b', fontSize: '0.68rem' }}>Reject ❌</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { setMessages([]); setDone(false); }}
                                        style={{
                                            marginTop: '0.85rem', width: '100%', background: 'rgba(255,255,255,0.06)',
                                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.6rem', padding: '0.5rem',
                                            color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem',
                                        }}
                                    >
                                        ↺ Run New Copy
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
}
