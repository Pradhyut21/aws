import type { Campaign, AnalyticsData } from './types';

export const DEMO_VOICE_TEXT = "Mera naam Raju hai, main Varanasi mein silk sarees bechta hoon. Mujhe Diwali ke liye ek campaign chahiye jo Instagram aur WhatsApp par Hindi mein ho.";

export const MOCK_CAMPAIGN: Campaign = {
    id: 'demo-001',
    userId: 'demo-user-001',
    title: 'Varanasi Silk Sarees — Diwali Campaign',
    input: DEMO_VOICE_TEXT,
    inputType: 'voice',
    language: 'hi',
    businessType: 'handicraft',
    region: ['Uttar Pradesh', 'Delhi', 'Maharashtra'],
    status: 'done',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    bharatScore: {
        total: 87,
        culturalFit: 23,
        seoScore: 22,
        engagementPotential: 21,
        platformOptimization: 21,
    },
    content: {
        images: [
            { id: 'img-1', url: 'https://picsum.photos/seed/saree1/800/600', platform: 'instagram', caption: 'दिवाली की रोशनी में चमकती वाराणसी की रेशमी साड़ियाँ ✨🪔' },
            { id: 'img-2', url: 'https://picsum.photos/seed/saree2/800/600', platform: 'facebook', caption: 'बनारसी सिल्क की अद्भुत कला — हर त्योहार को खास बनाएं!' },
            { id: 'img-3', url: 'https://picsum.photos/seed/saree3/800/600', platform: 'whatsapp', caption: 'सीमित समय के लिए: 30% की छूट! आज ही ऑर्डर करें 📱' },
            { id: 'img-4', url: 'https://picsum.photos/seed/saree4/800/600', platform: 'youtube', caption: 'Banarasi Silk — The Pride of Varanasi 🌟' },
        ],
        captions: {
            instagram: '✨ दिवाली की रोशनी में और भी चमकें! 🪔\n\nवाराणसी की असली बनारसी सिल्क साड़ियाँ अब आपके दरवाज़े पर। हर धागे में बुनी है सदियों की कला। \n\n🎁 दिवाली स्पेशल: 30% छूट — सिर्फ 5 दिन!\n\n#BanarasiSilk #DiwaliSpecial #VaranasiSaree #IndianFashion #HandloomIndia',
            facebook: 'नमस्ते दोस्तों! 🙏 दिवाली का त्योहार नज़दीक है और हम लेकर आए हैं एक खास ऑफर। राजू सिल्क हाउस, वाराणसी — जहाँ 50 साल से बुनी जा रही हैं असली बनारसी साड़ियाँ।\n\n✅ 100% शुद्ध सिल्क\n✅ हाथ से बुनी गई\n✅ दिवाली स्पेशल: 30% छूट\n✅ होम डिलीवरी उपलब्ध\n\nआज ही संपर्क करें! 📞',
            twitter: '✨ दिवाली Special: बनारसी सिल्क पर 30% छूट! 🪔 Real handloom from Varanasi. Limited stock. DM us now! #DiwaliSale #BanarasiSaree #MadeInIndia',
            youtube: `📹 Raju Silk House — Varanasi's Finest Banarasi Sarees | Diwali Special 2026

🎬 SCRIPT (60 seconds):
[HOOK 0-5s]: "Kya aapko pata hai ki ek asli Banarasi saree banane mein 2-4 din lagte hain?"
[STORY 5-25s]: Varanasi ki galliyon mein, jahaan hamare kaarigar apne haathon se bunते hain sone-chandi ke dhagon se...
[OFFER 25-45s]: Is Diwali, pehnaiye apni priyajan ko wo saree jo generations yaad rakhein. 30% chhoot — sirf 5 din!
[CTA 45-60s]: Abhi WhatsApp karein ya link par click karein. Bharat ka sabse purana silk hub — seedha aapke ghar!`,
            whatsapp: `🙏 Namaskar!\n\n*Raju Silk House, Varanasi* mein aapका swagat hai! 🎊\n\n✨ *Diwali Special Offer*\n🛍️ Asli Banarasi Silk Sarees\n💰 30% tak chhoot\n🚚 Free home delivery\n⏰ Sirf 5 din baaki!\n\nOrder karne ke liye reply karein ya call karein:\n📞 +91 98765 43210\n\n_Bharat ke haath se buni, aapke liye_ 🇮🇳`,
        },
        seo: {
            title: 'Buy Authentic Banarasi Silk Sarees Online | Raju Silk House Varanasi — Diwali Sale 2026',
            metaDescription: 'Shop genuine handloom Banarasi silk sarees from Varanasi. Get 30% off this Diwali. Free shipping across India. Certificate of authenticity included.',
            keywords: [
                'banarasi silk saree', 'varanasi silk online', 'banarasi saree diwali', 'handloom silk india',
                'बनारसी साड़ी', 'वाराणसी सिल्क', 'दिवाली साड़ी ऑफर', 'pure silk saree price',
                'buy banarasi saree online', 'original banarasi silk', 'silk saree varanasi',
            ],
            blogOutline: [
                'Why Banarasi Silk is UNESCO-recognized',
                'How to identify authentic Banarasi silk',
                '5 ways to style Banarasi sarees for Diwali',
                'The weavers of Varanasi — an untold story',
                'Care guide for silk sarees',
            ],
        },
        whatsapp: {
            message: `🙏 Namaskar! Raju Silk House se Diwali ki shubhkamnayein! ✨\n\n30% chhoot — sirf aaj ke liye!\nOrder karein: +91 98765 43210`,
            statusText: '✨ दिवाली Special! बनारसी सिल्क पर 30% छूट 🪔 Raju Silk House, Varanasi',
        },
        hashtags: ['#BanarasiSilk', '#VaranasiSaree', '#DiwaliSpecial', '#MadeInIndia', '#HandloomIndia', '#IndianFashion', '#DiwaliSale2026', '#VocalForLocal'],
        publishTimes: {
            instagram: '7:00 PM IST',
            facebook: '12:00 PM IST',
            whatsapp: '9:00 AM IST',
            youtube: '6:00 PM IST',
        },
    },
};

