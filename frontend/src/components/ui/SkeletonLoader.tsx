import { motion } from 'framer-motion';

export function SkeletonLoader({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                    className="h-12 bg-slate-800/50 rounded-lg"
                />
            ))}
        </div>
    );
}

export function SkeletonCard() {
    return (
        <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="glass-card p-6 space-y-4"
        >
            <div className="h-6 bg-slate-800/50 rounded w-3/4" />
            <div className="h-4 bg-slate-800/50 rounded w-full" />
            <div className="h-4 bg-slate-800/50 rounded w-5/6" />
            <div className="h-10 bg-slate-800/50 rounded w-1/3 mt-4" />
        </motion.div>
    );
}
