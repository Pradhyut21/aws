import { useEffect, useCallback } from 'react';

interface Shortcut {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    description: string;
    handler: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
    const handleKey = useCallback((e: KeyboardEvent) => {
        // Don't fire when typing in inputs/textareas
        const tag = (e.target as HTMLElement).tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

        for (const sc of shortcuts) {
            const ctrlMatch = sc.ctrl ? (e.ctrlKey || e.metaKey) : true;
            const shiftMatch = sc.shift ? e.shiftKey : true;
            const keyMatch = e.key.toLowerCase() === sc.key.toLowerCase();

            if (ctrlMatch && shiftMatch && keyMatch) {
                if (sc.ctrl) e.preventDefault();
                sc.handler();
                return;
            }
        }
    }, [shortcuts]);

    useEffect(() => {
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [handleKey]);
}

// Global shortcuts panel component — render anywhere
export function ShortcutsHelpTooltip() {
    const shortcuts = [
        { keys: 'Ctrl + Enter', desc: 'Submit campaign form' },
        { keys: '← / →', desc: 'Navigate pipeline slides' },
        { keys: 'Esc', desc: 'Close modal / dropdown' },
        { keys: 'N', desc: 'New campaign' },
        { keys: 'D', desc: 'Go to dashboard' },
        { keys: 'A', desc: 'Go to analytics' },
    ];

    return (
        <div className= "p-4 rounded-xl glass-card max-w-xs" >
        <h4 className="font-bold text-white text-sm font-poppins mb-3 flex items-center gap-2" >
        ⌨️ Keyboard Shortcuts
        </h4>
        < div className = "space-y-2" >
        {
            shortcuts.map(s => (
                <div key= { s.keys } className = "flex justify-between items-center" >
                <span className="text-slate-400 text-xs" > { s.desc } </span>
            < kbd className = "px-2 py-0.5 rounded text-[10px] font-mono text-cyan-400 bg-cyan-400/10 border border-cyan-400/20" >
            { s.keys }
            </kbd>
            </div>
            ))
        }
            </div>
            </div>
  );
}
