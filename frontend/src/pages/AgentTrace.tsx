import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAgentTrace } from '../lib/api';
import Sidebar from '../components/layout/Sidebar';

interface TraceStep {
    toolName: string;
    input: string;
    output: string;
    latencyMs: number;
    status: 'success' | 'error';
    error?: string;
    timestamp: string;
}

const TOOL_META: Record<string, { icon: string; label: string; color: string; bgColor: string }> = {
    research_market:    { icon: '🔍', label: 'Research Agent',    color: '#3b82f6', bgColor: 'rgba(59,130,246,0.12)' },
    creative_swarm:     { icon: '🎨', label: 'Creative Swarm',    color: '#a855f7', bgColor: 'rgba(168,85,247,0.12)' },
    quality_guard:      { icon: '🛡️', label: 'Quality Guard',     color: '#10b981', bgColor: 'rgba(16,185,129,0.12)' },
    distribution_agent: { icon: '📡', label: 'Distribution Agent',color: '#f59e0b', bgColor: 'rgba(245,158,11,0.12)' },
    experiment_engine:  { icon: '🧪', label: 'Experiment Engine', color: '#ec4899', bgColor: 'rgba(236,72,153,0.12)' },
};

function getMeta(toolName: string) {
    return TOOL_META[toolName] ?? { icon: '⚙️', label: toolName, color: '#94a3b8', bgColor: 'rgba(148,163,184,0.08)' };
}

