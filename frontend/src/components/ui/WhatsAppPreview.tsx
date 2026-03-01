import { motion } from 'framer-motion';

interface WhatsAppPreviewProps {
    message: string;
    businessName: string;
    time?: string;
}

export default function WhatsAppPreview({ message, businessName, time = '3:07 PM' }: WhatsAppPreviewProps) {
    return (
        <div className="bg-[#0d1f16] h-full p-3 space-y-3">
            {/* Wallpaper dots */}
            <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'radial-gradient(circle, #25D366 1px, transparent 1px)',
                backgroundSize: '24px 24px',
            }} />

            {/* Incoming header */}
            <div className="flex items-center gap-2 relative z-10">
                <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-sm font-bold text-white">
                    {businessName[0]}
                </div>
                <div>
                    <p className="text-white text-xs font-semibold">{businessName}</p>
                    <p className="text-green-400 text-[10px]">Business Account</p>
                </div>
            </div>

            {/* Message bubble */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="relative ml-2"
            >
                <div className="bg-[#1e3a2a] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl px-3 py-2 max-w-[240px] shadow-lg">
                    <p className="text-[#F5F5F5] text-sm whitespace-pre-line leading-relaxed">{message}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[10px] text-green-400/60">{time}</span>
                        <span className="text-green-400 text-[10px]">✓✓</span>
                    </div>
                </div>
                {/* Tail */}
                <div className="absolute top-0 -left-2 w-0 h-0 border-r-[10px] border-r-[#1e3a2a] border-t-[10px] border-t-transparent" />
            </motion.div>

            {/* Reply area */}
            <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                <div className="flex-1 bg-[#1a1a2e] rounded-full px-3 py-2 text-xs text-slate-500 flex items-center gap-2">
                    <span>🎤</span> Type a message
                </div>
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                    <span className="text-white text-xs">🎤</span>
                </div>
            </div>
        </div>
    );
}
