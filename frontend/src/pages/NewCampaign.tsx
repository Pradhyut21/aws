import { useState, useCallback, lazy, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import VoiceRecorder from '../components/ui/VoiceRecorder';
import LanguageSelector from '../components/ui/LanguageSelector';
import AgentStatus from '../components/ui/AgentStatus';
import CampaignCard from '../components/ui/CampaignCard';
import BharatScore from '../components/ui/BharatScore';
import PhoneMockup from '../components/ui/PhoneMockup';
import WhatsAppPreview from '../components/ui/WhatsAppPreview';
import Confetti from '../components/ui/Confetti';
import VideoStoryboard from '../components/ui/VideoStoryboard';
import ContentRemixer from '../components/ui/ContentRemixer';
import { saveCampaignToHistory } from './Analytics';
import { useToast } from '../components/ui/ToastProvider';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts.tsx';
import { useCampaignPipeline } from '../hooks/useCampaignPipeline';
import { useLanguageDetect } from '../hooks/useLanguageDetect';
import { createCampaign } from '../lib/api';
import { MOCK_CAMPAIGN, DEMO_VOICE_TEXT } from '../lib/mockData';
import { BUSINESS_TYPES, INDIAN_STATES, PLATFORMS } from '../lib/constants';
import type { Campaign } from '../lib/types';

const AgentPipeline3D = lazy(() => import('../components/3d/AgentPipeline3D'));

type Step = 1 | 2 | 3;

const TAB_KEYS = ['images', 'captions', 'seo', 'whatsapp', 'storyboard', 'remixer'] as const;
type TabKey = typeof TAB_KEYS[number];

export default function NewCampaign() {
    const [step, setStep] = useState<Step>(1);
    const [inputMode, setInputMode] = useState<'voice' | 'text'>('text');
    const [textInput, setTextInput] = useState('');
    const [language, setLanguage] = useState('hi');
    const [businessType, setBusinessType] = useState('retail');
    const [regions, setRegions] = useState<string[]>([]);
    const [campaignGoal, setCampaignGoal] = useState('sales');
    const [tone, setTone] = useState('engaging');
    const [campaignResult, setCampaignResult] = useState<Campaign | null>(null);
    const [activeTab, setActiveTab] = useState<TabKey>('images');
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram', 'whatsapp']);
    const [publishSuccess, setPublishSuccess] = useState(false);
    const [confettiActive, setConfettiActive] = useState(false);
    const [campaignId] = useState<string | null>(null);
    const { success, info } = useToast();

    // Prefill from template if coming from Templates page, OR load full campaign from Dashboard
    useEffect(() => {
        const tpl = sessionStorage.getItem('template');
        const recent = sessionStorage.getItem('recentCampaign');

        if (tpl) {
            try {
                const { input, language: lang, businessType: bt } = JSON.parse(tpl);
                if (input) setTextInput(input);
                if (lang) setLanguage(lang);
                if (bt) setBusinessType(bt);
                sessionStorage.removeItem('template');
                info('Template loaded! Click Generate to create your campaign. 📁');
            } catch { }
        } else if (recent) {
            try {
                const data = JSON.parse(recent);
                if (data.input) setTextInput(data.input);
                if (data.language) setLanguage(data.language);
                if (data.businessType) setBusinessType(data.businessType);
                if (data.regions) setRegions(data.regions);
                if (data.result) {
                    setCampaignResult(data.result);
                    setStep(3);
                }
                sessionStorage.removeItem('recentCampaign');
                info('Loaded campaign from history! 🕰️');
            } catch { }
        }
    }, []);

    // Keyboard shortcut: Ctrl+Enter to submit
    useKeyboardShortcuts([{
        key: 'Enter', ctrl: true, description: 'Submit campaign',
        handler: () => { if (step === 1 && textInput) handleSubmit(); }
    }]);

    const { stages, currentStage, isComplete, simulatePipeline } = useCampaignPipeline(campaignId);
    const langDetect = useLanguageDetect(textInput);

    // Auto-detect business type and regions based on user input
    useEffect(() => {
        if (!textInput || step !== 1) return;
        const lowerInput = textInput.toLowerCase();

        // Auto-select language if mentioned English/Hindi/Tamil etc
        if (lowerInput.includes('tamil')) setLanguage('ta');
        else if (lowerInput.includes('hindi')) setLanguage('hi');
        else if (lowerInput.includes('telugu')) setLanguage('te');

        // Auto-select regions
        const stateMapping: Record<string, string> = {
            'mumbai': 'Maharashtra', 'mambai': 'Maharashtra', 'bombay': 'Maharashtra',
            'dheli': 'Delhi', 'delhi': 'Delhi', 'dehli': 'Delhi', 'new delhi': 'Delhi',
            'bangalore': 'Karnataka', 'bengaluru': 'Karnataka',
            'chennai': 'Tamil Nadu', 'madras': 'Tamil Nadu',
            'kolkata': 'West Bengal', 'calcutta': 'West Bengal',
            'hyderabad': 'Telangana', 'pune': 'Maharashtra', 'ahmedabad': 'Gujarat'
        };
        const matchedRegions = INDIAN_STATES.filter(s => lowerInput.includes(s.toLowerCase()));
        Object.keys(stateMapping).forEach(key => {
            if (lowerInput.includes(key) && !matchedRegions.includes(stateMapping[key])) {
                matchedRegions.push(stateMapping[key]);
            }
        });

        if (matchedRegions.length > 0) {
            setRegions(prev => {
                const combined = [...new Set([...matchedRegions, ...prev])];
                return combined.slice(0, 3);
            });
        }

        // Auto-select business type
        const matchedBiz = BUSINESS_TYPES.find(b =>
            lowerInput.includes(b.id) ||
            b.label.toLowerCase().split(/[/\s]+/).some(word => word.length > 3 && lowerInput.includes(word))
        );
        if (matchedBiz) {
            setBusinessType(matchedBiz.id);
        } else if (lowerInput.includes('building') || lowerInput.includes('build') || lowerInput.includes('construct') || lowerInput.includes('bulding') || lowerInput.includes('matirals')) {
            setBusinessType('construction');
        }
    }, [textInput, step]);

    const handleVoiceDemo = useCallback(() => {
        setTextInput(DEMO_VOICE_TEXT);
        setLanguage('hi');
        setBusinessType('handicraft');
        setRegions(['Uttar Pradesh', 'Delhi']);
        handleSubmit();
    }, []);

    const handleSubmit = useCallback(async () => {
        setStep(2);
        simulatePipeline();

        let campaignId: string | null = null;
        try {
            const response = await createCampaign({
                input: textInput,
                inputType: inputMode,
                language,
                businessType,
                region: regions,
            });
            campaignId = response.campaignId;
        } catch (apiErr) {
            console.warn('Backend API failed, will use personalized mock data:', apiErr);
        }

        // Poll backend until campaign is done (max 30 seconds)
        let finalResult = null;
        if (campaignId) {
            for (let i = 0; i < 15; i++) {
                await new Promise(r => setTimeout(r, 2000));
                try {
                    const res = await fetch(`http://localhost:4000/api/campaign/${campaignId}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.status === 'done' && data.content) {
                            finalResult = data;
                            break;
                        } else if (data.status === 'error') {
                            console.warn('Campaign pipeline errored, using personalized mock');
                            break;
                        }
                    }
                } catch { /* keep polling */ }
            }
        } else {
            // Wait for animation to finish at minimum
            await new Promise(r => setTimeout(r, 9500));
        }

        // Build personalized mock data from user's actual input
        const regionStr = regions.join(', ') || 'India';
        const region0 = regions[0] || 'India';

        const greetings: Record<string, string> = {
            hi: 'नमस्ते! 🙏', ta: 'வணக்கம்! 🙏', te: 'నమస్కారం! 🙏',
            kn: 'ನಮಸ್ಕಾರ! 🙏', ml: 'നമസ്കാരം! 🙏', bn: 'নমস্কার! 🙏',
            mr: 'नमस्कार! 🙏', gu: 'નમસ્તે! 🙏', pa: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! 🙏',
            ur: 'السلام علیکم! 🙏', en: 'Hello! 👋',
        };

        const promoText: Record<string, string> = {
            hi: 'हमारे बेहतरीन क्वालिटी के प्रोडक्ट्स अभी खरीदें। शानदार डिस्काउंट! आज ही आर्डर करें!',
            te: 'మా అద్భుతమైన నాణ్యత గల ఉత్పత్తులతో ప్రత్యేక ఆఫర్ పొందండి. ఈరోజే ఆర్డర్ చేయండి!',
            ta: 'எங்கள் சிறந்த தரமான தயாரிப்புகளில் சிறப்பு சலுகை. இன்றே ஆர்டர் செய்யுங்கள்!',
            ml: 'ഞങ്ങളുടെ മികച്ച ഗുണനിലവാരമുള്ള ഉൽപ്പന്നങ്ങൾക്ക് പ്രത്യേക ഓഫർ. ഇന്നുതന്നെ ഓർഡർ ചെയ്യുക!',
            kn: 'ನಮ್ಮ ಅತ್ಯುತ್ತಮ ಗುಣಮಟ್ಟದ ಉತ್ಪನ್ನಗಳ ಮೇಲೆ ವಿಶೇಷ ಕೊಡುಗೆ. ಇಂದೇ ಆರ್ಡರ್ ಮಾಡಿ!',
            bn: 'আমাদের চমৎকার মানের পণ্যে বিশেষ ছাড়! আজই অর্ডার করুন!',
            mr: 'आमच्या उत्कृष्ट दर्जाच्या उत्पादनांवर विशेष ऑफर! आजच ऑर्डर करा!',
            gu: 'અમારા ઉત્કૃષ્ટ ગુણવત્તાવાળા ઉત્પાદનો પર વિશેષ ઑફર! આજે જ ઑર્ડર કરો!',
            pa: 'ਸਾਡੇ ਵਧੀਆ ਕੁਆਲਿਟੀ ਉਤਪਾਦਾਂ ਤੇ ਖਾਸ ਆਫਰ! ਅੱਜ ਹੀ ਆਰਡਰ ਕਰੋ!',
            ur: 'ہماری بہترین معیار کی مصنوعات پر خصوصی پیشکش! آج ہی آرڈر کریں!',
            en: 'Enjoy special discounts on our premium quality products. Order today!',
        };

        const features: Record<string, string[]> = {
            hi: ['✅ गुणवत्ता की गारंटी', '✅ होम डिलीवरी', '✅ 24/7 सपोर्ट'],
            te: ['✅ నాణ్యత హామీ', '✅ హోమ్ డెలివరీ', '✅ 24/7 మద్దతు'],
            ta: ['✅ தரம் உறுதி', '✅ வீட்டு விநியோகம்', '✅ 24/7 ஆதரவு'],
            ml: ['✅ ഗുണമേന്മ ഉറപ്പ്', '✅ ഹോം ഡെലിവറി', '✅ 24/7 പിന്തുണ'],
            kn: ['✅ ಗುಣಮಟ್ಟದ ಖಾತರಿ', '✅ ಹೋಮ್ ಡೆಲಿವರಿ', '✅ 24/7 ಬೆಂಬಲ'],
            en: ['✅ Quality Guaranteed', '✅ Fast Delivery', '✅ 24/7 Support']
        };

        const greet = greetings[language] || greetings['en'];
        const promo = promoText[language] || promoText['en'];
        const feats = features[language] || features['en'];

        const bizCategory = businessType;
        const bizSlug = bizCategory.replace(/\s+/g, '');

        const spellings: Record<string, string> = { 'bulding': 'building', 'matirals': 'materials', 'dheli': 'Delhi', 'bussiness': 'business', 'mambai': 'Mumbai' };
        const cleanWords = textInput.toLowerCase()
            .replace(/[^\w\s]/gi, '')
            .replace(/\b(i|want|need|give|me|show|an|a|the|some|any|make|create|generate|ad|campaign|for|my|in|at|this|that|please|pls|do|it|and|to|with|about|details|wikipedia|importance)\b/gi, '')
            .split(/\s+/)
            .filter(w => w.length > 2)
            .map(w => spellings[w] || w)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1));

        // Use the exact business they described, or fallback
        const biz = cleanWords.length > 0 ? cleanWords.join(' ') : (bizCategory.charAt(0).toUpperCase() + bizCategory.slice(1));

        // Generate professional AI-sounding copy
        const AI_HOOKS = [
            `Elevate your experience with the finest ${biz} services in ${regionStr}.`,
            `Your search for premium ${biz} ends here. Discover unparalleled quality!`,
            `Transforming the ${bizCategory} landscape in ${regionStr} with innovation and excellence.`,
            `Experience the gold standard of ${biz}. Tailored exclusively for you.`,
            `Unlocking new possibilities in ${biz} for the people of ${regionStr}.`
        ];
        const synthesizedPhrase = AI_HOOKS[textInput.length % AI_HOOKS.length];

        // Simulate fetching Wikipedia importance / AI insights
        const AI_FACTS = [
            `💡 Importance of ${biz}: High-quality ${biz} significantly boosts the local economy and elevates community standards.`,
            `💡 Why it matters: ${biz} plays a crucial role in modern lifestyle improvements and essential daily operations.`,
            `💡 The Value of ${biz}: Investing in premier ${biz} ensures long-term sustained value and outstanding market reliability.`
        ];
        const aiFact = AI_FACTS[textInput.length % AI_FACTS.length];

        const igCaption = `✨ ${biz} — ${region0} 🎁\n${promo}\n🌟 ${synthesizedPhrase}\n\n${aiFact}\n\n#${bizSlug} #VocalForLocal #${region0.replace(/\s+/g, '')}`;
        const fbCaption = `${greet}\n\n${promo}\n🌟 ${synthesizedPhrase}\n\n${feats.join('\n')}\n📍 ${regionStr}\n\n${aiFact}`;
        const twCaption = `🚨 ${promo.slice(0, 80)}... 🌟 ${synthesizedPhrase.slice(0, 50)} #${bizSlug} #${region0.replace(/\s+/g, '')}`;
        const ytCaption = `🎬 ${biz} — ${regionStr}\n\n${promo}\n🌟 ${synthesizedPhrase}\n\n${aiFact}\n\n${feats.join(' | ')}`;
        const liCaption = `${greet} Proud to represent ${biz} from ${regionStr}. ${promo}\n🌟 ${synthesizedPhrase}\n\n${aiFact}\n\n#Business #${region0.replace(/\s+/g, '')}`;
        const waMessage = `${greet}\n\n*${biz}* — ${regionStr}\n\n${promo}\n✨ ${synthesizedPhrase}\n\n${aiFact}\n\n${feats.join('\n')}`;

        const baseScore = Math.floor(Math.random() * 10) + 80;
        const scoreMod = textInput.length > 15 ? 7 : 0;
        const dynamicBharatScore = {
            total: Math.min(98, baseScore + scoreMod),
            culturalFit: Math.floor(Math.random() * 5) + 20,
            seoScore: Math.floor(Math.random() * 5) + 20,
            engagementPotential: Math.floor(Math.random() * 5) + 20,
            platformOptimization: Math.floor(Math.random() * 5) + 20,
        };

        const personalizedMock = {
            ...MOCK_CAMPAIGN,
            title: `${biz} Campaign — ${regionStr}`,
            bharatScore: dynamicBharatScore,
            content: {
                ...MOCK_CAMPAIGN.content,
                images: [
                    { id: 'img-1', url: `https://loremflickr.com/800/600/${encodeURIComponent(biz)},${encodeURIComponent(region0)}?lock=1`, platform: 'instagram', caption: igCaption },
                    { id: 'img-2', url: `https://loremflickr.com/800/600/${encodeURIComponent(biz)},india?lock=2`, platform: 'facebook', caption: fbCaption },
                    { id: 'img-3', url: `https://loremflickr.com/800/600/${encodeURIComponent(biz)},${encodeURIComponent(region0)}?lock=3`, platform: 'whatsapp', caption: waMessage },
                    { id: 'img-4', url: `https://loremflickr.com/800/600/${encodeURIComponent(biz)},business?lock=4`, platform: 'youtube', caption: `${biz} — Best in ${regionStr} 🌟` },
                ],
                captions: {
                    instagram: igCaption,
                    facebook: fbCaption,
                    twitter: twCaption,
                    youtube: ytCaption,
                    whatsapp: waMessage,
                    linkedin: liCaption,
                },
                seo: {
                    title: `Top Rated ${biz} in ${region0} | Guaranteed Quality`,
                    metaDescription: `Looking for the best ${biz} in ${regionStr}? We provide elite services and products designed for your needs. Contact us today!`,
                    keywords: [
                        `${biz}`, `${region0}`, `premium ${biz}`, `best ${biz} online`, `local ${biz} shop`
                    ],
                },
                hashtags: [`#${bizSlug}`, '#VocalForLocal', '#MadeInIndia', `#${region0.replace(/\s+/g, '')}Business`, '#IndianSMB'],
                whatsapp: {
                    message: waMessage,
                    statusText: `✨ Special Offer! ${biz} — ${regionStr} 🎁`,
                },
            },
        };

        const finalData = finalResult ?? personalizedMock;
        setCampaignResult(finalData);
        saveCampaignToHistory({ input: textInput, language, businessType, regions, result: finalData });

        // Auto-select the first relevant tab based on user's platform choice
        if (selectedPlatforms.includes('instagram') || selectedPlatforms.includes('facebook')) {
            setActiveTab('images');
        } else if (selectedPlatforms.includes('whatsapp')) {
            setActiveTab('whatsapp');
        } else if (selectedPlatforms.includes('youtube')) {
            setActiveTab('storyboard');
        } else {
            setActiveTab('captions');
        }

        setStep(3);
    }, [simulatePipeline, textInput, inputMode, language, businessType, regions, selectedPlatforms]);

    const PIPELINE_STAGES_DURATION = 10000;

    const handlePublishAll = () => {
        setPublishSuccess(true);
        setConfettiActive(true);
        success(`🚀 Sharing to ${selectedPlatforms.length} platforms!`);
        setTimeout(() => setConfettiActive(false), 4000);

        // Get the best caption and URL encode it
        const caption = campaignResult?.content?.captions?.instagram
            || campaignResult?.content?.captions?.whatsapp
            || textInput;
        const encodedText = encodeURIComponent(caption);
        const encodedUrl = encodeURIComponent('https://bharatmedia.in');

        const shareMap: Record<string, string> = {
            whatsapp: `https://wa.me/?text=${encodedText}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodedText}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
            youtube: `https://studio.youtube.com/`,
            instagram: `https://www.instagram.com/`,
        };

        selectedPlatforms.forEach((pid, i) => {
            const url = shareMap[pid];
            if (url) setTimeout(() => window.open(url, '_blank'), i * 600);
        });
    };

    const handleDownload = () => {
        if (!campaignResult?.content) return;
        const { captions, seo } = campaignResult.content;
        const text = [
            '=== BharatMedia Campaign Export ===\n',
            'CAPTIONS:\n',
            ...Object.entries(captions).map(([p, c]) => `[${p.toUpperCase()}]\n${c}\n`),
            '\nSEO:\n',
            `Title: ${seo.title}\nDescription: ${seo.metaDescription}\nKeywords: ${seo.keywords.join(', ')}`,
        ].join('\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'bharatmedia-campaign.txt'; a.click();
        URL.revokeObjectURL(url);
        success('Campaign exported! 📥');
    };

    const toggleRegion = (region: string) => {
        setRegions(prev => prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]);
    };

    const togglePlatform = (id: string) => {
        setSelectedPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    };

    return (
        <div className="min-h-screen flex">
            <Confetti active={confettiActive} onComplete={() => setConfettiActive(false)} />
            <Sidebar />
            <main className="flex-1 ml-[220px] p-8">
                {/* Progress steps */}
                <div className="flex items-center gap-4 mb-8">
                    {[1, 2, 3].map(s => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w - 8 h - 8 rounded - full flex items - center justify - center text - sm font - bold font - poppins transition - all ${step >= s ? 'text-black' : 'text-slate-400 border border-slate-700'
                                }`} style={step >= s ? { background: 'linear-gradient(135deg, #FF6B35, #F7C948)' } : {}}>
                                {step > s ? '✓' : s}
                            </div>
                            <span className={`text - sm font - medium ${step >= s ? 'text-white' : 'text-slate-500'} `}>
                                {s === 1 ? 'Your Idea' : s === 2 ? 'Creating...' : 'Your Campaign'}
                            </span>
                            {s < 3 && <div className={`w - 12 h - 0.5 ${step > s ? 'bg-orange-500' : 'bg-slate-700'} `} />}
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* STEP 1: INPUT */}
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4, ease: "easeOut" }}>
                            <div className="max-w-5xl mx-auto">
                                <div className="text-center mb-10">
                                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-block px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 font-medium text-sm mb-4">
                                        ✨ AI Campaign Architect
                                    </motion.div>
                                    <h1 className="text-5xl font-black font-poppins text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 mb-4 pb-1">
                                        Shape Your Next Big Idea
                                    </h1>
                                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                                        Describe your business and let our advanced AI orchestrator design a highly converting, multi-platform campaign tailored to your audience.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    {/* Main Input Area */}
                                    <div className="lg:col-span-8 flex flex-col gap-6">
                                        <div className="glass-card p-1 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            <div className="bg-[#0f111a]/80 backdrop-blur-xl rounded-[14px] p-6 relative z-10 h-full flex flex-col">
                                                <div className="flex justify-between items-center mb-4">
                                                    <label className="text-sm font-bold text-white flex items-center gap-2">
                                                        <span className="text-orange-400">⚡</span> Product or Idea
                                                    </label>
                                                    <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                                                        {[{ key: 'text', icon: '✏️', label: 'Type' }, { key: 'voice', icon: '🎙️', label: 'Speak' }].map(m => (
                                                            <button key={m.key} onClick={() => setInputMode(m.key as 'voice' | 'text')}
                                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${inputMode === m.key ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                                                {m.icon} {m.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {inputMode === 'text' ? (
                                                    <div className="flex-1 flex flex-col">
                                                        <textarea
                                                            value={textInput}
                                                            onChange={e => setTextInput(e.target.value)}
                                                            placeholder="e.g., We are launching a new line of organic skincare products targeting millennials. We want to emphasize sustainability..."
                                                            className="w-full flex-1 bg-black/20 border border-white/5 rounded-xl p-5 text-white placeholder-slate-500/70 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 resize-none text-base leading-relaxed transition-all min-h-[160px]"
                                                        />
                                                        {langDetect.detected && (
                                                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex items-center gap-2 justify-end">
                                                                <span className="text-xs text-slate-500 font-medium">Language Detected:</span>
                                                                <span className="text-xs px-2.5 py-1 rounded-full text-orange-400 border border-orange-500/20 bg-orange-500/10 font-mono font-medium flex items-center gap-1.5">
                                                                    {langDetect.languageName} <span className="text-white/50">|</span> {Math.round(langDetect.confidence * 100)}%
                                                                </span>
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex-1 flex items-center justify-center min-h-[160px]">
                                                        <VoiceRecorder onRecordingComplete={() => setInputMode('text')} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Campaign Goal */}
                                            <div className="glass-card p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
                                                <label className="text-sm font-bold text-white mb-3 block flex items-center gap-2">
                                                    <span className="text-blue-400">🎯</span> Primary Goal
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[
                                                        { id: 'sales', label: 'Sales', icon: '💰' },
                                                        { id: 'awareness', label: 'Awareness', icon: '🌟' },
                                                        { id: 'engagement', label: 'Engagement', icon: '💬' },
                                                        { id: 'leads', label: 'Leads', icon: '📈' },
                                                    ].map(g => (
                                                        <button key={g.id} onClick={() => setCampaignGoal(g.id)}
                                                            className={`p-2.5 text-left rounded-xl text-sm transition-all border ${campaignGoal === g.id
                                                                ? 'bg-blue-500/10 border-blue-500/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                                                                : 'bg-black/20 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                                                }`}>
                                                            <span className="mr-2">{g.icon}</span>{g.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Tone of Voice */}
                                            <div className="glass-card p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
                                                <label className="text-sm font-bold text-white mb-3 block flex items-center gap-2">
                                                    <span className="text-purple-400">🎭</span> Brand Tone
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[
                                                        { id: 'engaging', label: 'Engaging', icon: '✨' },
                                                        { id: 'professional', label: 'Professional', icon: '👔' },
                                                        { id: 'urgent', label: 'Urgent', icon: '⚡' },
                                                        { id: 'humorous', label: 'Humorous', icon: '😄' },
                                                    ].map(t => (
                                                        <button key={t.id} onClick={() => setTone(t.id)}
                                                            className={`p-2.5 text-left rounded-xl text-sm transition-all border ${tone === t.id
                                                                ? 'bg-purple-500/10 border-purple-500/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                                                                : 'bg-black/20 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                                                }`}>
                                                            <span className="mr-2">{t.icon}</span>{t.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sidebar Options Area */}
                                    <div className="lg:col-span-4 flex flex-col gap-6">
                                        {/* Business Type */}
                                        <div className="relative z-50 glass-card p-5 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent">
                                            <label className="text-sm font-bold text-white mb-3 block flex items-center gap-2">
                                                <span className="text-green-400">🏢</span> Business Sector
                                            </label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {BUSINESS_TYPES.slice(0, 9).map(b => (
                                                    <button key={b.id} onClick={() => setBusinessType(b.id)}
                                                        className={`p-2 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all border ${businessType === b.id
                                                            ? 'bg-green-500/20 border-green-500/50 text-white shadow-[0_0_15px_rgba(34,197,94,0.15)]'
                                                            : 'bg-black/20 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                                            }`}>
                                                        <span className="text-lg">{b.emoji}</span>
                                                        <span className="text-[10px] font-medium leading-tight px-1">{b.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Language Selector */}
                                        <div className="relative z-40 glass-card p-5 rounded-2xl border border-white/10 bg-gradient-to-bl from-white/[0.05] to-transparent">
                                            <label className="text-sm font-bold text-white mb-3 block flex items-center gap-2">
                                                <span className="text-pink-400">🗣️</span> Output Language
                                            </label>
                                            <LanguageSelector value={language} onChange={setLanguage} />
                                        </div>

                                        {/* Regions */}
                                        <div className="relative z-30 glass-card p-5 rounded-2xl border border-white/10 bg-gradient-to-tr from-white/[0.05] to-transparent flex-1 flex flex-col min-h-[200px]">
                                            <div className="flex justify-between items-center mb-3">
                                                <label className="text-sm font-bold text-white flex items-center gap-2">
                                                    <span className="text-amber-400">📍</span> Target Regions
                                                </label>
                                                <span className="text-xs font-semibold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-md">{regions.length} Selected</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
                                                {INDIAN_STATES.map(state => (
                                                    <button key={state} onClick={() => toggleRegion(state)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${regions.includes(state)
                                                            ? 'bg-orange-500/20 border-orange-500/50 text-white shadow-[0_0_10px_rgba(249,115,22,0.15)]'
                                                            : 'bg-black/20 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                                            }`}>
                                                        {state}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: CINEMATIC LOADING */}
                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center min-h-[70vh] relative overflow-hidden">

                            {/* Floating anime stickers scattered around */}
                            {[
                                { e: '🌸', top: '5%', left: '5%', d: 3 }, { e: '⚡', top: '10%', right: '8%', d: 2.5 },
                                { e: '🦊', top: '20%', left: '2%', d: 4 }, { e: '🔮', top: '15%', right: '3%', d: 3.5 },
                                { e: '🎐', bottom: '20%', left: '4%', d: 2.8 }, { e: '🐲', bottom: '15%', right: '5%', d: 3.2 },
                                { e: '🌺', top: '40%', left: '1%', d: 2.2 }, { e: '⛩️', top: '35%', right: '2%', d: 3.8 },
                                { e: '💫', bottom: '35%', left: '7%', d: 2 }, { e: '🎋', bottom: '30%', right: '6%', d: 4.2 },
                                { e: '🌊', top: '60%', left: '3%', d: 3 }, { e: '🎴', top: '65%', right: '4%', d: 2.7 },
                            ].map((s, i) => (
                                <motion.span key={i} className="absolute text-3xl select-none pointer-events-none"
                                    style={{ top: s.top, bottom: s.bottom, left: s.left, right: s.right } as React.CSSProperties}
                                    animate={{ y: [0, -18, 0], rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: s.d, delay: i * 0.3 }}>
                                    {s.e}
                                </motion.span>
                            ))}

                            {/* Central AI Orb */}
                            <div className="relative flex items-center justify-center mb-8">
                                {/* Outer glow rings */}
                                {[140, 110, 80].map((size, i) => (
                                    <motion.div key={i} className="absolute rounded-full border"
                                        style={{ width: size, height: size, borderColor: i === 0 ? 'rgba(255,107,53,0.15)' : i === 1 ? 'rgba(0,212,255,0.2)' : 'rgba(168,85,247,0.25)' }}
                                        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 1, 0.4] }}
                                        transition={{ repeat: Infinity, duration: 2 + i * 0.5, delay: i * 0.3 }} />
                                ))}

                                {/* Orbiting AWS service pills */}
                                {[
                                    { label: 'Nova Pro', color: '#00D4FF', angle: 0 },
                                    { label: 'Nova Reel', color: '#00FF88', angle: 72 },
                                    { label: 'Bedrock', color: '#FF9900', angle: 144 },
                                    { label: 'Nova Sonic', color: '#A855F7', angle: 216 },
                                    { label: 'Guardrails', color: '#F7C948', angle: 288 },
                                ].map((item, i) => (
                                    <motion.div key={item.label}
                                        className="absolute text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                                        style={{
                                            color: item.color,
                                            background: `${item.color}20`,
                                            border: `1px solid ${item.color}50`,
                                            transformOrigin: '0 0'
                                        }}
                                        animate={{ rotate: [item.angle, item.angle + 360] }}
                                        transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                                    >
                                        <motion.span style={{ display: 'inline-block' }}
                                            animate={{ rotate: [0, -360] }}
                                            transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}>
                                            {item.label}
                                        </motion.span>
                                    </motion.div>
                                ))}

                                {/* Core orb */}
                                <motion.div className="w-20 h-20 rounded-full flex items-center justify-center relative z-10"
                                    style={{ background: 'radial-gradient(circle, #FF6B35 0%, #A855F7 50%, #00D4FF 100%)' }}
                                    animate={{ scale: [1, 1.12, 1], boxShadow: ['0 0 30px rgba(255,107,53,0.5)', '0 0 60px rgba(168,85,247,0.7)', '0 0 30px rgba(0,212,255,0.5)'] }}
                                    transition={{ repeat: Infinity, duration: 2.5 }}>
                                    <span className="text-3xl">🤖</span>
                                </motion.div>
                            </div>

                            {/* Text */}
                            <motion.h2 className="text-4xl font-black font-poppins gradient-text mb-3 text-center"
                                animate={{ opacity: [0.8, 1, 0.8] }} transition={{ repeat: Infinity, duration: 2 }}>
                                Creating Your Campaign
                            </motion.h2>

                            {/* Rotating AI facts */}
                            <motion.div className="text-center mb-8 h-8"
                                key={currentStage}
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <p className="text-slate-400 text-sm font-mono">
                                    {[
                                        '☁️ Amazon Bedrock — Processing your idea with Foundation Models...',
                                        '🤖 Nova Pro — Researching regional trends and cultural context...',
                                        '🎬 Nova Reel — Generating visual content for your campaign...',
                                        '🛡️ Guardrails — Checking cultural sensitivity across 22 languages...',
                                        '⚡ Finalizing and publishing to all platforms...',
                                    ][Math.min(currentStage, 4)] || '🚀 Amazon Bedrock AI is at work...'}
                                </p>
                            </motion.div>

                            {/* Progress bar */}
                            <div className="w-80 h-2 bg-white/5 rounded-full overflow-hidden mb-6">
                                <motion.div className="h-full rounded-full"
                                    style={{ background: 'linear-gradient(90deg, #FF6B35, #F7C948, #00D4FF)' }}
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${Math.min(((currentStage + 1) / 5) * 100, 100)}%` }}
                                    transition={{ duration: 0.8 }} />
                            </div>

                            {/* AWS powered badge */}
                            <motion.div className="flex items-center gap-2 px-4 py-2 rounded-full"
                                style={{ background: 'rgba(255,153,0,0.1)', border: '1px solid rgba(255,153,0,0.3)' }}
                                animate={{ scale: [1, 1.04, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                                <span className="text-lg">☁️</span>
                                <span className="text-xs font-bold text-orange-400">Powered by Amazon Bedrock</span>
                                <motion.span className="w-2 h-2 rounded-full bg-orange-400"
                                    animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }} />
                            </motion.div>
                        </motion.div>
                    )}

                    {/* STEP 3: RESULTS */}
                    {step === 3 && campaignResult?.content && (
                        <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="max-w-6xl mx-auto">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-3xl font-black font-poppins gradient-text">Your Campaign is Ready! 🎉</h2>
                                    <p className="text-slate-400 capitalize">{campaignResult.title || `${businessType} Campaign`} — {campaignGoal} Focus / {tone} Tone</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleDownload} className="btn-outline text-sm flex items-center gap-1">📥 Export</button>
                                    <button onClick={() => setStep(1)} className="btn-outline text-sm">← New</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                                {/* BharatScore */}
                                <BharatScore {...campaignResult.bharatScore!} />

                                {/* Publish panel */}
                                <div className="lg:col-span-2 glass-card p-6">
                                    <h3 className="font-bold font-poppins text-white mb-4">Publish To</h3>
                                    <div className="flex flex-wrap gap-3 mb-6">
                                        {PLATFORMS.map(p => (
                                            <button key={p.id} onClick={() => togglePlatform(p.id)}
                                                className={`px - 4 py - 2 rounded - xl text - sm font - medium flex items - center gap - 2 transition - all border ${selectedPlatforms.includes(p.id) ? 'text-white' : 'text-slate-400 border-white/10 hover:border-white/20'
                                                    } `}
                                                style={selectedPlatforms.includes(p.id) ? { background: `${p.color} 30`, borderColor: p.color } : {}}>
                                                <span>{p.emoji}</span> {p.name}
                                            </button>
                                        ))}
                                    </div>

                                    {publishSuccess ? (
                                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                            className="text-center py-6 rounded-xl" style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.2)' }}>
                                            <div className="text-5xl mb-3">🎉</div>
                                            <h3 className="text-green-400 font-bold text-xl font-poppins">Campaign Published!</h3>
                                            <p className="text-slate-400 text-sm mt-2">
                                                Published to {selectedPlatforms.length} platforms. Estimated reach: 24,000 users.
                                            </p>
                                        </motion.div>
                                    ) : (
                                        <button onClick={handlePublishAll} className="btn-primary w-full text-base py-3">
                                            🚀 Publish to {selectedPlatforms.length} Platform{selectedPlatforms.length !== 1 ? 's' : ''}
                                        </button>
                                    )}

                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        <div className="glass-card p-3 text-center">
                                            <p className="text-lg font-bold text-white">
                                                {campaignResult.content?.distribution?.bestTime || `${Math.floor(Math.random() * 4) + 5}:00 PM IST`}
                                            </p>
                                            <p className="text-xs text-slate-400">Best post time</p>
                                        </div>
                                        <div className="glass-card p-3 text-center">
                                            <p className="text-lg font-bold gradient-text">
                                                ₹{(Math.random() * 2 + 0.5).toFixed(2)}
                                            </p>
                                            <p className="text-xs text-slate-400">Generation cost</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content tabs */}
                            <div className="glass-card p-6">
                                <div className="flex flex-wrap gap-1 mb-6 bg-white/5 rounded-xl p-1">
                                    {[
                                        { key: 'images', label: '📸 Images', condition: selectedPlatforms.includes('instagram') || selectedPlatforms.includes('facebook') || selectedPlatforms.includes('linkedin') || selectedPlatforms.includes('twitter') },
                                        { key: 'captions', label: '� Captions', condition: true }, // Always show captions
                                        { key: 'whatsapp', label: '💬 WhatsApp', condition: selectedPlatforms.includes('whatsapp') },
                                        { key: 'storyboard', label: '🎬 Reel', condition: selectedPlatforms.includes('instagram') || selectedPlatforms.includes('youtube') || selectedPlatforms.includes('facebook') },
                                        { key: 'seo', label: '🔍 SEO', condition: true },
                                        { key: 'remixer', label: '🔄 Remix', condition: true }
                                    ].filter(t => t.condition).map(tab => (
                                        <button key={tab.key} onClick={() => setActiveTab(tab.key as TabKey)}
                                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? 'text-black font-semibold' : 'text-slate-400 hover:text-white'}`}
                                            style={activeTab === tab.key ? { background: 'linear-gradient(135deg, #FF6B35, #F7C948)' } : {}}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {activeTab === 'images' && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {campaignResult.content.images.map(img => (
                                            <CampaignCard key={img.id} item={img} />
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'captions' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(campaignResult.content.captions).map(([platform, caption]) => (
                                            <div key={platform} className="glass-card p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="capitalize font-semibold text-sm text-white">{platform}</span>
                                                </div>
                                                <p className="text-slate-300 text-sm whitespace-pre-line line-clamp-6">{caption}</p>
                                                <button onClick={() => { navigator.clipboard.writeText(String(caption)); success('Caption copied! 📋'); }}
                                                    className="mt-2 text-xs text-orange-400 hover:text-orange-300">
                                                    📋 Copy
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'seo' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="glass-card p-4">
                                            <h4 className="font-bold text-white mb-2 text-sm">SEO Title</h4>
                                            <p className="text-slate-300 text-sm">{campaignResult.content.seo.title}</p>
                                            <h4 className="font-bold text-white mb-2 text-sm mt-4">Meta Description</h4>
                                            <p className="text-slate-300 text-sm">{campaignResult.content.seo.metaDescription}</p>
                                        </div>
                                        <div className="glass-card p-4">
                                            <h4 className="font-bold text-white mb-3 text-sm">Keywords ({campaignResult.content.seo.keywords.length})</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {campaignResult.content.seo.keywords.map(kw => (
                                                    <span key={kw} className="px-2 py-1 text-xs rounded-lg text-cyan-400 bg-cyan-400/10 border border-cyan-400/20">
                                                        {kw}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'whatsapp' && (
                                    <div className="flex flex-col md:flex-row gap-6 items-start justify-center">
                                        <PhoneMockup platform="whatsapp">
                                            <WhatsAppPreview
                                                message={campaignResult.content.whatsapp.message}
                                                businessName={businessType}
                                            />
                                        </PhoneMockup>
                                        <div className="glass-card p-5 max-w-sm flex flex-col gap-3">
                                            <h4 className="font-bold text-white">WhatsApp Status</h4>
                                            <div className="p-3 rounded-lg bg-green-400/10 border border-green-400/20 text-sm text-slate-300 whitespace-pre-line">
                                                {campaignResult.content.whatsapp.statusText}
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 mb-1">Optimal send time:</p>
                                                <p className="text-orange-400 font-mono font-semibold">9:00 AM IST · 490M reach</p>
                                            </div>

                                            {/* Upload / Share buttons */}
                                            <div className="flex flex-col gap-2 pt-1">
                                                {/* Primary: Web Share API (mobile) or clipboard + WhatsApp Web */}
                                                <motion.button
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={async () => {
                                                        const statusText = campaignResult.content?.whatsapp?.statusText || 'Check out my campaign!';
                                                        if (navigator.share) {
                                                            try {
                                                                await navigator.share({ text: statusText });
                                                            } catch { /* user cancelled */ }
                                                        } else {
                                                            await navigator.clipboard.writeText(statusText);
                                                            success('Status text copied! 📋 Opening WhatsApp Web...');
                                                            setTimeout(() => window.open('https://web.whatsapp.com', '_blank'), 800);
                                                        }
                                                    }}
                                                    className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                                                    style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#fff' }}
                                                >
                                                    📤 Post to WhatsApp Status
                                                </motion.button>

                                                {/* Secondary: Direct WhatsApp message link with text */}
                                                <a
                                                    href={`https://wa.me/?text=${encodeURIComponent(campaignResult.content.whatsapp.statusText)}`}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-80"
                                                    style={{ background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.35)', color: '#25D366' }}
                                                >
                                                    💬 Send as WhatsApp Message
                                                </a>

                                                <p className="text-[10px] text-slate-500 text-center font-mono">
                                                    On mobile: tap "Post to Status" → share directly.<br />
                                                    On desktop: text is copied → paste in WhatsApp Web Status.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'storyboard' && (() => {
                                    const cap = campaignResult?.content?.captions;
                                    const biz = businessType;
                                    const reg = regions[0] || 'India';
                                    const inp = textInput.slice(0, 80);
                                    const reelFrames = [
                                        { time: '0:00', emoji: '🎬', visual: `Opening shot focusing on: ${inp}`, narration: `${inp.split('.')[0] || cap?.instagram?.split('\n')[0]}`, transition: 'Fade in' },
                                        { time: '0:03', emoji: '✨', visual: `Dynamic transition highlighting key features from: ${inp}`, narration: `Experience the best of ${biz}. ${inp.substring(0, 50)}...`, transition: 'Slide left' },
                                        { time: '0:07', emoji: '🙌', visual: `Happy customer enjoying ${biz} in ${reg}`, narration: `${cap?.whatsapp?.split('\n')[2] || `Trusted across ${reg}`}`, transition: 'Zoom in' },
                                        { time: '0:11', emoji: '🎁', visual: `Promo offer banner displaying details from prompt`, narration: `Special offer! Check description for details.`, transition: 'Flash' },
                                        { time: '0:14', emoji: '📱', visual: `Contact information and social handles`, narration: `Follow us for more! #${biz.replace(/\s+/g, '')}`, transition: 'Fade out' },
                                    ];
                                    return <VideoStoryboard
                                        frames={reelFrames}
                                        title={`15-Second Reel — ${biz} · ${reg}`}
                                    />;
                                })()}

                                {activeTab === 'remixer' && campaignResult?.content?.captions && (
                                    <div className="space-y-4">
                                        {Object.entries(campaignResult.content.captions).slice(0, 2).map(([platform, caption]) => (
                                            <ContentRemixer
                                                key={platform}
                                                originalCaption={String(caption)}
                                                platform={platform}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Fixed Action Bar for Step 1 */}
                <AnimatePresence>
                    {step === 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="fixed bottom-6 left-6 right-6 lg:left-[calc(16rem+1.5rem)] z-[100] glass-card p-4 rounded-2xl border border-white/10 flex items-center justify-between backdrop-blur-2xl bg-[#0f111a]/90 shadow-2xl shadow-orange-500/20"
                        >
                            <div className="flex items-center gap-4 text-sm font-medium">
                                <div className="flex -space-x-2">
                                    {['🤖', '⚡', '✨'].map((e, i) => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-xs relative z-10" style={{ zIndex: 3 - i }}>{e}</div>
                                    ))}
                                </div>
                                <div className="hidden sm:block">
                                    <div className="text-white">Amazon Bedrock AI</div>
                                    <div className="text-slate-400 text-xs text-left">Enterprise-grade generation</div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={handleVoiceDemo} className="px-5 py-3 rounded-xl font-bold transition-all text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 text-sm flex items-center gap-2">
                                    🎙️ Auto Fill Demo
                                </button>
                                <button onClick={handleSubmit} disabled={!textInput && inputMode === 'text'}
                                    className="px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:shadow-[0_0_30px_rgba(255,107,53,0.5)] transform hover:-translate-y-0.5 active:translate-y-0 text-sm flex items-center gap-2"
                                    style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #f97316 100%)' }}>
                                    🚀 Generate Campaign
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div >
    );
}
