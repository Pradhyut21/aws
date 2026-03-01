import type { Campaign } from '../services/store';
import { invokeNovaPro } from '../services/bedrock';

interface ResearchOutput {
    trendingFormats: string[];
    demographics: string;
    bestPostingTimes: Record<string, string>;
    hashtags: string[];
    culturalContext: string;
    competitorInsights: string;
}

// Research Agent — Real Nova Pro
export async function runResearchAgent(campaign: Campaign): Promise<ResearchOutput> {
    const regionStr = campaign.region.join(', ');

    const prompt = `You are a social media research expert for Indian businesses. Analyze this campaign and provide insights:

Business Type: ${campaign.businessType}
Language: ${campaign.language}
Regions: ${regionStr}
Input: ${campaign.input}

Provide ONLY valid JSON (no markdown, no explanation):
{
  "trendingFormats": ["format1", "format2", "format3"],
  "demographics": "description of target audience",
  "bestPostingTimes": {"instagram": "7:00 PM IST", "facebook": "12:00 PM IST", "whatsapp": "9:00 AM IST", "youtube": "6:00 PM IST"},
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"],
  "culturalContext": "cultural insights for ${regionStr}",
  "competitorInsights": "what competitors are doing"
}`;

    try {
        const response = await invokeNovaPro(prompt, 1000);
        console.log('Research response:', response);

        // Extract JSON from response (handle markdown code blocks)
        let jsonStr = response.trim();
        if (jsonStr.includes('```json')) {
            jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
        } else if (jsonStr.includes('```')) {
            jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
        }

        return JSON.parse(jsonStr);
    } catch (error) {
        console.warn('Research agent failed (possibly rate limited), using fallback data:', error);
        return {
            trendingFormats: ['Reels with local music', 'Carousel showing process', 'Customer testimonials'],
            demographics: `Local audience in ${regionStr}, aged 25-45`,
            bestPostingTimes: { instagram: "7:00 PM IST", facebook: "12:00 PM IST", whatsapp: "9:00 AM IST", youtube: "6:00 PM IST" },
            hashtags: [`#${campaign.businessType.replace(/\s+/g, '')}`, '#VocalForLocal', `#${campaign.region[0]?.replace(/\s+/g, '')}Business`],
            culturalContext: `Highlighting the authenticity and local craftsmanship of ${regionStr}`,
            competitorInsights: 'Competitors are focusing on discounts; we should focus on quality and heritage.'
        };
    }
}
