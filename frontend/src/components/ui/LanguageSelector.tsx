import { INDIAN_LANGUAGES } from '../../lib/constants';
import { useState, useRef, useEffect } from 'react';

interface LanguageSelectorProps {
    value: string;
    onChange: (code: string) => void;
}

export default function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef<HTMLDivElement>(null);

    const selected = INDIAN_LANGUAGES.find(l => l.code === value);

    useEffect(() => {
        const handler = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = INDIAN_LANGUAGES.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.nativeName.includes(search)
    );

    return (
        <div ref={ref} className="relative z-50">
            <button
                onClick={() => setOpen(!open)}
                className="w-full glass-card px-4 py-3 flex items-center justify-between text-left hover:border-orange-500/40 transition-all"
            >
                <span className="flex items-center gap-3">
                    <span className="text-orange-400 font-mono text-sm">{selected?.script || 'Script'}</span>
                    <span className="text-white font-medium">{selected?.name || 'Select Language'}</span>
                    <span className="text-slate-400 text-sm">{selected?.nativeName}</span>
                </span>
                <span className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {open && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0A0F1E] border border-orange-500/20 z-50 max-h-72 overflow-hidden rounded-xl shadow-2xl">
                    <div className="p-2 border-b border-white/10">
                        <input
                            type="text"
                            placeholder="Search language..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-transparent px-3 py-2 text-white placeholder-slate-500 outline-none text-sm"
                            autoFocus
                        />
                    </div>
                    <div className="overflow-y-auto max-h-56 pr-1 custom-scrollbar">
                        {filtered.map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => { onChange(lang.code); setOpen(false); setSearch(''); }}
                                className={`w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-orange-500/10 transition-colors ${value === lang.code ? 'bg-orange-500/20' : ''
                                    }`}
                            >
                                <span className="text-orange-400 font-mono text-xs w-12">{lang.code.toUpperCase()}</span>
                                <span className="text-white text-sm font-medium">{lang.name}</span>
                                <span className="text-slate-400 text-sm ml-auto">{lang.nativeName}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
