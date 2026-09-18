import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, 800));

        if (!email || !password) {
            setError('Please enter both email and password.');
            setLoading(false);
            return;
        }

        // Setup a mock local session
        localStorage.setItem('bm_user', JSON.stringify({
            name: email.split('@')[0],
            email: email,
            avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${email}`
        }));

        setLoading(false);
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-yellow-500/10 blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-4 shadow-xl">
                        🇮🇳
                    </div>
                    <h1 className="text-3xl font-black font-poppins gradient-text mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-slate-400 text-sm">Sign in to your BharatMedia account</p>
                </div>

                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm flex items-center gap-2">
                                <span>⚠️</span> {error}
                            </motion.div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all font-medium"
                                placeholder="you@company.com"
                                required
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Password
                                </label>
                                <a href="#" className="text-xs text-orange-400 hover:text-orange-300 font-medium">Forgot?</a>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all font-medium"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3.5 mt-2 rounded-xl text-sm font-bold shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In to Dashboard'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/5 text-center">
                        <p className="text-slate-400 text-sm">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-orange-400 hover:text-orange-300 font-bold transition-colors">
                                Sign up for free
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link to="/" className="text-slate-500 hover:text-white text-sm font-medium transition-colors">
                        ← Back to home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
