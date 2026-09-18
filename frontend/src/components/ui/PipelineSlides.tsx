import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Slide {
    id: number;
    icon: string;
    stage: string;
    aws: string;
    color: string;
    title: string;
    description: string;
    details: string[];
    outputBadge: string;
}

const SLIDES: Slide[] = [
    {
        id: 1,
        icon: '🎙️',
        stage: 'INPUT',
        aws: 'Nova Sonic',
        color: '#00D4FF',
        title: 'Speak or Type — Any Language',
        description: 'Your journey starts with a simple idea. Voice it out in Hindi, Tamil, Bhojpuri, or any of 22 Indian languages.',
        details: [
            'Voice input transcribed by Nova Sonic',
            'Auto language detection from Unicode script',
            'Hinglish and code-mixed support',
            '22 official Indian languages + dialects',
        ],
        outputBadge: '🔊 Idea Captured',
    },
    {
        id: 2,
        icon: '🔍',
        stage: 'RESEARCH',
        aws: 'Nova Pro',
        color: '#A855F7',
        title: 'Research Agent Analyzes Your Market',
        description: 'Nova Pro dives into hyperlocal trends, competitor content, festival calendars, and optimal demographics for your region.',
        details: [
            'Regional trend analysis (state-level)',
            'Peak posting time recommendations',
            'Competitor content benchmarking',
            'Cultural context mapping per language',
        ],
        outputBadge: '📊 Market Report Ready',
    },
    {
        id: 3,
        icon: '🎨',
        stage: 'CREATE',
        aws: 'Nova Omni + Nova Reel',
        color: '#FF6B35',
        title: 'Creative Swarm Builds Your Campaign',
        description: 'A swarm of AI agents generates captions, images, 15-second reels with local music, and SEO-optimized keywords — all in your native language.',
        details: [
            'Native-script captions (not romanized)',
            '4 AI-generated images per campaign',
            '15-second video reel with script',
            'SEO keywords in regional languages',
        ],
        outputBadge: '🖼️ Content Pack Generated',
    },
    {
        id: 4,
        icon: '🛡️',
        stage: 'REVIEW',
        aws: 'Bedrock Guardrails',
        color: '#F7C948',
        title: 'Quality Guard Checks Every Word',
        description: 'Bedrock Guardrails reviews all generated content for cultural sensitivity, religious appropriateness, and brand safety across 22 languages.',
        details: [
            'Cultural sensitivity validation',
            'Religious & regional appropriateness',
            'BharatScore™ out of 100',
            'Auto-fix suggestions on flag',
        ],
        outputBadge: '✅ 87/100 BharatScore',
    },
    {
        id: 5,
        icon: '📡',
        stage: 'DISTRIBUTE',
        aws: 'Nova Sonic + DynamoDB',
        color: '#00FF88',
        title: 'Distribution Agent Publishes Everywhere',
        description: 'Your campaign is scheduled at peak engagement times across 15 platforms. Regional influencers are matched. Analytics start tracking.',
        details: [
            'AI-optimal posting times per platform',
            '15 social platforms supported',
            'Micro-influencer suggestions in your region',
            'Real-time analytics tracking starts',
        ],
        outputBadge: '🚀 Published to 4 Platforms',
    },
];

interface PipelineSlidesProps {
    autoPlay?: boolean;
    interval?: number;
}

