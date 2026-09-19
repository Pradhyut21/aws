import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExperiments } from '../lib/api';

const STATUS_COLORS: Record<string, string> = {
    running: '#f59e0b',
    completed: '#4ade80',
    cancelled: '#64748b',
};

export default function ExperimentLab() {
    const navigate = useNavigate();
    const [experiments, setExperiments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<any | null>(null);

    useEffect(() => {
        getExperiments()
            .then(setExperiments)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg,#0f0f1a 0%,#1a1030 50%,#0f1a1a 100%)',
                padding: '2rem',
                fontFamily: 'Inter, system-ui, sans-serif',
            }}
        >
            {/* Header */}
            <div
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}
            >
                <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: '#94a3b8',
                        borderRadius: '0.5rem',
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                    }}
                >
                    ← Dashboard
                </button>
                <div>
                    <h1 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
                        🧪 Experiment Lab
                    </h1>
                    <p style={{ color: '#64748b', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
                        A/B variant experiments created automatically for each campaign — stored in
                        DynamoDB.
                    </p>
                </div>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: selected ? '380px 1fr' : '1fr',
                    gap: '1.5rem',
                    maxWidth: '1100px',
                }}
            >
                {/* Experiment List */}
                <div>
                    {loading ? (
                        <div style={{ color: '#64748b', textAlign: 'center', padding: '4rem' }}>
                            Loading experiments…
                        </div>
                    ) : experiments.length === 0 ? (
                        <div
                            style={{
                                color: '#64748b',
                                textAlign: 'center',
                                padding: '4rem',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px dashed rgba(255,255,255,0.08)',
                                borderRadius: '1rem',
                            }}
                        >
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🧪</div>
                            <p style={{ margin: 0 }}>
                                No experiments yet. Run a campaign to create your first A/B
                                experiment.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {experiments.map((exp: any) => (
                                <div
                                    key={exp.id}
                                    onClick={() =>
                                        setSelected(selected?.id === exp.id ? null : exp)
                                    }
                                    style={{
                                        background:
                                            selected?.id === exp.id
                                                ? 'rgba(167,139,250,0.08)'
                                                : 'rgba(255,255,255,0.04)',
                                        border: `1px solid ${selected?.id === exp.id ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.08)'}`,
                                        borderRadius: '0.75rem',
                                        padding: '1rem 1.25rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div
                                                style={{
                                                    color: '#e2e8f0',
                                                    fontWeight: 600,
                                                    fontSize: '0.9rem',
                                                    marginBottom: '0.3rem',
                                                }}
                                            >
                                                {exp.variants?.length ?? 0} variants · Campaign{' '}
                                                {exp.campaignId.slice(0, 8)}…
                                            </div>
                                            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                                {exp.hypothesis?.slice(0, 80)}…
                                            </div>
                                            <div
                                                style={{
                                                    color: '#475569',
                                                    fontSize: '0.72rem',
                                                    marginTop: '0.3rem',
                                                }}
                                            >
                                                {new Date(exp.createdAt).toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                        <span
                                            style={{
                                                background: `${STATUS_COLORS[exp.status] ?? '#64748b'}22`,
                                                color: STATUS_COLORS[exp.status] ?? '#64748b',
                                                border: `1px solid ${STATUS_COLORS[exp.status] ?? '#64748b'}44`,
                                                borderRadius: '999px',
                                                fontSize: '0.72rem',
                                                padding: '0.2rem 0.6rem',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {exp.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detail Panel */}
                {selected && (
                    <div
                        style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '1rem',
                            }}
                        >
                            <h2
                                style={{
                                    color: '#e2e8f0',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    margin: 0,
                                }}
                            >
                                Experiment Detail
                            </h2>
                            <button
                                onClick={() => setSelected(null)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#64748b',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div
                            style={{
                                color: '#94a3b8',
                                fontSize: '0.8rem',
                                marginBottom: '1.25rem',
                                lineHeight: 1.5,
                            }}
                        >
                            <strong style={{ color: '#e2e8f0' }}>Hypothesis:</strong>{' '}
                            {selected.hypothesis}
                        </div>

                        {/* Variants */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {(selected.variants ?? []).map((v: any, _i: number) => (
                                <div
                                    key={v.id}
                                    style={{
                                        background: 'rgba(0,0,0,0.2)',
                                        border:
                                            selected.winner === v.id
                                                ? '1px solid #4ade80'
                                                : '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: '0.75rem',
                                        padding: '1rem',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: '0.5rem',
                                        }}
                                    >
                                        <span
                                            style={{
                                                color: '#e2e8f0',
                                                fontWeight: 600,
                                                fontSize: '0.9rem',
                                            }}
                                        >
                                            {v.label}
                                        </span>
                                        {selected.winner === v.id && (
                                            <span style={{ color: '#4ade80', fontSize: '0.75rem' }}>
                                                🏆 Winner
                                            </span>
                                        )}
                                    </div>
                                    {v.metrics ? (
                                        <div
                                            style={{
                                                display: 'flex',
                                                gap: '1rem',
                                                flexWrap: 'wrap',
                                            }}
                                        >
                                            {Object.entries(v.metrics).map(([k, val]) => (
                                                <div key={k} style={{ textAlign: 'center' }}>
                                                    <div
                                                        style={{
                                                            color: '#a78bfa',
                                                            fontWeight: 700,
                                                            fontSize: '1rem',
                                                        }}
                                                    >
                                                        {String(val)}
                                                        {k === 'ctr' || k === 'engagement'
                                                            ? '%'
                                                            : ''}
                                                    </div>
                                                    <div
                                                        style={{
                                                            color: '#64748b',
                                                            fontSize: '0.7rem',
                                                        }}
                                                    >
                                                        {k.toUpperCase()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ color: '#475569', fontSize: '0.8rem' }}>
                                            Metrics pending — update via API PATCH
                                            /experiments/:id/metrics
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {selected.insight && (
                            <div
                                style={{
                                    marginTop: '1rem',
                                    background: 'rgba(74,222,128,0.08)',
                                    border: '1px solid rgba(74,222,128,0.2)',
                                    borderRadius: '0.5rem',
                                    padding: '0.75rem',
                                }}
                            >
                                <div
                                    style={{
                                        color: '#4ade80',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        marginBottom: '0.25rem',
                                    }}
                                >
                                    💡 Insight
                                </div>
                                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                                    {selected.insight}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
