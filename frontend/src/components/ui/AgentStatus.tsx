import { motion } from 'framer-motion';
import { PIPELINE_STAGES } from '../../lib/constants';
import type { PipelineStage } from '../../lib/types';

interface AgentStatusProps {
    stages: PipelineStage[];
    currentStage: number;
}

const stageIcons = ['🔍', '🎨', '🛡️', '📡', '🎉'];
const stageDetails = [
    'Analyzing regional trends and demographics...',
    'Generating multilingual content and visuals...',
    'Checking cultural sensitivity across 22 languages...',
    'Scheduling posts for peak engagement times...',
    'Campaign live! Estimated reach: 24K users',
];

export default function AgentStatus({ stages, currentStage }: AgentStatusProps) {
    return (
        <div className="w-full max-w-2xl mx-auto space-y-3">
            {PIPELINE_STAGES.map((pipeline, i) => {
                const stage = stages[i];
                const status = stage?.status || 'waiting';
                const isActive = status === 'running';
                const isDone = status === 'done';
                const isWaiting = status === 'waiting' && currentStage <= i;

                return (
                    <motion.div
                        key={pipeline.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`glass-card p-4 flex items-start gap-4 transition-all duration-500 ${isActive ? 'border-orange-500/60 shadow-orange-900/30 shadow-lg' :
                                isDone ? 'border-green-500/40' : 'border-white/5'
                            }`}
                    >
                        {/* Icon */}
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 transition-all duration-500 ${isActive ? 'animate-pulse-glow' : ''
                                }`}
                            style={{
                                background: isDone ? 'rgba(0,255,136,0.2)' : isActive ? `rgba(255,107,53,0.2)` : 'rgba(255,255,255,0.05)',
                                border: `1px solid ${isDone ? '#00FF88' : isActive ? '#FF6B35' : 'rgba(255,255,255,0.1)'}`,
                            }}
                        >
                            {isDone ? '✅' : stageIcons[i]}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <h4 className={`font-semibold font-poppins ${isActive ? 'text-orange-400' : isDone ? 'text-green-400' : 'text-slate-400'
                                    }`}>
                                    {pipeline.label}
                                </h4>
                                <span className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded">
                                    {pipeline.aws}
                                </span>
                            </div>

                            {(isActive || isDone) && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="text-sm text-slate-400 mt-1"
                                >
                                    {stage?.detail || stageDetails[i]}
                                </motion.p>
                            )}

                            {isActive && (
                                <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{ background: 'linear-gradient(90deg, #FF6B35, #F7C948)' }}
                                        initial={{ width: '0%' }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 1.6, ease: 'linear' }}
                                    />
                                </div>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
