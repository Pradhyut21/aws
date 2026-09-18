import { motion } from 'framer-motion';

interface BharatScoreProps {
    total: number;
    culturalFit: number;
    seoScore: number;
    engagementPotential: number;
    platformOptimization: number;
}

function CircleProgress({ value, max = 25, label, color }: {
    value: number; max?: number; label: string; color: string;
}) {
    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    const progress = (value / max) * circumference;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-20 h-20">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                    <motion.circle
                        cx="40" cy="40" r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: circumference - progress }}
                        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold font-poppins" style={{ color }}>{value}</span>
                </div>
            </div>
            <span className="text-xs text-slate-400 text-center leading-tight">{label}</span>
        </div>
    );
}

export default function BharatScore({ total, culturalFit, seoScore, engagementPotential, platformOptimization }: BharatScoreProps) {
    return (
        <div className="glass-card p-6 text-center">
            <h3 className="text-lg font-bold font-poppins gradient-text mb-2">BharatScore™</h3>
            <p className="text-slate-400 text-sm mb-6">AI-powered content quality rating</p>

            {/* Main score ring */}
            <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                        <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                        <motion.circle
                            cx="64" cy="64" r="56"
                            fill="none"
                            stroke="url(#scoreGrad)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 56}
                            initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - total / 100) }}
                            transition={{ duration: 2, ease: 'easeOut' }}
                        />
                        <defs>
                            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#FF6B35" />
                                <stop offset="100%" stopColor="#F7C948" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span
                            className="text-4xl font-black font-poppins gradient-text"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            {total}
                        </motion.span>
                        <span className="text-slate-500 text-xs">/100</span>
                    </div>
                </div>
            </div>

            {/* Sub-scores */}
            <div className="grid grid-cols-4 gap-2">
                <CircleProgress value={culturalFit} label="Cultural Fit" color="#FF6B35" />
                <CircleProgress value={seoScore} label="SEO Score" color="#F7C948" />
                <CircleProgress value={engagementPotential} label="Engagement" color="#00D4FF" />
                <CircleProgress value={platformOptimization} label="Platform" color="#00FF88" />
            </div>

            <div className="mt-4 p-3 rounded-lg bg-green-400/10 border border-green-400/20">
                <p className="text-green-400 text-sm font-medium">
                    🎯 Excellent! Your content is highly optimized for Indian audiences.
                </p>
            </div>
        </div>
    );
}
