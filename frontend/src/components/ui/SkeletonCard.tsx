export default function SkeletonCard({ lines = 3, className = '' }: { lines?: number; className?: string }) {
    return (
        <div className={`glass-card p-5 animate-pulse ${className}`}>
            <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-3 bg-white/10 rounded-full w-3/4" />
                    <div className="h-2 bg-white/8 rounded-full w-1/2" />
                </div>
            </div>
            {Array.from({ length: lines }).map((_, i) => (
                <div key={i} className="h-2 bg-white/8 rounded-full mb-2" style={{ width: `${100 - i * 15}%` }} />
            ))}
            <div className="h-6 bg-white/8 rounded-lg mt-4 w-1/3" />
        </div>
    );
}

export function SkeletonRow({ className = '' }: { className?: string }) {
    return (
        <div className={`glass-card p-4 animate-pulse flex items-center gap-4 ${className}`}>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-3 bg-white/10 rounded-full w-1/2" />
                <div className="h-2 bg-white/8 rounded-full w-1/3" />
            </div>
            <div className="h-6 w-16 bg-white/10 rounded-lg flex-shrink-0" />
        </div>
    );
}