export default function PipelineSlides({ autoPlay = true, interval = 3500 }: PipelineSlidesProps) {
    const [active, setActive] = useState(0);
    const [direction, setDirection] = useState(1);
    const [paused, setPaused] = useState(false);

    const goTo = useCallback((idx: number) => {
        setDirection(idx > active ? 1 : -1);
        setActive(idx);
    }, [active]);

    const next = useCallback(() => {
        setDirection(1);
        setActive(p => (p + 1) % SLIDES.length);
    }, []);

    useEffect(() => {
        if (!autoPlay || paused) return;
        const t = setInterval(next, interval);
        return () => clearInterval(t);
    }, [autoPlay, paused, next, interval]);

    const slide = SLIDES[active];

    const variants = {
        enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0, scale: 0.95 }),
        center: { x: 0, opacity: 1, scale: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0, scale: 0.95 }),
    };

    return (
        <div
            className="relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {/* Step indicators */}
            <div className="flex items-center justify-center gap-0 mb-8">
                {SLIDES.map((s, i) => (
                    <div key={s.id} className="flex items-center">
                        <button
                            onClick={() => goTo(i)}
                            className="relative flex flex-col items-center gap-1 transition-all duration-300"
                        >
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all duration-500 font-bold"
                                style={{
                                    borderColor: i <= active ? s.color : 'rgba(255,255,255,0.1)',
                                    background: i === active ? `${s.color}25` : i < active ? `${s.color}15` : 'transparent',
                                    boxShadow: i === active ? `0 0 20px ${s.color}60` : 'none',
                                }}
                            >
                                {i < active ? '✓' : s.icon}
                            </div>
                            <span className="text-[10px] font-mono hidden sm:block"
                                style={{ color: i === active ? s.color : 'rgba(148,163,184,0.6)' }}>
                                {s.stage}
                            </span>
                        </button>
                        {i < SLIDES.length - 1 && (
                            <div className="w-8 sm:w-16 h-[2px] mx-1 rounded-full transition-all duration-700"
                                style={{ background: i < active ? slide.color : 'rgba(255,255,255,0.1)' }} />
                        )}
                    </div>
                ))}
            </div>

            {/* Slide card */}
            <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: 320 }}>
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={slide.id}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="glass-card p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
                        style={{ borderColor: `${slide.color}30` }}
                    >
                        {/* Left: Text */}
                        <div>
                            {/* Stage badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-mono font-semibold"
                                style={{ background: `${slide.color}15`, color: slide.color, border: `1px solid ${slide.color}40` }}>
                                <span>{slide.icon}</span> {slide.stage} · {slide.aws}
                            </div>

                            <h3 className="text-2xl md:text-3xl font-black font-poppins text-white mb-3 leading-tight">
                                {slide.title}
                            </h3>
                            <p className="text-slate-400 leading-relaxed mb-5">{slide.description}</p>

                            {/* Details */}
                            <ul className="space-y-2">
                                {slide.details.map((d, i) => (
                                    <motion.li
                                        key={d}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.08 }}
                                        className="flex items-center gap-2 text-sm text-slate-300"
                                    >
                                        <span className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-xs"
                                            style={{ background: `${slide.color}20`, color: slide.color }}>✓</span>
                                        {d}
                                    </motion.li>
                                ))}
                            </ul>
                        </div>

                        {/* Right: Visual */}
                        <div className="flex flex-col items-center justify-center gap-4">
                            {/* Giant icon with glow */}
                            <motion.div
                                animate={{
                                    y: [0, -12, 0],
                                    filter: [
                                        `drop-shadow(0 0 20px ${slide.color}80)`,
                                        `drop-shadow(0 0 50px ${slide.color}ff)`,
                                        `drop-shadow(0 0 20px ${slide.color}80)`,
                                    ],
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                className="text-8xl md:text-9xl"
                            >
                                {slide.icon}
                            </motion.div>

                            {/* Output badge */}
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold font-poppins"
                                style={{
                                    background: `linear-gradient(135deg, ${slide.color}30, ${slide.color}15)`,
                                    border: `1px solid ${slide.color}50`,
                                    color: slide.color,
                                    boxShadow: `0 0 20px ${slide.color}30`,
                                }}
                            >
                                {slide.outputBadge}
                            </motion.div>

                            {/* AWS badge */}
                            <div className="text-xs font-mono text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-3 py-1 rounded-lg">
                                Powered by {slide.aws}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation arrows */}
            <div className="flex justify-center gap-4 mt-6">
                <button onClick={() => goTo((active - 1 + SLIDES.length) % SLIDES.length)}
                    className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-slate-400 hover:text-white transition-all hover:border-orange-500/40">
                    ←
                </button>
                <div className="flex gap-2 items-center">
                    {SLIDES.map((_, i) => (
                        <button key={i} onClick={() => goTo(i)}
                            className="rounded-full transition-all duration-300"
                            style={{
                                width: i === active ? 20 : 8, height: 8,
                                background: i === active ? slide.color : 'rgba(255,255,255,0.2)',
                            }} />
                    ))}
                </div>
                <button onClick={() => goTo((active + 1) % SLIDES.length)}
                    className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-slate-400 hover:text-white transition-all hover:border-orange-500/40">
                    →
                </button>
            </div>
        </div>
    );
}