export const MOCK_ANALYTICS: AnalyticsData = {
    campaignsCreated: 24,
    languagesUsed: ['Hindi', 'Tamil', 'Bengali', 'Marathi', 'Gujarati'],
    platformsPublished: ['Instagram', 'WhatsApp', 'Facebook', 'YouTube'],
    estimatedReach: 2_450_000,
    engagement: [
        { date: '2026-01-20', views: 12000, likes: 840, shares: 210 },
        { date: '2026-01-27', views: 18500, likes: 1200, shares: 380 },
        { date: '2026-02-03', views: 15200, likes: 980, shares: 290 },
        { date: '2026-02-10', views: 28000, likes: 2100, shares: 520 },
        { date: '2026-02-17', views: 35000, likes: 2800, shares: 680 },
        { date: '2026-02-24', views: 42000, likes: 3400, shares: 890 },
    ],
    platformBreakdown: [
        { platform: 'Instagram', campaigns: 10, reach: 980000 },
        { platform: 'WhatsApp', campaigns: 8, reach: 720000 },
        { platform: 'Facebook', campaigns: 6, reach: 510000 },
        { platform: 'YouTube', campaigns: 4, reach: 240000 },
    ],
    languageBreakdown: [
        { language: 'Hindi', count: 12, color: '#FF6B35' },
        { language: 'Tamil', count: 5, color: '#F7C948' },
        { language: 'Bengali', count: 4, color: '#00D4FF' },
        { language: 'Marathi', count: 2, color: '#00FF88' },
        { language: 'Gujarati', count: 1, color: '#A855F7' },
    ],
    stateData: {
        'Uttar Pradesh': 85, 'Maharashtra': 78, 'Tamil Nadu': 72,
        'West Bengal': 68, 'Karnataka': 65, 'Gujarat': 60,
        'Rajasthan': 55, 'Andhra Pradesh': 52, 'Delhi': 90,
        'Punjab': 48, 'Madhya Pradesh': 42,
    },
};

