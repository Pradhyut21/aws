import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Navbar() {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const isDashboard = location.pathname !== '/';

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-6 lg:px-12"
            style={{ background: 'rgba(10,15,30,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
                        style={{ background: 'linear-gradient(135deg, #FF6B35, #F7C948)' }}>
                        🇮🇳
                    </div>
                    <div>
                        <span className="font-black font-poppins text-lg gradient-text">BharatMedia</span>
                        <div className="text-[9px] text-slate-500 font-mono -mt-1 tracking-wider">POWERED BY AWS BEDROCK</div>
                    </div>
                </Link>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-6">
                    {!isDashboard && (
                        <>
                            <a href="#features" className="text-slate-300 hover:text-white text-sm transition-colors">Features</a>
                            <a href="#pricing" className="text-slate-300 hover:text-white text-sm transition-colors">Pricing</a>
                            <a href="#testimonials" className="text-slate-300 hover:text-white text-sm transition-colors">Stories</a>
                        </>
                    )}
                    {isDashboard && (
                        <>
                            <Link to="/dashboard" className="text-slate-300 hover:text-white text-sm transition-colors">Dashboard</Link>
                            <Link to="/campaign/new" className="text-slate-300 hover:text-white text-sm transition-colors">New Campaign</Link>
                            <Link to="/analytics" className="text-slate-300 hover:text-white text-sm transition-colors">Analytics</Link>
                        </>
                    )}
                    <Link to="/campaign/new" className="btn-primary py-2 px-4 text-sm">
                        🚀 Start Free
                    </Link>
                </div>

                {/* Mobile menu */}
                <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
            </div>

            {menuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden mt-4 flex flex-col gap-3 px-2"
                >
                    <Link to="/dashboard" className="text-slate-300 py-2 border-b border-white/10" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                    <Link to="/campaign/new" className="text-slate-300 py-2 border-b border-white/10" onClick={() => setMenuOpen(false)}>New Campaign</Link>
                    <Link to="/analytics" className="text-slate-300 py-2 border-b border-white/10" onClick={() => setMenuOpen(false)}>Analytics</Link>
                    <Link to="/campaign/new" className="btn-primary text-center" onClick={() => setMenuOpen(false)}>🚀 Start Free</Link>
                </motion.div>
            )}
        </nav>
    );
}
