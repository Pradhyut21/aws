import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect } from 'react';

interface PricingCardProps {
    tier: string;
    price: string;
    period?: string;
    features: string[];
    cta: string;
    highlighted?: boolean;
    emoji: string;
    badge?: string;
}

export default function PricingCard({ tier, price, period, features, cta, highlighted, emoji, badge }: PricingCardProps) {
    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);
    const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 20 });
    const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 20 });

    const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        rotateX.set(-(y - centerY) / 15);
        rotateY.set((x - centerX) / 15);
    };

    const handleLeave = () => { rotateX.set(0); rotateY.set(0); };

    return (
        <motion.div
            style={{ rotateX: springRotateX, rotateY: springRotateY, transformPerspective: 1000 }}
            onMouseMove={handleMouse}
            onMouseLeave={handleLeave}
            whileHover={{ y: -8 }}
            className={`relative glass-card p-6 flex flex-col cursor-default transition-all duration-300 ${highlighted ? 'border-orange-500/50 shadow-2xl shadow-orange-900/30' : ''
                }`}
        >
            {badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full text-xs font-bold font-poppins text-black animate-pulse-glow"
                        style={{ background: 'linear-gradient(135deg, #FF6B35, #F7C948)' }}>
                        {badge}
                    </span>
                </div>
            )}

            {highlighted && (
                <div className="absolute inset-0 rounded-2xl opacity-5"
                    style={{ background: 'linear-gradient(135deg, #FF6B35, #F7C948)' }} />
            )}

            <div className="text-4xl mb-3">{emoji}</div>
            <h3 className="text-xl font-bold font-poppins text-white mb-1">{tier}</h3>
            <div className="flex items-end gap-1 mb-1">
                <span className={`text-4xl font-black font-poppins ${highlighted ? 'gradient-text' : 'text-white'}`}>
                    {price}
                </span>
                {period && <span className="text-slate-400 text-sm mb-1">/{period}</span>}
            </div>

            <ul className="mt-4 mb-6 space-y-2 flex-1">
                {features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                        <span className="text-green-400 flex-shrink-0">✓</span> {f}
                    </li>
                ))}
            </ul>

            <button className={highlighted ? 'btn-primary w-full' : 'btn-outline w-full'}>
                {cta}
            </button>
        </motion.div>
    );
}
