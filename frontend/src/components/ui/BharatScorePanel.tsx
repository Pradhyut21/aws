/**
 * BharatScorePanel — Veritas-inspired per-claim confidence bars
 *
 * Replaces the plain number display for BharatScore sub-scores.
 * Each score shown as a labelled filled bar with colour-coding.
 * SHAP-style explanation strings (from qualityGuard.ts) rendered as
 * green/red factor cards below the bars.
 *
 * Inspired by: Veritas per-claim confidence cards + Luna-Lupa CopilotPanel
 */

interface SubScore {
    label: string;
    key: string;
    description: string;
    icon: string;
    color: string;
}

const SUB_SCORES: SubScore[] = [
    {
        key: 'culturalFit',
        label: 'Cultural Fit',
        icon: '🏺',
        color: '#f59e0b',
        description: 'How well the content respects Indian cultural context',
    },
    {
        key: 'seoScore',
        label: 'SEO & Hashtags',
        icon: '🔍',
        color: '#3b82f6',
        description: 'Hashtag quality, keyword density, discoverability',
    },
    {
        key: 'engagementPotential',
        label: 'Engagement Potential',
        icon: '💬',
        color: '#8b5cf6',
        description: 'Predicted likelihood of comments, shares, and saves',
    },
    {
        key: 'platformOptimization',
        label: 'Platform Optimisation',
        icon: '📱',
        color: '#10b981',
        description: 'Format, length, and CTA optimised for target platform',
    },
];

interface BharatScorePanelProps {
    bharatScore: Record<string, number>;
    explanations?: string[];
    flags?: string[];
    revisionSuggestions?: string[];
}

export default function BharatScorePanel({
    bharatScore,
    explanations = [],
    flags = [],
    revisionSuggestions = [],
}: BharatScorePanelProps) {
    const total =
        bharatScore.total ??
        Math.round(
            SUB_SCORES.reduce((s, sub) => s + (bharatScore[sub.key] ?? 0), 0) / SUB_SCORES.length
        );

    const totalColor = total >= 85 ? '#4ade80' : total >= 70 ? '#f59e0b' : '#f87171';

    return (
        <div
            style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '1rem',
                padding: '1.5rem',
                fontFamily: 'Inter, system-ui, sans-serif',
            }}
        >
            {/* Total score header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.25rem',
                }}
            >
                <div>
                    <div
                        style={{
                            color: '#94a3b8',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                            marginBottom: '0.25rem',
                        }}
                    >
                        BHARATSCORE™
                    </div>
                    <div style={{ color: '#e2e8f0', fontSize: '0.85rem' }}>
                        AI Quality Assessment
                    </div>
                </div>
                <div
                    style={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        background: `conic-gradient(${totalColor} ${total * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    <div
                        style={{
                            width: 52,
                            height: 52,
                            borderRadius: '50%',
                            background: '#0f0f1a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                        }}
                    >
                        <div
                            style={{
                                color: totalColor,
                                fontWeight: 800,
                                fontSize: '1.2rem',
                                lineHeight: 1,
                            }}
                        >
                            {total}
                        </div>
                        <div style={{ color: '#475569', fontSize: '0.6rem' }}>/100</div>
                    </div>
                </div>
            </div>

            {/* Sub-score bars (Veritas-style) */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    marginBottom: '1rem',
                }}
            >
                {SUB_SCORES.map(sub => {
                    const score = bharatScore[sub.key] ?? 0;
                    return (
                        <div key={sub.key}>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '0.3rem',
                                }}
                            >
                                <div
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                >
                                    <span style={{ fontSize: '0.9rem' }}>{sub.icon}</span>
                                    <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>
                                        {sub.label}
                                    </span>
                                </div>
                                <span
                                    style={{
                                        color: sub.color,
                                        fontWeight: 700,
                                        fontSize: '0.85rem',
                                    }}
                                >
                                    {score}/100
                                </span>
                            </div>
                            <div
                                style={{
                                    height: 6,
                                    background: 'rgba(255,255,255,0.06)',
                                    borderRadius: 999,
                                    overflow: 'hidden',
                                }}
                            >
                                <div
                                    style={{
                                        height: '100%',
                                        width: `${score}%`,
                                        background: `linear-gradient(90deg, ${sub.color}aa, ${sub.color})`,
                                        borderRadius: 999,
                                        transition: 'width 0.8s ease',
                                    }}
                                />
                            </div>
                            <div
                                style={{
                                    color: '#475569',
                                    fontSize: '0.68rem',
                                    marginTop: '0.2rem',
                                }}
                            >
                                {sub.description}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* SHAP-style explanation factors (Luna-Lupa CopilotPanel-inspired) */}
            {explanations.length > 0 && (
                <div
                    style={{
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        paddingTop: '0.75rem',
                        marginTop: '0.25rem',
                    }}
                >
                    <div
                        style={{
                            color: '#64748b',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                            marginBottom: '0.5rem',
                        }}
                    >
                        CONTRIBUTING FACTORS
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {explanations.map((exp, i) => {
                            const isPositive = exp.includes('+');
                            return (
                                <div
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '0.5rem',
                                        background: isPositive
                                            ? 'rgba(74,222,128,0.06)'
                                            : 'rgba(248,113,113,0.06)',
                                        border: `1px solid ${isPositive ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)'}`,
                                        borderRadius: '0.4rem',
                                        padding: '0.4rem 0.6rem',
                                    }}
                                >
                                    <span
                                        style={{
                                            color: isPositive ? '#4ade80' : '#f87171',
                                            fontSize: '0.85rem',
                                            flexShrink: 0,
                                        }}
                                    >
                                        {isPositive ? '▲' : '▼'}
                                    </span>
                                    <span
                                        style={{
                                            color: '#94a3b8',
                                            fontSize: '0.78rem',
                                            lineHeight: 1.4,
                                        }}
                                    >
                                        {exp}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Content flags */}
            {flags.length > 0 && (
                <div
                    style={{
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        paddingTop: '0.75rem',
                        marginTop: '0.75rem',
                    }}
                >
                    <div
                        style={{
                            color: '#64748b',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                            marginBottom: '0.5rem',
                        }}
                    >
                        CONTENT FLAGS
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {flags.map((flag, i) => (
                            <span
                                key={i}
                                style={{
                                    background: 'rgba(248,113,113,0.1)',
                                    color: '#f87171',
                                    border: '1px solid rgba(248,113,113,0.2)',
                                    borderRadius: '999px',
                                    fontSize: '0.72rem',
                                    padding: '0.2rem 0.6rem',
                                }}
                            >
                                ⚠ {flag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Revision suggestions */}
            {revisionSuggestions.length > 0 && (
                <div
                    style={{
                        background: 'rgba(99,102,241,0.06)',
                        border: '1px solid rgba(99,102,241,0.15)',
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        marginTop: '0.75rem',
                    }}
                >
                    <div
                        style={{
                            color: '#818cf8',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            marginBottom: '0.4rem',
                        }}
                    >
                        💡 REVISION SUGGESTIONS
                    </div>
                    {revisionSuggestions.map((s, i) => (
                        <div
                            key={i}
                            style={{
                                color: '#94a3b8',
                                fontSize: '0.78rem',
                                paddingLeft: '0.5rem',
                                lineHeight: 1.5,
                            }}
                        >
                            • {s}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
