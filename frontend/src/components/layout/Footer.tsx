export default function Footer() {
    return (
        <footer className="relative pt-16 pb-8 px-6 lg:px-12 overflow-hidden"
            style={{ background: 'rgba(7,10,22,0.95)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>

            {/* India map outline SVG (simplified) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <svg width="400" height="400" viewBox="0 0 400 400" fill="none">
                    <path d="M200 40 C230 50 280 60 310 80 C340 100 360 130 370 160 C380 190 375 230 360 260 C345 290 320 310 295 340 C270 370 240 380 200 385 C160 380 130 370 105 340 C80 310 55 290 40 260 C25 230 20 190 30 160 C40 130 60 100 90 80 C120 60 170 50 200 40Z"
                        stroke="#FF6B35" strokeWidth="2" fill="none" />
                </svg>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Top row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">🇮🇳</span>
                            <span className="font-black font-poppins text-xl gradient-text">BharatMedia</span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            India's first Agentic Content Orchestrator. Speak in your language. Publish to the world.
                        </p>
                        <div className="india-stripe mt-4 rounded-full" />
                    </div>

                    <div>
                        <h4 className="font-semibold font-poppins text-white mb-4">Product</h4>
                        <ul className="space-y-2 text-slate-400 text-sm">
                            <li className="hover:text-white cursor-pointer">Voice-to-Campaign</li>
                            <li className="hover:text-white cursor-pointer">22 Language Support</li>
                            <li className="hover:text-white cursor-pointer">Festival Campaigns</li>
                            <li className="hover:text-white cursor-pointer">Analytics Dashboard</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold font-poppins text-white mb-4">Powered by AWS</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {['Nova Pro', 'Nova Reel', 'Nova Sonic', 'Bedrock', 'Lambda', 'DynamoDB', 'S3', 'Cognito'].map(service => (
                                <span key={service}
                                    className="text-xs px-2 py-1 rounded font-mono text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 text-center">
                                    {service}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-slate-500 text-sm text-center md:text-left">
                        Made with ❤️ for Digital Bharat · Team Haya · AI for Bharat Hackathon 2026
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="text-slate-400 text-xs">© 2026 BharatMedia</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-400 text-xs">AWS Bedrock Partner</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