export const TESTIMONIALS = [
    {
        name: 'Meena Devi',
        business: 'Kancheepuram Silk Weaver',
        city: 'Tamil Nadu',
        language: 'Tamil',
        quote: 'இந்த app இல்லாம என்னால தமிழ்ல Facebook post போட முடியாது. இப்போ என் sales 3x ஆச்சு! 🙏',
        quoteEn: 'Without this app I couldn\'t post in Tamil. Now my sales are 3x!',
        rating: 5,
        avatar: 'meena',
    },
    {
        name: 'Arjun Sharma',
        business: 'Organic Farm',
        city: 'Rajasthan',
        language: 'Hindi',
        quote: 'पहले मुझे रोज़ 6 घंटे content बनाने में लगते थे। अब 10 मिनट में पूरा campaign तैयार! बहुत शुक्रिया BharatMedia 🌾',
        quoteEn: 'Used to spend 6 hrs daily on content. Now entire campaign in 10 mins!',
        rating: 5,
        avatar: 'arjun',
    },
    {
        name: 'Grace Lkr',
        business: 'Bamboo Crafts',
        city: 'Shillong',
        language: 'Khasi/English',
        quote: 'My bamboo craft videos now reach across India. BharatMedia translated everything perfectly! The AI understands Northeast culture 💚',
        quoteEn: 'My bamboo craft videos now reach across India with perfect translation!',
        rating: 5,
        avatar: 'grace',
    },
];

export const FEATURES = [
    { icon: '🎙️', title: 'Voice-to-Campaign', desc: 'Speak your idea in any Indian language', impact: '10 min vs 6 hrs', stat: '36x', color: '#FF6B35' },
    { icon: '🌐', title: '22+ Language Support', desc: 'All official Indian languages + dialects', impact: '3x audience reach', stat: '3×', color: '#F7C948' },
    { icon: '🎬', title: 'AI Video Generation', desc: 'Nova Reel creates 15-second reels', impact: '₹50,000 → ₹0 cost', stat: '₹0', color: '#00D4FF' },
    { icon: '💬', title: 'WhatsApp Integration', desc: 'Reach 490M Indian users directly', impact: '490M potential users', stat: '490M', color: '#25D366' },
    { icon: '⏰', title: 'Smart Scheduling', desc: 'AI picks peak engagement times', impact: '40% higher engagement', stat: '+40%', color: '#FF6B35' },
    { icon: '🔍', title: 'SEO Optimizer', desc: 'Regional keywords in native script', impact: '5x search visibility', stat: '5×', color: '#F7C948' },
    { icon: '🛡️', title: 'Cultural Guardrails', desc: 'Prevents cultural insensitivity', impact: '100% brand safety', stat: '100%', color: '#00D4FF' },
    { icon: '📊', title: 'Hyperlocal Analytics', desc: 'State & language performance tracking', impact: 'Per-state insights', stat: '28+', color: '#A855F7' },
    { icon: '🤝', title: 'Influencer Matching', desc: 'AI finds micro-influencers in your region', impact: '80% lower cost', stat: '-80%', color: '#00FF88' },
    { icon: '🎪', title: 'Festival Pricing', desc: 'Auto-create festival campaigns', impact: '25% revenue boost', stat: '+25%', color: '#FF6B35' },
];

export const COMPARISON_DATA = [
    { feature: 'Indian Language Support', bharatMedia: true, chatGPT: false, canva: false, socialTools: false },
    { feature: 'Voice Input (Any Language)', bharatMedia: true, chatGPT: false, canva: false, socialTools: false },
    { feature: 'Culture-Aware Content', bharatMedia: true, chatGPT: false, canva: false, socialTools: false },
    { feature: 'Festival Campaign AI', bharatMedia: true, chatGPT: false, canva: false, socialTools: false },
    { feature: 'WhatsApp Publishing', bharatMedia: true, chatGPT: false, canva: false, socialTools: true },
    { feature: 'AI Video Generation', bharatMedia: true, chatGPT: false, canva: false, socialTools: false },
    { feature: 'Regional SEO Keywords', bharatMedia: true, chatGPT: true, canva: false, socialTools: false },
    { feature: 'BharatScore Analytics', bharatMedia: true, chatGPT: false, canva: false, socialTools: false },
    { feature: 'SMB-Priced (₹99/mo)', bharatMedia: true, chatGPT: false, canva: true, socialTools: false },
];
