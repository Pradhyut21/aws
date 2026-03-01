import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { ShortcutsHelpTooltip } from '../../hooks/useKeyboardShortcuts.tsx';
import SettingsModal from '../ui/SettingsModal';

const NAV_SECTIONS: { label: string; items: { path: string; icon: string; label: string; shortcut?: string }[] }[] = [
    {
        label: 'Main',
        items: [
            { path: '/dashboard', icon: '🏠', label: 'Dashboard', shortcut: 'D' },
            { path: '/campaign/new', icon: '🚀', label: 'New Campaign', shortcut: 'N' },
        ],
    },
    {
        label: 'Content',
        items: [
            { path: '/templates', icon: '📁', label: 'Templates', shortcut: 'T' },
            { path: '/calendar', icon: '📅', label: 'Calendar', shortcut: 'C' },
        ],
    },
    {
        label: 'Insights',
        items: [
            { path: '/analytics', icon: '📊', label: 'Analytics', shortcut: 'A' },
        ],
    },
];

interface SidebarProps {
    collapsed?: boolean;
}

export default function Sidebar({ collapsed: defaultCollapsed = false }: SidebarProps) {
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(defaultCollapsed);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Settings Modal State
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settingsTab, setSettingsTab] = useState<'account' | 'billing'>('account');

    // User Session Mock
    const [user, setUser] = useState<{ name: string, email: string, avatar: string } | null>(null);
    useEffect(() => {
        try {
            const stored = localStorage.getItem('bm_user');
            if (stored) setUser(JSON.parse(stored));
        } catch { }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('bm_user');
        window.location.href = '/';
    };

    return (
        <motion.aside
            animate={{ width: collapsed ? 64 : 220 }}
            className="fixed left-0 top-0 bottom-0 z-40 flex flex-col py-4 overflow-hidden"
            style={{
                background: 'rgba(13,27,64,0.97)',
                backdropFilter: 'blur(20px)',
                borderRight: '1px solid rgba(255,255,255,0.06)',
            }}
        >
            {/* Logo */}
            <div className="px-4 py-2 mb-4">
                <AnimatePresence>
                    {!collapsed ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-2">
                            <span className="text-xl">🇮🇳</span>
                            <span className="font-black font-poppins gradient-text text-sm">BharatMedia</span>
                        </motion.div>
                    ) : (
                        <span className="text-xl">🇮🇳</span>
                    )}
                </AnimatePresence>
            </div>

            {/* Sectioned Nav */}
            <nav className="flex-1 overflow-y-auto space-y-1 px-2">
                {NAV_SECTIONS.map(section => (
                    <div key={section.label} className="mb-3">
                        {!collapsed && (
                            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest px-3 mb-1">{section.label}</p>
                        )}
                        {section.items.map(item => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive ? 'bg-orange-500/20 text-orange-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                                    <AnimatePresence>
                                        {!collapsed && (
                                            <motion.div
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: 'auto' }}
                                                exit={{ opacity: 0, width: 0 }}
                                                className="flex items-center justify-between flex-1 overflow-hidden"
                                            >
                                                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                                                {item.shortcut && (
                                                    <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/6 text-slate-600 border border-white/8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {item.shortcut}
                                                    </kbd>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    {isActive && !collapsed && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Keyboard shortcuts tooltip */}
            {showShortcuts && !collapsed && (
                <div className="mx-2 mb-2">
                    <ShortcutsHelpTooltip />
                </div>
            )}

            {/* Collapse toggle + shortcuts */}
            <div className="px-2 space-y-1">
                {!collapsed && (
                    <button onClick={() => setShowShortcuts(s => !s)}
                        className="w-full p-2 rounded-xl text-slate-500 hover:text-slate-300 text-xs text-left hover:bg-white/4 transition-all flex items-center gap-2">
                        ⌨️ Keyboard Shortcuts
                    </button>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm"
                >
                    {collapsed ? '→' : '← Collapse'}
                </button>
            </div>

            {/* User Profile / Settings */}
            <div className="mt-2 px-3 pb-2 pt-2 border-t border-white/5 relative">
                {user ? (
                    <>
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${showProfileMenu ? 'bg-white/10' : 'hover:bg-white/5'}`}
                        >
                            <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full bg-slate-800 border border-white/10" />
                            {!collapsed && (
                                <div className="flex-1 text-left min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                                </div>
                            )}
                            {!collapsed && <span className="text-slate-500 text-xs">⚙️</span>}
                        </button>

                        <AnimatePresence>
                            {showProfileMenu && !collapsed && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute bottom-[calc(100%+8px)] left-3 right-3 glass-card py-2 border border-white/10 shadow-xl overflow-hidden"
                                >
                                    <div className="px-3 pb-2 mb-2 border-b border-white/5">
                                        <p className="text-xs font-semibold text-white">{user.name}</p>
                                        <p className="text-[10px] text-slate-400">Pro Plan (Trial)</p>
                                    </div>
                                    <button
                                        onClick={() => { setSettingsTab('account'); setIsSettingsOpen(true); setShowProfileMenu(false); }}
                                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                                    >
                                        <span>🧑‍💻</span> Account Settings
                                    </button>
                                    <button
                                        onClick={() => { setSettingsTab('billing'); setIsSettingsOpen(true); setShowProfileMenu(false); }}
                                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                                    >
                                        <span>💳</span> Billing & Plan
                                    </button>
                                    <div className="h-[1px] bg-white/5 my-1" />
                                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-2">
                                        <span>🚪</span> Log out
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                ) : (
                    <Link to="/login" className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-orange-500 text-white font-semibold text-sm hover:scale-[1.02] transition-transform">
                        <span>👋</span> {!collapsed ? 'Log In' : ''}
                    </Link>
                )}
            </div>

            {/* Settings Modal */}
            {user && (
                <SettingsModal
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    initialTab={settingsTab}
                    user={user}
                />
            )}
        </motion.aside>
    );
}
