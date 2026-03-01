"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCreativeSwarm = runCreativeSwarm;
const bedrock_1 = require("../services/bedrock");
async function runCreativeSwarm(campaign, research) {
    const lang = campaign.language;
    const langMap = {
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
        const parseJsonString = (str) => {
            let clean = str.trim();
            if (clean.includes('```json'))
                clean = clean.split('```json')[1].split('```')[0].trim();
            else if (clean.includes('```'))
                clean = clean.split('```')[1].split('```')[0].trim();
            return JSON.parse(clean);
        };
        // Get captions from Nova Omni
        const captionsResponse = await (0, bedrock_1.invokeNovaOmni)(contentPrompt, 1000);
        const captions = parseJsonString(captionsResponse);
        // Get video script from Nova Reel
        const videoResponse = await (0, bedrock_1.invokeNovaReel)(videoPrompt, 500);
        const videoScript = parseJsonString(videoResponse);
        // Generate image from Titan
        let imageUrl = 'https://picsum.photos/seed/bm1/800/600';
        try {
            imageUrl = await (0, bedrock_1.generateTitanImage)(imagePrompt, 800, 600);
        }
        catch (imgError) {
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
    }
    catch (error) {
        console.error('Creative swarm error:', error);
        // Language-aware fallback content
        const greetings = {
            hi: 'नमस्ते! 🙏', ta: 'வணக்கம்! 🙏', te: 'నమస్కారం! 🙏',
            kn: 'ನಮಸ್ಕಾರ! 🙏', ml: 'നമസ്കാരം! 🙏', bn: 'নমস্কার! 🙏',
            mr: 'नमस्कार! 🙏', gu: 'નમસ્તે! 🙏', pa: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! 🙏',
            ur: 'السلام علیکم! 🙏', en: 'Hello! 👋',
        };
        const greet = greetings[lang] || 'Hello! 👋';
        const region0 = campaign.region[0] || 'India';
        const biz = campaign.businessType;
        const igCaptions = {
            hi: `✨ ${biz} में खास ऑफर! 🎁\n${campaign.input.slice(0, 80)}\n\n#${biz.replace(/\s+/g, '')} #VocalForLocal #${region0.replace(/\s+/g, '')}`,
            te: `✨ ${biz}లో ప్రత్యేక ఆఫర్! 🎁\n${campaign.input.slice(0, 80)}\n\n#${biz.replace(/\s+/g, '')} #VocalForLocal #${region0.replace(/\s+/g, '')}`,
            ta: `✨ ${biz}லில் சிறப்பு சலுகை! 🎁\n${campaign.input.slice(0, 80)}\n\n#${biz.replace(/\s+/g, '')} #VocalForLocal #${region0.replace(/\s+/g, '')}`,
            ml: `✨ ${biz}-ൽ പ്രത്യേക ഓഫർ! 🎁\n${campaign.input.slice(0, 80)}\n\n#${biz.replace(/\s+/g, '')} #VocalForLocal #Kerala`,
            kn: `✨ ${biz}ದಲ್ಲಿ ವಿಶೇಷ ಕೊಡುಗೆ! 🎁\n${campaign.input.slice(0, 80)}\n\n#${biz.replace(/\s+/g, '')} #VocalForLocal`,
            bn: `✨ ${biz}-এ বিশেষ অফার! 🎁\n${campaign.input.slice(0, 80)}\n\n#${biz.replace(/\s+/g, '')} #VocalForLocal`,
            en: `✨ Special offer on ${biz}! 🎁\n${campaign.input.slice(0, 80)}\n\n#${biz.replace(/\s+/g, '')} #MadeInIndia`,
        };
        const waMessages = {
            hi: `${greet}\n\n*${biz}* — ${region0}\n\n${campaign.input.slice(0, 100)}\n\n✅ गुणवत्ता की गारंटी\n✅ होम डिलीवरी उपलब्ध`,
            te: `${greet}\n\n*${biz}* — ${region0}\n\n${campaign.input.slice(0, 100)}\n\n✅ నాణ్యత హామీ\n✅ హోమ్ డెలివరీ`,
            ta: `${greet}\n\n*${biz}* — ${region0}\n\n${campaign.input.slice(0, 100)}\n\n✅ தரம் உறுதி\n✅ வீட்டு விநியோகம்`,
            ml: `${greet}\n\n*${biz}* — ${region0}\n\n${campaign.input.slice(0, 100)}\n\n✅ ഗുണമേന്മ ഉറപ്പ്\n✅ ഹോം ഡെലിവറി`,
            en: `${greet}\n\n*${biz}* — ${region0}\n\n${campaign.input.slice(0, 100)}\n\n✅ Quality guaranteed\n✅ Home delivery available`,
        };
        const igCaption = igCaptions[lang] || igCaptions['en'];
        const waMessage = waMessages[lang] || waMessages['en'];
        return {
            images: [
                { id: 'img-1', url: `https://picsum.photos/seed/${biz.replace(/\s+/g, '')}-ig/800/600`, platform: 'instagram', caption: igCaption },
                { id: 'img-2', url: `https://picsum.photos/seed/${biz.replace(/\s+/g, '')}-fb/800/600`, platform: 'facebook', caption: `${greet} — ${biz} in ${region0}` },
                { id: 'img-3', url: `https://picsum.photos/seed/${biz.replace(/\s+/g, '')}-wa/800/600`, platform: 'whatsapp', caption: waMessage },
                { id: 'img-4', url: `https://picsum.photos/seed/${biz.replace(/\s+/g, '')}-yt/800/600`, platform: 'youtube', caption: `${biz} — Best in ${region0} 🌟` },
            ],
            captions: {
                instagram: igCaption,
                facebook: `${greet} ${campaign.input.slice(0, 120)}\n\n✅ ${region0} based\n✅ Fast delivery`,
                twitter: `${campaign.input.slice(0, 100)} #${biz.replace(/\s+/g, '')} #MadeInIndia`,
                youtube: `🎬 ${biz} — ${region0}\n\n${campaign.input}`,
                whatsapp: waMessage,
                linkedin: `${greet} Proud to share our ${biz} story from ${region0}. ${campaign.input.slice(0, 100)}`,
            },
            seo: {
                title: `Best ${biz} in ${region0} — Special Offer 2026`,
                metaDescription: `Authentic ${biz} from ${campaign.region.join(', ')}. Quality guaranteed, fast delivery.`,
                keywords: [`${biz} ${region0}`, `best ${biz} online`, `local ${biz} ${region0}`, `buy ${biz} ${region0}`],
            },
            hashtags: [`#${biz.replace(/\s+/g, '')}`, '#VocalForLocal', '#MadeInIndia', `#${region0.replace(/\s+/g, '')}Business`, '#IndianSMB'],
            whatsapp: {
                message: waMessage,
                statusText: `✨ Special Offer! ${biz} — ${region0} 🎁`,
            },
        };
    }
}
