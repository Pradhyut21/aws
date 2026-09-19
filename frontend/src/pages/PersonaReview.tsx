/**
 * PersonaReview — BharatPersonaSwarm Dashboard
 *
 * Displays the results of running 20 Indian demographic personas against
 * a campaign. Shows score rings, verdict badges, feedback cards, and
 * the Finalizer agent's strategic recommendation.
 *
 * Pattern from: aws-samples/sample-agentic-genai-agentcore
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface PersonaResult {
    personaId: string;
    name: string;
    resonanceScore: number;
    verdict: 'PASS' | 'FLAG' | 'HIGH_RISK';
    feedback: string;
    suggestedTweak?: string;
}

interface BharatResonanceScore {
    campaignId: string;
    overallResonance: number;
    passCount: number;
    flagCount: number;
    highRiskCount: number;
    personaResults: PersonaResult[];
    validatorFlags: string[];
    recommendation: string;
    createdAt: string;
    latencyMs: number;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const PERSONA_AVATARS: Record<string, string> = {
    P01: '👨‍💻',
    P02: '👩‍🍳',
    P03: '🌾',
    P04: '👩‍🎓',
    P05: '🏪',
    P06: '👩‍💼',
    P07: '🧓',
    P08: '🛵',
    P09: '👗',
    P10: '🧺',
    P11: '🏥',
    P12: '🍃',
    P13: '🚀',
    P14: '🎨',
    P15: '👩‍🏫',
    P16: '🛺',
    P17: '🌈',
    P18: '🙏',
    P19: '🕌',
    P20: '🏔️',
};

function verdictColor(v: string) {
    if (v === 'PASS')
        return {
            bg: 'rgba(74,222,128,0.12)',
            border: 'rgba(74,222,128,0.3)',
            text: '#4ade80',
            dot: '#4ade80',
        };
    if (v === 'FLAG')
        return {
            bg: 'rgba(251,191,36,0.12)',
            border: 'rgba(251,191,36,0.3)',
            text: '#fbbf24',
            dot: '#fbbf24',
        };
    return {
        bg: 'rgba(248,113,113,0.12)',
        border: 'rgba(248,113,113,0.3)',
        text: '#f87171',
        dot: '#f87171',
    };
}

function scoreColor(score: number) {
    if (score >= 75) return '#4ade80';
    if (score >= 50) return '#fbbf24';
    return '#f87171';
}

// ─── SCORE RING ───────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
    const color = scoreColor(score);
    const r = size / 2 - 5;
    const circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;
    return (
        <svg width={size} height={size} style={{ flexShrink: 0 }}>
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="rgba(255,255,255,0.07)"
                strokeWidth={4}
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={color}
                strokeWidth={4}
                strokeDasharray={`${dash} ${circ}`}
                strokeLinecap="round"
                style={{
                    transform: 'rotate(-90deg)',
                    transformOrigin: 'center',
                    transition: 'stroke-dasharray 0.8s ease',
                }}
            />
            <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="central"
                fill={color}
                fontSize={size < 50 ? 11 : 14}
                fontWeight={700}
                fontFamily="Inter, system-ui"
            >
                {score}
            </text>
        </svg>
    );
}

// ─── PERSONA CARD ─────────────────────────────────────────────────────────────
function PersonaCard({ p, delay = 0 }: { p: PersonaResult; delay?: number }) {
    const vc = verdictColor(p.verdict);
    const [vis, setVis] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setVis(true), delay);
        return () => clearTimeout(t);
    }, [delay]);

    return (
        <div
            style={{
                background: vc.bg,
                border: `1px solid ${vc.border}`,
                borderRadius: '0.875rem',
                padding: '1rem',
                opacity: vis ? 1 : 0,
                transform: vis ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 0.35s ease, transform 0.35s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ fontSize: '1.8rem', lineHeight: 1, flexShrink: 0 }}>
                    {PERSONA_AVATARS[p.personaId] ?? '👤'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                        style={{
                            color: '#e2e8f0',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {p.name}
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            marginTop: '0.2rem',
                        }}
                    >
                        <span
                            style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: vc.dot,
                                flexShrink: 0,
                            }}
                        />
                        <span
                            style={{
                                color: vc.text,
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                letterSpacing: '0.05em',
                            }}
                        >
                            {p.verdict.replace('_', ' ')}
                        </span>
                    </div>
                </div>
                <ScoreRing score={p.resonanceScore} size={48} />
            </div>

            {/* Feedback */}
            <div
                style={{
                    color: '#94a3b8',
                    fontSize: '0.73rem',
                    lineHeight: 1.5,
                    padding: '0.4rem 0',
                }}
            >
                "{p.feedback}"
            </div>

            {/* Suggested tweak */}
            {p.suggestedTweak && (
                <div
                    style={{
                        background: 'rgba(99,102,241,0.08)',
                        border: '1px solid rgba(99,102,241,0.15)',
                        borderRadius: '0.4rem',
                        padding: '0.35rem 0.5rem',
                    }}
                >
                    <span style={{ color: '#818cf8', fontSize: '0.67rem', fontWeight: 600 }}>
                        💡{' '}
                    </span>
                    <span style={{ color: '#64748b', fontSize: '0.67rem' }}>
                        {p.suggestedTweak}
                    </span>
                </div>
            )}
        </div>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function PersonaReview() {
    const { campaignId } = useParams<{ campaignId: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<BharatResonanceScore | null>(null);
    const [loading, setLoading] = useState(false);
    const [polling, setPolling] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'ALL' | 'PASS' | 'FLAG' | 'HIGH_RISK'>('ALL');

    // ── Poll for result ────────────────────────────────────────────────────────
    const poll = useCallback(async () => {
        if (!campaignId) return;
        try {
            const res = await api.get(`/campaign/${campaignId}/persona-review`);
            if (res.status === 200 && res.data.overallResonance !== undefined) {
                setData(res.data);
                setPolling(false);
            }
        } catch {
            /* still processing */
        }
    }, [campaignId]);

    useEffect(() => {
        if (!polling) return;
        const interval = setInterval(poll, 4000);
        return () => clearInterval(interval);
    }, [polling, poll]);

    // ── Start review ───────────────────────────────────────────────────────────
    const startReview = async () => {
        if (!campaignId) return;
        setLoading(true);
        setError(null);
        try {
            // Check if result already exists first
            const existing = await api
                .get(`/campaign/${campaignId}/persona-review`)
                .catch(() => null);
            if (existing?.status === 200 && existing.data.overallResonance !== undefined) {
                setData(existing.data);
                setLoading(false);
                return;
            }
            // Trigger swarm
            await api.post(`/campaign/${campaignId}/persona-review`);
            setPolling(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to start persona review');
        } finally {
            setLoading(false);
        }
    };

    // Auto-start if no data
    useEffect(() => {
        if (campaignId && !data) startReview();
    }, [campaignId]);

    const filtered =
        data?.personaResults.filter(p => (filter === 'ALL' ? true : p.verdict === filter)) ?? [];

    // ─── RENDER ────────────────────────────────────────────────────────────────
    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#0a0a14',
                fontFamily: 'Inter, system-ui, sans-serif',
                padding: '2rem 1.5rem',
            }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius:3px; }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes shimmer { 0%{opacity:.4} 50%{opacity:.8} 100%{opacity:.4} }
            `}</style>

            {/* Back */}
            <button
                onClick={() => navigate(-1)}
                style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    marginBottom: '1.5rem',
                    padding: 0,
                }}
            >
                ← Back to Campaign
            </button>

            {/* Title */}
            <div style={{ marginBottom: '2rem' }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '0.4rem',
                    }}
                >
                    <span style={{ fontSize: '1.8rem' }}>🇮🇳</span>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: '1.6rem',
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, #e2e8f0, #818cf8)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        BharatPersonaSwarm
                    </h1>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
                    20 diverse Indian demographic personas reviewing your campaign in parallel
                    &nbsp;·&nbsp; Inspired by{' '}
                    <span style={{ color: '#818cf8' }}>
                        aws-samples/sample-agentic-genai-agentcore
                    </span>
                </p>
            </div>

            {/* Loading / polling state */}
            {(loading || polling) && !data && (
                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <div
                        style={{
                            width: 56,
                            height: 56,
                            border: '3px solid rgba(99,102,241,0.2)',
                            borderTopColor: '#818cf8',
                            borderRadius: '50%',
                            margin: '0 auto 1.5rem',
                            animation: 'spin 0.8s linear infinite',
                        }}
                    />
                    <div
                        style={{
                            color: '#e2e8f0',
                            fontSize: '1rem',
                            fontWeight: 600,
                            marginBottom: '0.5rem',
                        }}
                    >
                        {loading
                            ? 'Starting BharatPersonaSwarm…'
                            : 'Running 20 Indian personas in parallel…'}
                    </div>
                    <div style={{ color: '#475569', fontSize: '0.8rem' }}>
                        20 Nova Lite calls running simultaneously · Validator + Finalizer agents
                        queued
                    </div>
                    {/* Skeleton persona cards */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                            gap: '0.875rem',
                            marginTop: '2rem',
                            textAlign: 'left',
                        }}
                    >
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: '0.875rem',
                                    padding: '1rem',
                                    animation: 'shimmer 1.4s ease infinite',
                                    animationDelay: `${i * 0.1}s`,
                                }}
                            >
                                <div
                                    style={{
                                        height: 48,
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '0.5rem',
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {error && (
                <div
                    style={{
                        background: 'rgba(248,113,113,0.1)',
                        border: '1px solid rgba(248,113,113,0.2)',
                        borderRadius: '0.75rem',
                        padding: '1rem 1.25rem',
                        color: '#f87171',
                        marginBottom: '1.5rem',
                    }}
                >
                    {error}
                </div>
            )}

            {data && (
                <>
                    {/* Overall score header */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'auto 1fr',
                            gap: '1.5rem',
                            background:
                                'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.06))',
                            border: '1px solid rgba(99,102,241,0.2)',
                            borderRadius: '1.25rem',
                            padding: '1.5rem',
                            marginBottom: '1.5rem',
                            alignItems: 'center',
                        }}
                    >
                        <ScoreRing score={data.overallResonance} size={90} />
                        <div>
                            <div
                                style={{
                                    color: '#94a3b8',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.08em',
                                    marginBottom: '0.25rem',
                                }}
                            >
                                BHARATRESONANCE SCORE™
                            </div>
                            <div
                                style={{
                                    color: scoreColor(data.overallResonance),
                                    fontSize: '2rem',
                                    fontWeight: 800,
                                    lineHeight: 1.1,
                                }}
                            >
                                {data.overallResonance}/100
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    marginTop: '0.5rem',
                                    flexWrap: 'wrap',
                                }}
                            >
                                {[
                                    { label: `${data.passCount} PASS`, color: '#4ade80' },
                                    { label: `${data.flagCount} FLAG`, color: '#fbbf24' },
                                    { label: `${data.highRiskCount} HIGH RISK`, color: '#f87171' },
                                ].map(item => (
                                    <span
                                        key={item.label}
                                        style={{
                                            color: item.color,
                                            fontSize: '0.78rem',
                                            fontWeight: 700,
                                        }}
                                    >
                                        {item.label}
                                    </span>
                                ))}
                                <span style={{ color: '#475569', fontSize: '0.75rem' }}>
                                    · {(data.latencyMs / 1000).toFixed(1)}s ·{' '}
                                    {data.personaResults.length} personas
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Recommendation */}
                    <div
                        style={{
                            background: 'rgba(16,185,129,0.06)',
                            border: '1px solid rgba(16,185,129,0.15)',
                            borderRadius: '1rem',
                            padding: '1.25rem',
                            marginBottom: '1.5rem',
                        }}
                    >
                        <div
                            style={{
                                color: '#10b981',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                letterSpacing: '0.06em',
                                marginBottom: '0.5rem',
                            }}
                        >
                            🤖 FINALIZER AGENT RECOMMENDATION
                        </div>
                        <p
                            style={{
                                color: '#cbd5e1',
                                fontSize: '0.875rem',
                                lineHeight: 1.7,
                                margin: 0,
                            }}
                        >
                            {data.recommendation}
                        </p>
                    </div>

                    {/* Validator flags */}
                    {data.validatorFlags.length > 0 && (
                        <div
                            style={{
                                background: 'rgba(248,113,113,0.06)',
                                border: '1px solid rgba(248,113,113,0.15)',
                                borderRadius: '1rem',
                                padding: '1.25rem',
                                marginBottom: '1.5rem',
                            }}
                        >
                            <div
                                style={{
                                    color: '#f87171',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.06em',
                                    marginBottom: '0.6rem',
                                }}
                            >
                                ⚠ CULTURAL / LEGAL FLAGS ({data.validatorFlags.length})
                            </div>
                            {data.validatorFlags.map((f, i) => (
                                <div
                                    key={i}
                                    style={{
                                        color: '#fca5a5',
                                        fontSize: '0.8rem',
                                        lineHeight: 1.5,
                                        padding: '0.3rem 0',
                                        borderBottom:
                                            i < data.validatorFlags.length - 1
                                                ? '1px solid rgba(248,113,113,0.1)'
                                                : 'none',
                                    }}
                                >
                                    • {f}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Score bar chart */}
                    <div
                        style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '1rem',
                            padding: '1.25rem',
                            marginBottom: '1.5rem',
                        }}
                    >
                        <div
                            style={{
                                color: '#64748b',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                letterSpacing: '0.06em',
                                marginBottom: '0.75rem',
                            }}
                        >
                            ALL PERSONAS — RESONANCE SCORES
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {[...data.personaResults]
                                .sort((a, b) => b.resonanceScore - a.resonanceScore)
                                .map(p => (
                                    <div
                                        key={p.personaId}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.6rem',
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: '0.9rem',
                                                width: 22,
                                                textAlign: 'center',
                                                flexShrink: 0,
                                            }}
                                        >
                                            {PERSONA_AVATARS[p.personaId] ?? '👤'}
                                        </span>
                                        <div
                                            style={{
                                                fontSize: '0.7rem',
                                                color: '#64748b',
                                                width: 130,
                                                flexShrink: 0,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {p.name}
                                        </div>
                                        <div
                                            style={{
                                                flex: 1,
                                                height: 6,
                                                background: 'rgba(255,255,255,0.05)',
                                                borderRadius: 999,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    height: '100%',
                                                    width: `${p.resonanceScore}%`,
                                                    background: `linear-gradient(90deg, ${scoreColor(p.resonanceScore)}88, ${scoreColor(p.resonanceScore)})`,
                                                    borderRadius: 999,
                                                    transition: 'width 0.6s ease',
                                                }}
                                            />
                                        </div>
                                        <span
                                            style={{
                                                color: scoreColor(p.resonanceScore),
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                                width: 28,
                                                textAlign: 'right',
                                                flexShrink: 0,
                                            }}
                                        >
                                            {p.resonanceScore}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Filter tabs */}
                    <div
                        style={{
                            display: 'flex',
                            gap: '0.5rem',
                            marginBottom: '1rem',
                            flexWrap: 'wrap',
                        }}
                    >
                        {(['ALL', 'PASS', 'FLAG', 'HIGH_RISK'] as const).map(v => {
                            const count =
                                v === 'ALL'
                                    ? data.personaResults.length
                                    : data.personaResults.filter(p => p.verdict === v).length;
                            const active = filter === v;
                            return (
                                <button
                                    key={v}
                                    onClick={() => setFilter(v)}
                                    style={{
                                        background: active
                                            ? 'rgba(99,102,241,0.2)'
                                            : 'rgba(255,255,255,0.04)',
                                        border: `1px solid ${active ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
                                        color: active ? '#818cf8' : '#64748b',
                                        borderRadius: '0.5rem',
                                        padding: '0.35rem 0.75rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    {v.replace('_', ' ')} · {count}
                                </button>
                            );
                        })}
                    </div>

                    {/* Persona cards grid */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '0.875rem',
                        }}
                    >
                        {filtered.map((p, i) => (
                            <PersonaCard key={p.personaId} p={p} delay={i * 40} />
                        ))}
                    </div>

                    {/* Footer meta */}
                    <div
                        style={{
                            textAlign: 'center',
                            marginTop: '2rem',
                            color: '#334155',
                            fontSize: '0.72rem',
                        }}
                    >
                        Generated {new Date(data.createdAt).toLocaleString('en-IN')} · Powered by
                        Amazon Nova Lite (persona calls) + Nova Pro (validator + finalizer) ·
                        Inspired by aws-samples/sample-agentic-genai-agentcore
                    </div>
                </>
            )}
        </div>
    );
}
