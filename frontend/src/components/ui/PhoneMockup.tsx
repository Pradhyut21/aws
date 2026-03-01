interface PhoneMockupProps {
    children: React.ReactNode;
    platform?: 'instagram' | 'whatsapp';
}

export default function PhoneMockup({ children, platform = 'instagram' }: PhoneMockupProps) {
    return (
        <div className="relative mx-auto" style={{ width: 280 }}>
            {/* Phone frame */}
            <div className="relative rounded-[40px] overflow-hidden shadow-2xl"
                style={{
                    background: '#1a1a2e',
                    border: '3px solid #2a2a4e',
                    padding: '12px 4px',
                    boxShadow: '0 0 60px rgba(0,212,255,0.15), 0 30px 60px rgba(0,0,0,0.5)',
                }}
            >
                {/* Notch */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-10" />

                {/* Status bar */}
                <div className="px-6 pt-5 pb-1 flex justify-between text-white text-xs">
                    <span>9:41</span>
                    <span>●●● 5G 🔋</span>
                </div>

                {/* App header */}
                <div className="px-3 py-2 flex items-center gap-2"
                    style={{ background: platform === 'whatsapp' ? '#075E54' : '#000' }}
                >
                    {platform === 'instagram' ? (
                        <span className="font-bold text-white text-sm italic">Instagram</span>
                    ) : (
                        <span className="font-bold text-white text-sm">WhatsApp</span>
                    )}
                </div>

                {/* Content */}
                <div className="overflow-hidden" style={{ minHeight: 320 }}>
                    {children}
                </div>

                {/* Home indicator */}
                <div className="flex justify-center pt-2 pb-1">
                    <div className="w-24 h-1 bg-white/30 rounded-full" />
                </div>
            </div>
        </div>
    );
}
