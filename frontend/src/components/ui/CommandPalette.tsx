/**
 * CommandPalette — Global ⌘K / Ctrl+K Power-User Palette
 *
 * Inspired by: pacocoursey/cmdk (⭐7.5k) + janovekj/cmdkit (indie)
 * Built with: framer-motion (already installed) — zero new dependencies
 *
 * Features:
 *  - ⌘K / Ctrl+K global hotkey
 *  - Instant page navigation
 *  - BharatScore audit — paste any ad text → get cultural resonance
 *  - Language quick-switcher (10 Indian languages)
 *  - Recent campaigns quick-access from localStorage
 *  - Keyboard arrow navigation, Escape to close
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface PaletteItem {
    id: string;
    icon: string;
    label: string;
    sublabel?: string;
    category: string;
    action: () => void;
    keywords?: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const LANG_MAP: Record<string, string> = {
    hi: '🇮🇳 Hindi', ta: '🌴 Tamil', te: '🌾 Telugu',
    mr: '🦁 Marathi', bn: '🎨 Bengali', gu: '💎 Gujarati',
    kn: '🏛️ Kannada', ml: '🌊 Malayalam', pa: '🌻 Punjabi', en: '🇬🇧 English',
};

function loadCampaigns(): any[] {
    try { return JSON.parse(localStorage.getItem('bm_campaigns') || '[]'); }
    catch { return []; }
}

function quickBharatScore(text: string): number {
    // Lightweight cultural resonance heuristic (no API call)
    const indianSlang = ['jugaad', 'dhamaka', 'mast', 'kadak', 'baap', 'bindaas', 'khatarnak',
        'gethu', 'mass', 'super', 'vanakkam', 'bhai', 'didi', 'yaar', 'sahi', 'zabardast',
        'फ्री', 'ऑफर', 'लूट', 'धमाका', 'सुपर', 'கடக்', 'தனி', 'வாங்க'];
    const festivals = ['diwali', 'holi', 'eid', 'navratri', 'pongal', 'durga', 'ganesh', 'onam', 'chhath'];
    const urgency = ['limited', 'today', 'only', 'hurry', 'last', 'अभी', 'जल्दी', 'சீக்கிரம்'];

    let score = 50;
    const lower = text.toLowerCase();
    indianSlang.forEach(s => { if (lower.includes(s)) score += 6; });
    festivals.forEach(f => { if (lower.includes(f)) score += 8; });
    urgency.forEach(u => { if (lower.includes(u)) score += 4; });
    const devanagari = (text.match(/[\u0900-\u097F]/g) || []).length;
    const tamil = (text.match(/[\u0B80-\u0BFF]/g) || []).length;
    if (devanagari > 5) score += 10;
    if (tamil > 3) score += 8;
    return Math.min(100, score);
}

function scoreLabel(s: number) {
    if (s >= 80) return { label: 'Excellent', color: '#4ade80' };
    if (s >= 60) return { label: 'Good', color: '#fbbf24' };
    if (s >= 40) return { label: 'Average', color: '#fb923c' };
    return { label: 'Weak', color: '#f87171' };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CommandPalette() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState(0);
    const [auditText, setAuditText] = useState('');
    const [auditScore, setAuditScore] = useState<number | null>(null);
    const [showAudit, setShowAudit] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const campaigns = useMemo(() => loadCampaigns(), [open]);

    const close = useCallback(() => {
        setOpen(false);
        setQuery('');
        setSelected(0);
        setShowAudit(false);
        setAuditText('');
        setAuditScore(null);
    }, []);

    // Global hotkey
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setOpen(prev => !prev);
            }
            if (e.key === 'Escape') close();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [close]);

    // Focus input on open
    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 60);
    }, [open]);

    // Build items
    const staticItems: PaletteItem[] = useMemo(() => [
        // Navigation
        { id: 'nav-dash', icon: '🏠', label: 'Go to Dashboard', category: 'Navigate', action: () => { navigate('/dashboard'); close(); }, keywords: ['home', 'main'] },
        { id: 'nav-campaign', icon: '🚀', label: 'New Campaign', category: 'Navigate', action: () => { navigate('/campaign/new'); close(); }, keywords: ['create', 'launch'] },
        { id: 'nav-analytics', icon: '📊', label: 'Analytics', category: 'Navigate', action: () => { navigate('/analytics'); close(); }, keywords: ['charts', 'stats', 'data'] },
        { id: 'nav-trace', icon: '🔍', label: 'Agent Trace', sublabel: 'Debug AI pipeline steps', category: 'Navigate', action: () => { navigate('/trace'); close(); }, keywords: ['debug', 'agents', 'pipeline'] },
        { id: 'nav-brain', icon: '🧠', label: 'BharatBrain', sublabel: 'AI knowledge graph', category: 'Navigate', action: () => { navigate('/brain'); close(); }, keywords: ['knowledge', 'memory'] },
        { id: 'nav-pulse', icon: '📡', label: 'Market Pulse', sublabel: 'Live trend signals', category: 'Navigate', action: () => { navigate('/market-pulse'); close(); }, keywords: ['trends', 'signals'] },
        { id: 'nav-exp', icon: '⚗️', label: 'Experiment Lab', sublabel: 'A/B test campaigns', category: 'Navigate', action: () => { navigate('/experiments'); close(); }, keywords: ['ab test', 'variants'] },
        { id: 'nav-templates', icon: '📁', label: 'Templates', category: 'Navigate', action: () => { navigate('/templates'); close(); }, keywords: ['presets'] },
        { id: 'nav-calendar', icon: '📅', label: 'Calendar', sublabel: 'Campaign schedule', category: 'Navigate', action: () => { navigate('/calendar'); close(); }, keywords: ['schedule', 'dates'] },
        // Language switch
        ...Object.entries(LANG_MAP).map(([code, name]) => ({
            id: `lang-${code}`,
            icon: name.split(' ')[0],
            label: `Switch to ${name.split(' ').slice(1).join(' ')}`,
            sublabel: 'Set campaign generation language',
            category: 'Language',
            action: () => {
                localStorage.setItem('bm_palette_lang', code);
                window.dispatchEvent(new CustomEvent('bm:lang-switch', { detail: code }));
                close();
            },
            keywords: [code, name.toLowerCase()],
        })),
        // Quick audit trigger
        { id: 'audit', icon: '⚡', label: 'Instant BharatScore Audit', sublabel: 'Paste ad copy → get cultural resonance', category: 'Tools', action: () => setShowAudit(true), keywords: ['score', 'audit', 'test', 'check'] },
        // GitHub Ideas — Cultural & AI Features
        { id: 'nav-focus', icon: '💬', label: 'Bharat Focus Group', sublabel: 'WhatsApp persona debate simulator', category: 'Cultural AI', action: () => { navigate('/focus-group'); close(); }, keywords: ['personas', 'debate', 'whatsapp', 'focus'] },
        { id: 'nav-map', icon: '🗺️', label: 'Bharat Dialect Atlas', sublabel: 'Interactive regional cultural map', category: 'Cultural AI', action: () => { navigate('/dialect-atlas'); close(); }, keywords: ['map', 'states', 'regions', 'india'] },
        { id: 'nav-diff', icon: '✨', label: 'Cultural Diff Inspector', sublabel: 'Slang & localized copy side-by-side', category: 'Cultural AI', action: () => { navigate('/cultural-diff'); close(); }, keywords: ['diff', 'slang', 'localize', 'hinglish'] },
        { id: 'nav-sensitivity', icon: '🛡️', label: 'Sensitivity Matrix', sublabel: '6-point cultural safety audit', category: 'Cultural AI', action: () => { navigate('/sensitivity'); close(); }, keywords: ['taboo', 'safety', 'guard', 'audit', 'asci'] },
        { id: 'nav-audio', icon: '🎙️', label: 'Audio Wave Studio', sublabel: 'Regional voice & waveform generator', category: 'Creator Studio', action: () => { navigate('/audio-studio'); close(); }, keywords: ['voice', 'audio', 'rj', 'waveform', 'sound'] },
        { id: 'nav-poster', icon: '🎨', label: 'Festival Poster Studio', sublabel: '1-click WhatsApp & Instagram poster', category: 'Creator Studio', action: () => { navigate('/poster-studio'); close(); }, keywords: ['poster', 'diwali', 'festival', 'whatsapp', 'instagram'] },
        { id: 'nav-trans', icon: '⌨️', label: 'Transliteration Engine', sublabel: 'Hinglish / Tanglish 3-way converter', category: 'Creator Studio', action: () => { navigate('/transliteration'); close(); }, keywords: ['transliterate', 'hinglish', 'tanglish', 'script', 'devanagari'] },
        { id: 'nav-ideas', icon: '🇮🇳', label: 'Ideas Hub — All 8 Innovations', sublabel: 'Browse all 8 GitHub-inspired Bharat features', category: 'Navigate', action: () => { navigate('/ideas'); close(); }, keywords: ['ideas', 'hub', 'innovations', 'github', 'features', 'showcase'] },
    ], [navigate, close]);

    // Recent campaigns as items
    const recentItems: PaletteItem[] = useMemo(() =>
        campaigns.slice(0, 5).map((c: any, i: number) => ({
            id: `campaign-${i}`,
            icon: '📋',
            label: c.input?.substring(0, 40) + (c.input?.length > 40 ? '…' : '') || `Campaign ${i + 1}`,
            sublabel: `BharatScore: ${c.result?.bharatScore?.total ?? '?'}/100 · ${c.language?.toUpperCase() ?? ''}`,
            category: 'Recent',
            action: () => { navigate(`/trace/${c.id ?? ''}`); close(); },
            keywords: [c.input ?? '', c.language ?? ''],
        })), [campaigns, navigate, close]);

    const allItems = [...staticItems, ...recentItems];

    // Filter
    const filtered = useMemo(() => {
        if (!query) return allItems;
        const q = query.toLowerCase();
        return allItems.filter(item =>
            item.label.toLowerCase().includes(q) ||
            (item.sublabel?.toLowerCase().includes(q)) ||
            (item.keywords?.some(k => k.toLowerCase().includes(q))) ||
            item.category.toLowerCase().includes(q)
        );
    }, [query, allItems]);

    // Group by category
    const grouped = useMemo(() => {
        const map: Record<string, PaletteItem[]> = {};
        filtered.forEach(item => {
            if (!map[item.category]) map[item.category] = [];
            map[item.category].push(item);
        });
        return map;
    }, [filtered]);

    // Flat list for keyboard nav
    const flatList = filtered;

    // Arrow navigation
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (!open) return;
            if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, flatList.length - 1)); }
            if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
            if (e.key === 'Enter') {
                e.preventDefault();
                if (flatList[selected]) flatList[selected].action();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, flatList, selected]);

    // Reset selection on filter change
    useEffect(() => setSelected(0), [query]);

    // Handle audit score
    const runAudit = useCallback(() => {
        if (auditText.trim().length < 3) return;
        const s = quickBharatScore(auditText);
        setAuditScore(s);
    }, [auditText]);

    return (
        <>
            {/* Trigger hint visible in sidebar / anywhere — shows if palette closed */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        key="overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={close}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 9998,
                            background: 'rgba(0,0,0,0.65)',
                            backdropFilter: 'blur(6px)',
                        }}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {open && (
                    <motion.div
                        key="palette"
                        initial={{ opacity: 0, scale: 0.96, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -12 }}
                        transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
                        style={{
                            position: 'fixed',
                            top: '15vh',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 9999,
                            width: '100%',
                            maxWidth: 620,
                            background: 'rgba(13,13,28,0.96)',
                            border: '1px solid rgba(255,107,53,0.25)',
                            borderRadius: '1.25rem',
                            boxShadow: '0 0 0 1px rgba(255,107,53,0.1), 0 32px 80px rgba(0,0,0,0.7), 0 0 60px rgba(255,107,53,0.06)',
                            overflow: 'hidden',
                            fontFamily: 'Inter, system-ui, sans-serif',
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '1rem 1.25rem',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                        }}>
                            <span style={{ fontSize: '1.1rem', opacity: 0.5 }}>⌘</span>
                            {!showAudit ? (
                                <input
                                    ref={inputRef}
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    placeholder="Search pages, languages, tools…"
                                    style={{
                                        flex: 1, background: 'transparent', border: 'none', outline: 'none',
                                        color: '#f1f5f9', fontSize: '1rem', fontFamily: 'Inter, system-ui, sans-serif',
                                    }}
                                />
                            ) : (
                                <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <span style={{ color: '#FF6B35', fontSize: '0.85rem', fontWeight: 600, flexShrink: 0 }}>⚡ Audit:</span>
                                    <input
                                        autoFocus
                                        value={auditText}
                                        onChange={e => { setAuditText(e.target.value); setAuditScore(null); }}
                                        onKeyDown={e => e.key === 'Enter' && runAudit()}
                                        placeholder="Paste your ad copy here and press Enter…"
                                        style={{
                                            flex: 1, background: 'transparent', border: 'none', outline: 'none',
                                            color: '#f1f5f9', fontSize: '0.95rem', fontFamily: 'Inter, system-ui, sans-serif',
                                        }}
                                    />
                                    <button onClick={() => setShowAudit(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem' }}>✕ Cancel</button>
                                </div>
                            )}
                            <kbd style={{
                                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                                borderRadius: '0.35rem', padding: '0.15rem 0.45rem', fontSize: '0.72rem', color: '#64748b',
                                flexShrink: 0,
                            }}>ESC</kbd>
                        </div>

                        {/* Audit Result */}
                        <AnimatePresence>
                            {showAudit && auditScore !== null && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{
                                        padding: '0.875rem 1.25rem',
                                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                                        display: 'flex', alignItems: 'center', gap: '1rem',
                                    }}
                                >
                                    <div style={{
                                        width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.1rem', fontWeight: 800, color: scoreLabel(auditScore).color,
                                        border: `2px solid ${scoreLabel(auditScore).color}`,
                                        boxShadow: `0 0 16px ${scoreLabel(auditScore).color}40`,
                                    }}>
                                        {auditScore}
                                    </div>
                                    <div>
                                        <div style={{ color: scoreLabel(auditScore).color, fontWeight: 700, fontSize: '0.9rem' }}>
                                            BharatScore: {scoreLabel(auditScore).label}
                                        </div>
                                        <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.15rem' }}>
                                            {auditScore >= 70 ? '✅ Strong regional resonance — ready to publish' :
                                                auditScore >= 50 ? '⚡ Moderate — add local slang or festival hook to boost score' :
                                                    '🔴 Low cultural fit — try Hinglish copy or a regional dialect'}
                                        </div>
                                    </div>
                                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                        <div style={{
                                            background: 'rgba(255,107,53,0.1)', color: '#FF6B35',
                                            border: '1px solid rgba(255,107,53,0.2)', borderRadius: '0.5rem',
                                            padding: '0.3rem 0.65rem', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                                        }} onClick={() => { setAuditText(''); setAuditScore(null); }}>
                                            Try Another ↺
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Quick-run audit prompt */}
                        {showAudit && auditScore === null && auditText.trim().length > 2 && (
                            <div style={{ padding: '0.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#64748b', fontSize: '0.8rem' }}>
                                Press <kbd style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.3rem', padding: '0.1rem 0.35rem' }}>↵ Enter</kbd> to run BharatScore audit
                            </div>
                        )}

                        {/* Results list */}
                        {!showAudit && (
                            <div
                                ref={listRef}
                                style={{ maxHeight: 380, overflowY: 'auto', padding: '0.5rem 0' }}
                            >
                                {Object.entries(grouped).map(([category, items]) => (
                                    <div key={category}>
                                        <div style={{
                                            padding: '0.5rem 1.25rem 0.25rem',
                                            color: '#475569', fontSize: '0.68rem', fontWeight: 700,
                                            letterSpacing: '0.08em', textTransform: 'uppercase',
                                        }}>
                                            {category}
                                        </div>
                                        {items.map((item) => {
                                            const globalIdx = flatList.findIndex(f => f.id === item.id);
                                            const isSelected = globalIdx === selected;
                                            return (
                                                <motion.div
                                                    key={item.id}
                                                    onClick={item.action}
                                                    animate={{
                                                        background: isSelected
                                                            ? 'rgba(255,107,53,0.1)'
                                                            : 'transparent',
                                                    }}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                        padding: '0.55rem 1.25rem',
                                                        cursor: 'pointer',
                                                        borderLeft: isSelected ? '2px solid #FF6B35' : '2px solid transparent',
                                                        transition: 'all 0.12s',
                                                    }}
                                                >
                                                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{
                                                            color: isSelected ? '#fff' : '#e2e8f0',
                                                            fontSize: '0.9rem', fontWeight: 500,
                                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                        }}>
                                                            {item.label}
                                                        </div>
                                                        {item.sublabel && (
                                                            <div style={{
                                                                color: '#64748b', fontSize: '0.75rem',
                                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                            }}>
                                                                {item.sublabel}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {isSelected && (
                                                        <kbd style={{
                                                            background: 'rgba(255,107,53,0.15)',
                                                            border: '1px solid rgba(255,107,53,0.3)',
                                                            borderRadius: '0.3rem', padding: '0.1rem 0.4rem',
                                                            fontSize: '0.68rem', color: '#FF6B35', flexShrink: 0,
                                                        }}>↵</kbd>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                ))}

                                {filtered.length === 0 && (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#475569' }}>
                                        <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>🔍</div>
                                        <div style={{ fontSize: '0.85rem' }}>No results for "<strong style={{ color: '#94a3b8' }}>{query}</strong>"</div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Footer */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '1rem',
                            padding: '0.65rem 1.25rem',
                            borderTop: '1px solid rgba(255,255,255,0.06)',
                            color: '#475569', fontSize: '0.72rem',
                        }}>
                            <span>↑↓ Navigate</span>
                            <span>↵ Select</span>
                            <span>ESC Close</span>
                            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <span style={{ color: '#FF6B35', fontWeight: 600 }}>BharatMedia</span>
                                <span style={{ color: '#1e293b' }}>⌘K</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
