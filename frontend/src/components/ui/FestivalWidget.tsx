import { useState, useEffect } from 'react';
import { UPCOMING_FESTIVALS } from '../../lib/constants';
import { motion } from 'framer-motion';

function getCountdown(dateStr: string) {
    const now = new Date();
    const target = new Date(dateStr);
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return { days: 0, hours: 0, expired: true };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours, expired: false };
}

export default function FestivalWidget({ onCreateCampaign }: { onCreateCampaign?: (festival: string) => void }) {
    const [, forceUpdate] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => forceUpdate(n => n + 1), 60000);
        return () => clearInterval(timer);
    }, []);

    const upcoming = UPCOMING_FESTIVALS
        .map(f => ({ ...f, countdown: getCountdown(f.date) }))
        .filter(f => !f.countdown.expired)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 4);

    return (
        <div className="glass-card p-5">
            <h3 className="font-bold font-poppins gradient-text mb-4 flex items-center gap-2">
                🎪 Upcoming Festivals
            </h3>
            <div className="grid grid-cols-2 gap-3">
                {upcoming.map((festival, i) => (
                    <motion.div
                        key={festival.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="p-3 rounded-xl border cursor-pointer transition-all"
                        style={{
                            borderColor: `${festival.color}30`,
                            background: `${festival.color}08`,
                        }}
                        onClick={() => onCreateCampaign?.(festival.name)}
                    >
                        <div className="text-2xl mb-1">{festival.emoji}</div>
                        <div className="font-semibold text-white text-sm">{festival.name}</div>
                        <div className="text-slate-400 text-xs">{festival.description}</div>
                        <div className="mt-2 flex items-center gap-1">
                            <span className="text-xs font-mono font-bold" style={{ color: festival.color }}>
                                {festival.countdown.days}d {festival.countdown.hours}h
                            </span>
                            <span className="text-slate-500 text-xs">away</span>
                        </div>
                        <button
                            className="mt-2 w-full text-xs py-1 px-2 rounded-lg font-semibold transition-all hover:opacity-90"
                            style={{ background: `${festival.color}30`, color: festival.color }}
                        >
                            Create Campaign →
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
