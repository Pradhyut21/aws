import { motion } from 'framer-motion';

interface TestimonialProps {
    name: string;
    business: string;
    city: string;
    language: string;
    quote: string;
    quoteEn: string;
    rating: number;
    avatar: string;
}

const AVATAR_COLORS: Record<string, { bg: string; text: string }> = {
    meena: { bg: '#FF6B35', text: '#fff' },
    arjun: { bg: '#F7C948', text: '#0A0F1E' },
    grace: { bg: '#00D4FF', text: '#0A0F1E' },
};

export default function TestimonialCard({ name, business, city, language, quote, quoteEn, rating, avatar }: TestimonialProps) {
    const colors = AVATAR_COLORS[avatar] || { bg: '#FF6B35', text: '#fff' };

    return (
        <motion.div
            className="glass-card p-6 feature-card"
            whileHover={{ y: -4, scale: 1.02 }}
        >
            {/* Stars */}
            <div className="flex gap-1 mb-4">
                {Array(rating).fill(0).map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                ))}
            </div>

            {/* Quote */}
            <blockquote className="text-slate-200 text-sm leading-relaxed mb-2">"{quote}"</blockquote>
            <p className="text-slate-500 text-xs italic mb-4">"{quoteEn}"</p>

            {/* Author */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{ background: colors.bg, color: colors.text }}
                >
                    {name[0]}
                </div>
                <div>
                    <p className="text-white font-semibold text-sm">{name}</p>
                    <p className="text-slate-400 text-xs">{business} · {city}</p>
                    <p className="text-orange-400/70 text-xs">Speaks {language}</p>
                </div>
            </div>
        </motion.div>
    );
}
