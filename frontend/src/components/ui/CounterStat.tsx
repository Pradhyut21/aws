import { useScrollCounter } from '../../hooks/useScrollCounter';

interface CounterStatProps {
    value: number;
    suffix?: string;
    prefix?: string;
    label: string;
    icon?: string;
}

export default function CounterStat({ value, suffix = '', prefix = '', label, icon }: CounterStatProps) {
    const { count, ref } = useScrollCounter(value);

    const formatCount = (n: number) => {
        if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
        if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
        return n.toString();
    };

    return (
        <div ref={ref} className="flex flex-col items-center gap-1 text-center">
            {icon && <span className="text-3xl">{icon}</span>}
            <div className="text-4xl md:text-5xl font-black font-poppins gradient-text">
                {prefix}{formatCount(count)}{suffix}
            </div>
            <div className="text-slate-400 text-sm font-medium">{label}</div>
        </div>
    );
}
