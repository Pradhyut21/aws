/**
 * AgentPipelineSVG — Lightweight 2D pipeline visualiser
 *
 * Inspired by CaseGraph's pure-SVG node-status graph.
 * No Three.js/WebGL required — works on mobile and low-end devices.
 *
 * Features:
 * - Animated pulse ring on running stage
 * - Green/amber/red fill on done/running/error
 * - Per-stage latency label from WebSocket events
 * - Abort button appears while pipeline is running
 * - Content hash badge on completion (GatedCart integrity proof)
 */

import type { PipelineStage } from '../../lib/types';

interface Props {
    stages: PipelineStage[];
    isComplete: boolean;
    isAborted: boolean;
    contentHash?: string | null;
    onAbort?: () => void;
}

const STAGE_CONFIG = [
    { icon: '🔍', label: 'Research', color: '#3b82f6' },
    { icon: '🎨', label: 'Creative', color: '#8b5cf6' },
    { icon: '🛡️', label: 'Quality', color: '#f59e0b' },
    { icon: '📡', label: 'Distribute', color: '#10b981' },
    { icon: '✅', label: 'Done', color: '#4ade80' },
];

const NODE_R = 28;
const NODE_CY = 60;
const SPACING = 120;
const SVG_W = SPACING * (STAGE_CONFIG.length - 1) + NODE_R * 2 + 40;
const SVG_H = 140;

function nodeColor(status: string, cfg: { color: string }) {
    if (status === 'done') return cfg.color;
    if (status === 'running') return cfg.color;
    if (status === 'error') return '#f87171';
    return 'rgba(255,255,255,0.08)';
}