function LatencyBar({ ms, maxMs, color }: { ms: number; maxMs: number; color: string }) {
    const pct = maxMs > 0 ? Math.min(100, (ms / maxMs) * 100) : 0;
    return (
        <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${color}, ${color}99)` }}
                />
            </div>
            <span className="text-xs font-mono flex-shrink-0" style={{ color }}>{ms}ms</span>
        </div>
    );
}

export default function AgentTrace({ campaignId: propCampaignId }: { campaignId?: string }) {
    const navigate = useNavigate();
    const { campaignId: paramId } = useParams<{ campaignId: string }>();
    const resolvedId = propCampaignId || paramId || '';

    const [inputId, setInputId] = useState(resolvedId);
    const [trace, setTrace] = useState<TraceStep[]>([]);
    const [visibleCount, setVisibleCount] = useState(0); // for replay mode
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState<number | null>(null);
    const [isReplaying, setIsReplaying] = useState(false);
    const replayRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchTrace = useCallback(async (id: string) => {
        if (!id.trim()) return;
        setLoading(true); setError(''); setTrace([]); setVisibleCount(0);
        try {
            const data = await getAgentTrace(id.trim());
            setTrace(data);
            setVisibleCount(data.length); // show all by default
        } catch (e: any) {
            setError(e?.response?.data?.error || 'Failed to load trace');
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { if (resolvedId) fetchTrace(resolvedId); }, [resolvedId, fetchTrace]);

    const startReplay = () => {
        if (trace.length === 0) return;
        setIsReplaying(true);
        setVisibleCount(0);
        let i = 0;
        replayRef.current = setInterval(() => {
            i++;
            setVisibleCount(i);
            if (i >= trace.length) {
                clearInterval(replayRef.current!);
                setIsReplaying(false);
            }
        }, 600);
    };

    useEffect(() => () => { if (replayRef.current) clearInterval(replayRef.current); }, []);

    const totalLatency = trace.reduce((s, t) => s + t.latencyMs, 0);
    const maxLatency = Math.max(...trace.map(t => t.latencyMs), 1);
    const successCount = trace.filter(t => t.status === 'success').length;

    const visibleTrace = trace.slice(0, visibleCount);

    return (
        <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg,#070c18 0%,#0f0c1f 50%,#071218 100%)' }}>
            <Sidebar />
            <main className="flex-1 ml-[220px] p-8 max-w-5xl">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <button onClick={() => navigate('/dashboard')}
                            className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/8 hover:bg-white/10">
                            ← Dashboard
                        </button>
                        <div className="h-4 w-px bg-white/10" />
                        <span className="text-slate-500 text-sm font-mono">agent-trace</span>
                    </div>
                    <h1 className="text-3xl font-black text-white mb-1">🔬 Agent Trace</h1>
                    <p className="text-slate-400 text-sm">
                        Every AI decision — tool name, input, output, latency — stored in DynamoDB per campaign.
                    </p>
                </motion.div>

                {/* Search bar */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                    className="flex gap-3 mb-8 max-w-2xl">
                    <input
                        value={inputId}
                        onChange={e => setInputId(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && fetchTrace(inputId)}
                        placeholder="Paste Campaign ID to load trace…"
                        className="flex-1 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-200 border border-white/10 focus:outline-none focus:border-purple-500/50 transition-colors"
                        style={{ background: 'rgba(255,255,255,0.04)' }}
                    />
                    <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => fetchTrace(inputId)}
                        className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
                        style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}
                    >
                        Load Trace
                    </motion.button>
                </motion.div>

                {/* Loading */}
                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex items-center gap-3 text-purple-400 py-12 justify-center">
                        <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                        <span className="font-mono text-sm">Loading agent trace from DynamoDB…</span>
                    </motion.div>
                )}

                {/* Error */}
                {error && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl px-4 py-3 mb-6 text-red-300 text-sm"
                        style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
                        ⚠️ {error}
                    </motion.div>
                )}

                {/* Trace content */}
                {trace.length > 0 && (
                    <>
                        {/* Summary bar */}
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {[
                                { label: 'AGENT STEPS', value: trace.length, color: '#a78bfa' },
                                { label: 'SUCCEEDED', value: successCount, color: '#4ade80' },
                                { label: 'FAILED', value: trace.length - successCount, color: '#f87171' },
                                { label: 'TOTAL LATENCY', value: `${(totalLatency / 1000).toFixed(1)}s`, color: '#f59e0b' },
                            ].map(s => (
                                <div key={s.label} className="rounded-xl px-4 py-3"
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                    <div className="font-black text-2xl" style={{ color: s.color }}>{s.value}</div>
                                    <div className="text-slate-500 text-[11px] font-mono mt-0.5">{s.label}</div>
                                </div>
                            ))}
                        </motion.div>

                        {/* Replay button */}
                        <div className="flex items-center gap-3 mb-6">
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                onClick={startReplay}
                                disabled={isReplaying}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                                style={{
                                    background: isReplaying ? 'rgba(255,255,255,0.04)' : 'rgba(167,139,250,0.12)',
                                    border: '1px solid rgba(167,139,250,0.3)',
                                    color: isReplaying ? '#64748b' : '#a78bfa',
                                }}
                            >
                                {isReplaying ? (
                                    <><div className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" /> Replaying…</>
                                ) : (
                                    <>▶ Replay Trace</>
                                )}
                            </motion.button>
                            {isReplaying && (
                                <span className="text-slate-500 text-xs font-mono">
                                    {visibleCount} / {trace.length} steps
                                </span>
                            )}
                        </div>

                        {/* Timeline */}
                        <div className="relative">
                            {/* Vertical connecting line */}
                            <div className="absolute left-[23px] top-6 bottom-6 w-px"
                                style={{ background: 'linear-gradient(to bottom, rgba(167,139,250,0.4), rgba(167,139,250,0.05))' }} />

                            <div className="space-y-3">
                                <AnimatePresence mode="popLayout">
                                    {visibleTrace.map((step, i) => {
                                        const meta = getMeta(step.toolName);
                                        const isExpanded = expanded === i;
                                        const isLast = i === visibleTrace.length - 1 && isReplaying;

                                        return (
                                            <motion.div
                                                key={`${step.toolName}-${i}`}
                                                layout
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{ duration: 0.35, ease: 'easeOut' }}
                                                className="relative pl-14"
                                            >
                                                {/* Step dot */}
                                                <div className="absolute left-0 top-4 flex items-center justify-center w-[46px] h-[46px]"
                                                    style={{ zIndex: 1 }}>
                                                    <motion.div
                                                        animate={isLast ? {
                                                            boxShadow: [`0 0 0px ${meta.color}`, `0 0 16px ${meta.color}`, `0 0 0px ${meta.color}`]
                                                        } : {}}
                                                        transition={{ repeat: Infinity, duration: 1.2 }}
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0"
                                                        style={{
                                                            background: meta.bgColor,
                                                            border: `2px solid ${step.status === 'error' ? '#f87171' : meta.color}50`,
                                                            boxShadow: isLast ? `0 0 12px ${meta.color}80` : 'none',
                                                        }}
                                                    >
                                                        {step.status === 'error' ? '✗' : meta.icon}
                                                    </motion.div>
                                                </div>

                                                {/* Card */}
                                                <motion.div
                                                    layout
                                                    onClick={() => setExpanded(isExpanded ? null : i)}
                                                    className="rounded-xl p-4 cursor-pointer transition-colors"
                                                    whileHover={{ borderColor: `${meta.color}40` }}
                                                    style={{
                                                        background: isExpanded ? meta.bgColor : 'rgba(255,255,255,0.03)',
                                                        border: `1px solid ${step.status === 'error' ? 'rgba(248,113,113,0.25)' : isExpanded ? `${meta.color}30` : 'rgba(255,255,255,0.07)'}`,
                                                    }}
                                                >
                                                    {/* Header row */}
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-white text-sm font-mono">{step.toolName}</span>
                                                                <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                                                    style={{
                                                                        background: step.status === 'success' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                                                                        color: step.status === 'success' ? '#4ade80' : '#f87171',
                                                                        border: `1px solid ${step.status === 'success' ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`,
                                                                    }}>
                                                                    {step.status === 'success' ? '✓ success' : '✗ error'}
                                                                </span>
                                                            </div>
                                                            <div className="text-slate-500 text-xs mt-0.5" style={{ color: meta.color + 'bb' }}>
                                                                {meta.label} · {new Date(step.timestamp).toLocaleTimeString('en-IN')}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            <span className="text-xs font-mono text-slate-500">{isExpanded ? '▲' : '▼'}</span>
                                                        </div>
                                                    </div>

                                                    {/* Latency bar */}
                                                    <LatencyBar ms={step.latencyMs} maxMs={maxLatency} color={meta.color} />

                                                    {/* Expanded detail */}
                                                    <AnimatePresence>
                                                        {isExpanded && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                transition={{ duration: 0.25 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="mt-4 pt-4 border-t border-white/6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                                    <div>
                                                                        <p className="text-[11px] font-mono font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Input</p>
                                                                        <pre className="text-xs text-slate-300 rounded-lg p-3 overflow-auto max-h-36 font-mono leading-relaxed"
                                                                            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                                            {step.input}
                                                                        </pre>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[11px] font-mono font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Output</p>
                                                                        <pre className="text-xs text-slate-300 rounded-lg p-3 overflow-auto max-h-36 font-mono leading-relaxed"
                                                                            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                                            {step.output}
                                                                        </pre>
                                                                    </div>
                                                                    {step.error && (
                                                                        <div className="lg:col-span-2 rounded-lg p-3 text-xs font-mono text-red-300"
                                                                            style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
                                                                            ⚠️ Error: {step.error}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        </div>
                    </>
                )}

                {/* Empty state */}
                {!loading && trace.length === 0 && !error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                        className="flex flex-col items-center justify-center py-24 text-center"
                        style={{ border: '1px dashed rgba(255,255,255,0.06)', borderRadius: '1.25rem' }}>
                        <div className="text-5xl mb-3">🔬</div>
                        <p className="text-slate-500 text-sm max-w-sm">
                            Enter a Campaign ID above to view the full AI agent decision trace from DynamoDB.
                            Each step shows tool name, input, output and latency.
                        </p>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
