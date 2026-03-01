import type { Campaign } from '../services/store';
import { invokeNovaOmni, invokeNovaReel, generateTitanImage } from '../services/bedrock';

interface CreativeOutput {
    images: Array<{ id: string; url: string; platform: string; caption?: string }>;
    captions: Record<string, string>;
    seo: { title: string; metaDescription: string; keywords: string[] };
    hashtags: string[];
    whatsapp: { message: string; statusText: string };
}

export async function runCreativeSwarm(campaign: Campaign, research: object): Promise<CreativeOutput> {
    const lang = campaign.language;
    const langMap: Record<string, string> = {
        hi: 'Hindi', ta: 'Tamil', bn: 'Bengali', te: 'Telugu',
        kn: 'Kannada', ml: 'Malayalam', mr: 'Marathi', gu: 'Gujarati',
        pa: 'Punjabi', ur: 'Urdu', en: 'English'
    };
    const langName = langMap[lang] || 'Hindi';

    // Generate content using Nova Omni
    const contentPrompt = `Create social media content for this campaign in ${langName}:

Business: ${campaign.businessType}
Input: ${campaign.input}
Regions: ${campaign.region.join(', ')}
Language: ${langName}

Generate JSON with:
{
  "instagram": "engaging caption with emojis",
  "facebook": "friendly caption",
  "twitter": "concise tweet",
  "youtube": "video description",
  "whatsapp": "personal message",
  "linkedin": "professional post"
}`;

    // Generate video script using Nova Reel
    const videoPrompt = `Create a 15-second video script in ${langName} for:
${campaign.input}

Format:
{
  "hook": "first 3 seconds to grab attention",
  "script": "main message",
  "cta": "call to action"
}`;

    // Generate image prompt for Titan
    const imagePrompt = `Create a professional product image for: ${campaign.input}. Style: modern, vibrant, Indian aesthetic. High quality, 1024x1024.`;

    try {
        // Helper to parse potential markdown JSON
        const parseJsonString = (str: string) => {
            let clean = str.trim();
            if (clean.includes('```json')) clean = clean.split('```json')[1].split('```')[0].trim();
            else if (clean.includes('```')) clean = clean.split('```')[1].split('```')[0].trim();
            return JSON.parse(clean);
        };

        // Get captions from Nova Omni
        const captionsResponse = await invokeNovaOmni(contentPrompt, 1000);
        const captions = parseJsonString(captionsResponse);

        // Get video script from Nova Reel
        const videoResponse = await invokeNovaReel(videoPrompt, 500);
        const videoScript = parseJsonString(videoResponse);

        // Generate image from Titan
        let imageUrl = 'https://picsum.photos/seed/bm1/800/600';
        try {
            imageUrl = await generateTitanImage(imagePrompt, 800, 600);
        } catch (imgError) {
            console.log('Image generation skipped, using placeholder');
        }

        return {
            images: [
                { id: 'img-1', url: imageUrl, platform: 'instagram', caption: captions.instagram },
                { id: 'img-2', url: imageUrl, platform: 'facebook', caption: captions.facebook },
                { id: 'img-3', url: imageUrl, platform: 'whatsapp', caption: captions.whatsapp },
                { id: 'img-4', url: imageUrl, platform: 'youtube', caption: captions.youtube },
            ],
            captions: {
                instagram: captions.instagram || '✨ Special offer! #MadeInIndia',
                facebook: captions.facebook || 'Quality products, authentic craftsmanship',
                twitter: captions.twitter || '🎁 Special offer - limited time!',
                youtube: captions.youtube || 'Watch our story',
                whatsapp: captions.whatsapp || '🙏 Order now!',
                linkedin: captions.linkedin || 'Proud to share our story',
            },
            seo: {
                title: `Best ${campaign.businessType} in ${campaign.region[0]} — Special Offer 2026`,
                metaDescription: `Discover authentic ${campaign.businessType} products from ${campaign.region[0]}. Free shipping, guaranteed quality.`,
                keywords: [`${campaign.businessType} ${campaign.region[0]}`, `buy ${campaign.businessType} online`, `local ${campaign.businessType}`],
            },
            hashtags: ['#MadeInIndia', '#VocalForLocal', `#${campaign.region[0]?.replace(/ /g, '')}`, '#IndianSMB', '#LocalBusiness'],
            whatsapp: {
                message: captions.whatsapp || `🙏 Special offer — 30% off on all ${campaign.businessType} products!`,
                statusText: `✨ Special Offer! ${campaign.businessType} sale — limited time 🎁`,
            },
        };
    } catch (error) {
        console.error('Creative swarm error:', error);
        // Language-aware fallback content
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

        const greet = greetings[lang] || greetings['en'];
        const promo = promoText[lang] || promoText['en'];
        const feats = features[lang] || features['en'];

        const region0 = campaign.region[0] || 'India';
        const biz = campaign.businessType;
        const bizSlug = biz.replace(/\s+/g, '');

        const inputStr = campaign.input || '';
        const cleanWords = inputStr.toLowerCase()
            .replace(/[^\w\s]/gi, '')
            .replace(/\b(i|want|need|give|me|show|an|a|the|some|any|make|create|generate|ad|campaign|for|my|in|at|this|that|please|pls|do|it|and|to|with)\b/gi, '')
            .split(/\s+/)
            .filter(w => w.length > 2)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1));

        const spellings: Record<string, string> = { 'bulding': 'building', 'matirals': 'materials', 'dheli': 'Delhi', 'bussiness': 'business', 'mambai': 'Mumbai' };
        const cleanWordsMapped = cleanWords.map(w => spellings[w.toLowerCase()] || w);
        // Use the exact business they described, or fallback
        const bizCategory = biz;
        const bizSlug = bizCategory.replace(/\s+/g, '');

        const extractedBizName = cleanWordsMapped.length > 0 ? cleanWordsMapped.join(' ') : (bizCategory.charAt(0).toUpperCase() + bizCategory.slice(1));

        const AI_HOOKS = [
            `Elevate your experience with the finest ${extractedBizName} services in ${region0}.`,
            `Your search for premium ${extractedBizName} ends here. Discover unparalleled quality!`,
            `Transforming the ${bizCategory} landscape in ${region0} with innovation and excellence.`,
            `Experience the gold standard of ${extractedBizName}. Tailored exclusively for you.`,
            `Unlocking new possibilities in ${extractedBizName} for the people of ${region0}.`
        ];
        const synthesizedPhrase = AI_HOOKS[inputStr.length % AI_HOOKS.length];

        const AI_FACTS = [
            `💡 Importance of ${extractedBizName}: High-quality ${extractedBizName} significantly boosts the local economy and elevates community standards.`,
            `💡 Why it matters: ${extractedBizName} plays a crucial role in modern lifestyle improvements and essential daily operations.`,
            `💡 The Value of ${extractedBizName}: Investing in premier ${extractedBizName} ensures long-term sustained value and outstanding market reliability.`
        ];
        const aiFact = AI_FACTS[inputStr.length % AI_FACTS.length];

        const igCaption = `✨ ${extractedBizName} — ${region0} 🎁\n${promo}\n🌟 ${synthesizedPhrase}\n\n${aiFact}\n\n#${bizSlug} #VocalForLocal #${region0.replace(/\s+/g, '')}`;
        const fbCaption = `${greet}\n\n${promo}\n🌟 ${synthesizedPhrase}\n\n${feats.join('\n')}\n📍 ${region0}\n\n${aiFact}`;
        const twCaption = `🚨 ${promo.slice(0, 80)}... 🌟 ${synthesizedPhrase.slice(0, 50)} #${bizSlug} #${region0.replace(/\s+/g, '')}`;
        const ytCaption = `🎬 ${extractedBizName} — ${region0}\n\n${promo}\n🌟 ${synthesizedPhrase}\n\n${aiFact}\n\n${feats.join(' | ')}`;
        const liCaption = `${greet} Proud to represent ${extractedBizName} from ${region0}. ${promo}\n🌟 ${synthesizedPhrase}\n\n${aiFact}\n\n#Business #${region0.replace(/\s+/g, '')}`;
        const waMessage = `${greet}\n\n*${extractedBizName}* — ${region0}\n\n${promo}\n✨ ${synthesizedPhrase}\n\n${aiFact}\n\n${feats.join('\n')}`;

        const igUrl = `https://picsum.photos/seed/${bizSlug}-ig/800/600`;
        const fbUrl = `https://picsum.photos/seed/${bizSlug}-fb/800/600`;
        const waUrl = `https://picsum.photos/seed/${bizSlug}-wa/800/600`;
        const ytUrl = `https://picsum.photos/seed/${bizSlug}-yt/800/600`;
        const ytDesc = `${biz} — ${region0} 🌟`;

        return {
            images: [
                { id: 'img-1', url: igUrl, platform: 'instagram', caption: igCaption },
                { id: 'img-2', url: fbUrl, platform: 'facebook', caption: fbCaption },
                { id: 'img-3', url: waUrl, platform: 'whatsapp', caption: waMessage },
                { id: 'img-4', url: ytUrl, platform: 'youtube', caption: ytDesc },
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
                title: `Top Rated ${extractedBizName} in ${region0} | Guaranteed Quality`,
                metaDescription: `Looking for the best ${extractedBizName} in ${region0}? We provide elite services and products designed for your needs. Contact us today!`,
                keywords: [
                    `${extractedBizName}`, `${region0}`, `premium ${extractedBizName}`, `best ${extractedBizName} online`, `local ${bizCategory} shop`
                ],
            },
            hashtags: [`#${bizSlug}`, '#VocalForLocal', '#MadeInIndia', `#${region0.replace(/\s+/g, '')}Business`, '#IndianSMB'],
            whatsapp: {
                message: waMessage,
                statusText: `✨ Special Offer! ${biz} — ${region0} 🎁`,
            },
        };
    }
}