export default function AgentPipelineSVG({
    stages,
    isComplete,
    isAborted,
    contentHash,
    onAbort,
}: Props) {
    const anyRunning = stages.some(s => s.status === 'running');

    return (
        <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            {/* SVG graph */}
            <svg
                viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                width="100%"
                style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto', overflow: 'visible' }}
            >
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Connecting lines */}
                {STAGE_CONFIG.map((_, i) => {
                    if (i === STAGE_CONFIG.length - 1) return null;
                    const x1 = 20 + i * SPACING + NODE_R;
                    const x2 = 20 + (i + 1) * SPACING - NODE_R;
                    const prevDone = stages[i]?.status === 'done';
                    return (
                        <line
                            key={i}
                            x1={x1}
                            y1={NODE_CY}
                            x2={x2}
                            y2={NODE_CY}
                            stroke={prevDone ? STAGE_CONFIG[i].color : 'rgba(255,255,255,0.1)'}
                            strokeWidth={prevDone ? 2 : 1}
                            strokeDasharray={prevDone ? '0' : '4 4'}
                        />
                    );
                })}

                {/* Nodes */}
                {STAGE_CONFIG.map((cfg, i) => {
                    const stage = stages[i];
                    const status = stage?.status ?? 'waiting';
                    const cx = 20 + i * SPACING + NODE_R;
                    const fill = nodeColor(status, cfg);
                    const isRunning = status === 'running';

                    return (
                        <g key={i}>
                            {/* Pulse ring (CaseGraph-inspired) */}
                            {isRunning && (
                                <>
                                    <circle
                                        cx={cx}
                                        cy={NODE_CY}
                                        r={NODE_R + 8}
                                        fill="none"
                                        stroke={cfg.color}
                                        strokeWidth={1.5}
                                        opacity={0.4}
                                        style={{ animation: 'pulse-ring 1.4s ease-out infinite' }}
                                    />
                                    <circle
                                        cx={cx}
                                        cy={NODE_CY}
                                        r={NODE_R + 14}
                                        fill="none"
                                        stroke={cfg.color}
                                        strokeWidth={1}
                                        opacity={0.2}
                                        style={{
                                            animation: 'pulse-ring 1.4s ease-out infinite 0.3s',
                                        }}
                                    />
                                </>
                            )}

                            {/* Node circle */}
                            <circle
                                cx={cx}
                                cy={NODE_CY}
                                r={NODE_R}
                                fill={fill}
                                opacity={status === 'waiting' ? 0.5 : 1}
                                filter={isRunning ? 'url(#glow)' : undefined}
                                style={{ transition: 'fill 0.4s ease' }}
                            />

                            {/* Icon */}
                            <text
                                x={cx}
                                y={NODE_CY + 1}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={18}
                                style={{ userSelect: 'none' }}
                            >
                                {cfg.icon}
                            </text>

                            {/* Label below */}
                            <text
                                x={cx}
                                y={NODE_CY + NODE_R + 14}
                                textAnchor="middle"
                                fontSize={10}
                                fill={status === 'waiting' ? '#475569' : '#94a3b8'}
                                fontFamily="Inter, system-ui, sans-serif"
                            >
                                {cfg.label}
                            </text>

                            {/* Status badge */}
                            {status !== 'waiting' && (
                                <text
                                    x={cx}
                                    y={NODE_CY + NODE_R + 26}
                                    textAnchor="middle"
                                    fontSize={9}
                                    fill={
                                        status === 'done'
                                            ? '#4ade80'
                                            : status === 'error'
                                              ? '#f87171'
                                              : cfg.color
                                    }
                                    fontFamily="Inter, system-ui, sans-serif"
                                >
                                    {status === 'running' ? '…' : status === 'done' ? '✓' : '✗'}
                                </text>
                            )}

                            {/* Detail text */}
                            {stage?.detail && status === 'running' && (
                                <foreignObject
                                    x={cx - 55}
                                    y={NODE_CY - NODE_R - 30}
                                    width={110}
                                    height={28}
                                >
                                    <div
                                        style={{
                                            color: '#94a3b8',
                                            fontSize: '0.6rem',
                                            textAlign: 'center',
                                            background: 'rgba(0,0,0,0.6)',
                                            borderRadius: 4,
                                            padding: '2px 4px',
                                            lineHeight: 1.3,
                                        }}
                                    >
                                        {String(stage.detail).slice(0, 40)}
                                    </div>
                                </foreignObject>
                            )}
                        </g>
                    );
                })}
            </svg>

            {/* CSS keyframe injected inline */}
            <style>{`
                @keyframes pulse-ring {
                    0%   { transform-origin: center; transform: scale(1);   opacity: 0.4; }
                    100% { transform-origin: center; transform: scale(1.25); opacity: 0; }
                }
            `}</style>

            {/* Abort button (GatedCart emergency stop) */}
            {anyRunning && !isComplete && !isAborted && onAbort && (
                <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                    <button
                        onClick={onAbort}
                        style={{
                            background: 'rgba(248,113,113,0.15)',
                            border: '1px solid rgba(248,113,113,0.4)',
                            color: '#f87171',
                            borderRadius: '0.5rem',
                            padding: '0.35rem 1rem',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            transition: 'all 0.15s',
                        }}
                    >
                        ⬛ Abort Campaign
                    </button>
                </div>
            )}

            {/* Aborted state */}
            {isAborted && (
                <div
                    style={{
                        textAlign: 'center',
                        marginTop: '0.5rem',
                        color: '#f87171',
                        fontSize: '0.78rem',
                    }}
                >
                    ⬛ Campaign aborted
                </div>
            )}

            {/* Content hash badge (GatedCart integrity proof) */}
            {isComplete && contentHash && (
                <div
                    style={{
                        marginTop: '0.75rem',
                        textAlign: 'center',
                        background: 'rgba(74,222,128,0.06)',
                        border: '1px solid rgba(74,222,128,0.15)',
                        borderRadius: '0.5rem',
                        padding: '0.4rem 0.75rem',
                    }}
                >
                    <div
                        style={{
                            color: '#4ade80',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            marginBottom: '0.1rem',
                        }}
                    >
                        🔒 Content Integrity Hash
                    </div>
                    <div
                        style={{
                            color: '#64748b',
                            fontFamily: 'monospace',
                            fontSize: '0.65rem',
                            wordBreak: 'break-all',
                        }}
                    >
                        SHA-256: {contentHash}
                    </div>
                </div>
            )}
        </div>
    );
}
