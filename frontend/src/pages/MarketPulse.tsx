import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMarketPulse, getLearningLessons } from '../lib/api';

export default function MarketPulse() {
    const navigate = useNavigate();
    const [signals, setSignals] = useState<any[]>([]);
    const [lessons, setLessons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pulse' | 'learning'>('pulse');

    useEffect(() => {
        Promise.all([getMarketPulse(), getLearningLessons()])
            .then(([pulse, learn]) => {
                setSignals(pulse.signals ?? []);
                setLessons(learn ?? []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f0f1a 0%,#1a1030 50%,#0f1a1a 100%)', padding: '2rem', fontFamily: 'Inter, system-ui, sans-serif' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8', borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>← Dashboard</button>
                <div>
                    <h1 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>📡 Market Pulse + Learning</h1>
                    <p style={{ color: '#64748b', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>Live signals (demo stream) + campaign lessons extracted by the AI and stored in DynamoDB.</p>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {(['pulse', 'learning'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                            background: activeTab === tab ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'rgba(255,255,255,0.06)',
                            color: activeTab === tab ? '#fff' : '#94a3b8',
                            transition: 'all 0.2s',
                        }}>
                        {tab === 'pulse' ? '📊 Market Pulse' : '🧠 Learning Memory'}
                    </button>
                ))}
            </div>

            {loading && <div style={{ color: '#64748b', textAlign: 'center', padding: '4rem' }}>Loading…</div>}

            {!loading && activeTab === 'pulse' && (
                <div style={{ maxWidth: '800px' }}>
                    {/* Demo disclaimer */}
                    <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                        <span>⚠️</span>
                        <p style={{ color: '#fbbf24', fontSize: '0.8rem', margin: 0 }}>
                            <strong>SIMULATED DATA</strong> — These signals are for demonstration. In production, connect to a real social listening API (e.g., Twitter API, Meta Business, or Google Trends) via Kinesis → Lambda → Bedrock.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {signals.map((s: any, i: number) => (
                            <div key={i} style={{
                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '0.75rem', padding: '1rem 1.25rem',
                                display: 'flex', alignItems: 'center', gap: '1rem',
                            }}>
                                <span style={{ fontSize: '1.5rem' }}>{s.trend === 'up' ? '🔥' : '📉'}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem' }}>{s.topic}</div>
                                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{s.region} · {new Date(s.timestamp).toLocaleTimeString('en-IN')}</div>
                                </div>
                                <div style={{
                                    color: s.trend === 'up' ? '#4ade80' : '#f87171',
                                    fontWeight: 700, fontSize: '1rem',
                                    background: s.trend === 'up' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                                    border: `1px solid ${s.trend === 'up' ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
                                    borderRadius: '0.5rem', padding: '0.25rem 0.6rem',
                                }}>{s.change}</div>
                                <div style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '999px', fontSize: '0.65rem', padding: '0.1rem 0.5rem' }}>DEMO</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!loading && activeTab === 'learning' && (
                <div style={{ maxWidth: '800px' }}>
                    {lessons.length === 0 ? (
                        <div style={{ color: '#64748b', textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '1rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🧠</div>
                            <p style={{ margin: 0 }}>No lessons yet. Run a campaign — the AI will extract a lesson and store it here automatically.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {lessons.map((l: any) => (
                                <div key={l.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                                        <span style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '999px', fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}>{l.businessType}</span>
                                        <span style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '999px', fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}>{l.language}</span>
                                        <span style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '999px', fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}>{l.region?.join(', ')}</span>
                                    </div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                                        <strong style={{ color: '#cbd5e1' }}>Strategy:</strong> {l.strategy}
                                    </div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                                        <strong style={{ color: '#cbd5e1' }}>Result:</strong> {l.result}
                                    </div>
                                    <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '0.5rem', padding: '0.6rem 0.75rem' }}>
                                        <span style={{ color: '#818cf8', fontSize: '0.8rem' }}>💡 <strong>Lesson:</strong> {l.lesson}</span>
                                    </div>
                                    <div style={{ color: '#475569', fontSize: '0.72rem', marginTop: '0.5rem' }}>
                                        {new Date(l.createdAt).toLocaleString('en-IN')} · Campaign {l.campaignId?.slice(0, 8)}…
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
