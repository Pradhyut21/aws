import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Signup() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, 800));

        // Setup a mock local session
        localStorage.setItem('bm_user', JSON.stringify({
            name: name || email.split('@')[0],
            email: email,
            avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${email}`
        }));

        setLoading(false);
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6 relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-yellow-500/10 blur-[120px] pointer-events-none" />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-4 shadow-xl">🇮🇳</div>
                    <h1 className="text-3xl font-black font-poppins gradient-text mb-2">Create Account</h1>
                    <p className="text-slate-400 text-sm">Start generating campaigns in seconds</p>
                </div>

                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-orange-500/50 transition-all font-medium"
                                placeholder="Raju Bhai" required />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-orange-500/50 transition-all font-medium"
                                placeholder="you@company.com" required />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-orange-500/50 transition-all font-medium"
                                placeholder="••••••••" required />
                        </div>

                        <button type="submit" disabled={loading} className="w-full btn-primary py-3.5 mt-2 rounded-xl text-sm font-bold shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 disabled:opacity-70">
                            {loading ? 'Creating...' : 'Create Account'}
                        </button>
                    </form>
                    <div className="mt-6 pt-6 border-t border-white/5 text-center">
                        <p className="text-slate-400 text-sm">Already have an account? <Link to="/login" className="text-orange-400 hover:text-orange-300 font-bold transition-colors">Sign in</Link></p>
                    </div>
                </div>

                <div className="mt-8 text-center"><Link to="/" className="text-slate-500 hover:text-white text-sm font-medium transition-colors">← Back to home</Link></div>
            </motion.div>
        </div>
    );
}
