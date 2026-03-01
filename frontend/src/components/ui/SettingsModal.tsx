import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: 'account' | 'billing';
    user: { name: string; email: string; avatar: string };
}

export default function SettingsModal({ isOpen, onClose, initialTab = 'account', user }: SettingsModalProps) {
    const [activeTab, setActiveTab] = useState<'account' | 'billing'>(initialTab);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-[#0a1128] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex"
                >
                    {/* Sidebar */}
                    <div className="w-1/3 border-r border-white/5 bg-white/5 p-4 flex flex-col">
                        <h3 className="text-white font-bold font-poppins mb-4 px-2">Settings</h3>

                        <div className="space-y-1">
                            <button
                                onClick={() => setActiveTab('account')}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-1 focus:ring-white/20 ${activeTab === 'account' ? 'bg-orange-500/20 text-orange-400 font-semibold' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                            >
                                🧑‍💻 Account Details
                            </button>
                            <button
                                onClick={() => setActiveTab('billing')}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-1 focus:ring-white/20 ${activeTab === 'billing' ? 'bg-orange-500/20 text-orange-400 font-semibold' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                            >
                                💳 Billing & Plan
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="w-2/3 p-6 max-h-[70vh] overflow-y-auto">
                        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">✕</button>

                        {activeTab === 'account' && (
                            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div>
                                    <h4 className="text-lg font-bold text-white mb-1">Account Profile</h4>
                                    <p className="text-sm text-slate-400">Manage your basic profile information.</p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <img src={user.avatar} alt="Avatar" className="w-16 h-16 rounded-full border border-white/10 bg-slate-800" />
                                    <button className="btn-outline text-xs py-1.5 px-3">Upload New</button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                                        <input type="text" defaultValue={user.name} className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-orange-500/50 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                                        <input type="email" defaultValue={user.email} disabled className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-400 text-sm opacity-70 cursor-not-allowed" />
                                        <p className="text-[10px] text-slate-500 mt-1">Contact support to change your email.</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5">
                                    <button className="btn-primary text-sm py-2 px-4 shadow-sm" onClick={onClose}>Save Changes</button>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'billing' && (
                            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div>
                                    <h4 className="text-lg font-bold text-white mb-1">Billing & Subscription</h4>
                                    <p className="text-sm text-slate-400">View your active plan and payment history.</p>
                                </div>

                                <div className="p-4 rounded-xl border border-orange-500/20 bg-orange-500/5 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="inline-flex items-center gap-2 mb-1">
                                                <span className="text-orange-400 font-bold font-poppins">Pro Plan</span>
                                                <span className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-full">Trial</span>
                                            </div>
                                            <p className="text-xs text-slate-400">Renews on Mar 26, 2026 for ₹99/mo.</p>
                                        </div>
                                        <button className="btn-primary text-xs py-1.5 px-3">Upgrade Plan</button>
                                    </div>

                                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-2">
                                        <div className="h-full bg-orange-500 w-[15%]" />
                                    </div>
                                    <p className="text-[10px] text-slate-400 text-right">3 of 20 days remaining in trial</p>
                                </div>

                                <div>
                                    <h5 className="text-sm font-semibold text-white mb-3">Payment Method</h5>
                                    <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-6 bg-slate-800 rounded shadow flex items-center justify-center text-[10px] font-bold text-white border border-white/20">VISA</div>
                                            <span className="text-slate-300 text-sm">•••• 4242</span>
                                        </div>
                                        <button className="text-xs text-slate-400 hover:text-white transition-colors focus:outline-none">Update</button>
                                    </div>
                                </div>

                                <div>
                                    <h5 className="text-sm font-semibold text-white mb-3">Recent Invoices</h5>
                                    <div className="text-center py-6 px-4 border border-white/5 border-dashed rounded-lg">
                                        <p className="text-slate-500 text-xs">No invoices yet. You are currently on a free trial.</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
