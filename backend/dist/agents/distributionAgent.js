"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runDistributionAgent = runDistributionAgent;
const bedrock_1 = require("../services/bedrock");
// Distribution Agent — Real Nova Sonic
async function runDistributionAgent(campaign, creative) {
    const prompt = `Analyze this campaign and suggest optimal distribution strategy:

Business: ${campaign.businessType}
Regions: ${campaign.region.join(', ')}
Language: ${campaign.language}
Input: ${campaign.input}

Provide JSON:
{
  "publishTimes": {"instagram": "time IST", "facebook": "time IST", "whatsapp": "time IST", "youtube": "time IST", "twitter": "time IST"},
  "suggestedInfluencers": ["influencer1", "influencer2", "influencer3"],
  "estimatedReach": number
}`;
    try {
        const response = await (0, bedrock_1.invokeNovaSonic)(prompt, 500);
        let clean = response.trim();
        if (clean.includes('```json')) {
            clean = clean.split('```json')[1].split('```')[0].trim();
        }
        else if (clean.includes('```')) {
            clean = clean.split('```')[1].split('```')[0].trim();
        }
        const parsed = JSON.parse(clean);
        return parsed;
    }
    catch (error) {
        console.error('Distribution agent error:', error);
        // Fallback to mock data
        return {
            publishTimes: {
                instagram: '7:00 PM IST',
                facebook: '12:00 PM IST',
                whatsapp: '9:00 AM IST',
                youtube: '6:00 PM IST',
                twitter: '11:00 AM IST',
            },
            suggestedInfluencers: [
                `@${campaign.region[0]?.toLowerCase().replace(/ /g, '_')}_lifestyle`,
                '@india_crafts_creator',
                '@local_bharat_explorer',
            ],
            estimatedReach: 24000 + Math.floor(Math.random() * 5000),
        };
    }
}
