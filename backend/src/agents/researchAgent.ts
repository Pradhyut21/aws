/**
 * Research Agent — Strands Agent-as-Tool pattern
 *
 * Tool: "research_market"
 * Model: us.amazon.nova-pro-v1:0 (best reasoning for market analysis)
 *
 * Pulls contextual signals for the campaign's region + business type.
 * Output is evidence-tagged so the Agent Trace panel can show WHY
 * each recommendation was made.
 */

import { Agent, tool } from '../lib/strands';
import { invokeNovaPro } from '../services/bedrock';
import type { Campaign } from '../services/store';
import { getUserLessons } from '../services/v3store';

export interface ResearchOutput {
    trendingFormats: string[];
    demographics: string;
    bestPostingTimes: Record<string, string>;
    hashtags: string[];
    culturalContext: string;
    competitorInsights: string;
    evidence: string[];          // V3: traceable sources / signals
    historicalLessons?: string[]; // V3: from LearningMemory
}

const researchTool = tool<{ campaign: Campaign; lessons: string[] }, ResearchOutput>({
    name: 'research_market',
    description: 'Research market trends, audience demographics, and competitor insights for an Indian SMB campaign',
    handler: async ({ campaign, lessons }) => {
        const regionStr = campaign.region.join(', ');
        const lessonsCtx = lessons.length > 0
            ? `\nPrevious campaign lessons for this business:\n${lessons.map((l, i) => `${i + 1}. ${l}`).join('\n')}`
            : '';

        const prompt = `You are a social media research expert for Indian businesses with deep regional knowledge.
Analyze this campaign and provide evidence-backed insights.${lessonsCtx}

Business Type: ${campaign.businessType}
Language: ${campaign.language}
Regions: ${regionStr}
Campaign Goal: ${campaign.input}

Return ONLY valid JSON (no markdown):
{
  "trendingFormats": ["format with brief reason", "format2", "format3"],
  "demographics": "specific description of target audience in ${regionStr}",
  "bestPostingTimes": {"instagram": "HH:MM AM/PM IST", "facebook": "...", "whatsapp": "...", "youtube": "...", "twitter": "..."},
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6"],
  "culturalContext": "specific cultural insights for ${regionStr} including relevant festivals or local events",
  "competitorInsights": "what businesses similar to ${campaign.businessType} are doing, and the gap opportunity",
  "evidence": [
    "Signal 1: <what was observed and why it matters>",
    "Signal 2: <specific regional/demographic insight>",
    "Signal 3: <competitive or seasonal observation>"
  ]
}`;

        const response = await invokeNovaPro(prompt, 1200);
        let jsonStr = response.trim();
        if (jsonStr.includes('```json')) jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
        else if (jsonStr.includes('```')) jsonStr = jsonStr.split('```')[1].split('```')[0].trim();

        const parsed = JSON.parse(jsonStr);
        return { ...parsed, historicalLessons: lessons };
    },
});

export async function runResearchAgent(campaign: Campaign): Promise<ResearchOutput> {
    // Fetch historical lessons from LearningMemory (V3)
    let lessons: string[] = [];
    try {
        const storedLessons = await getUserLessons(campaign.userId, 5);
        lessons = storedLessons
            .filter(l => l.businessType === campaign.businessType || l.region.some(r => campaign.region.includes(r)))
            .map(l => l.lesson);
    } catch {
        // Non-critical — proceed without lessons
    }

    const agent = new Agent({
        modelId:   'us.amazon.nova-pro-v1:0',
        maxTokens: 1200,
    });
    agent.registerTool(researchTool);

    try {
        const output = await agent.invoke(JSON.stringify({ campaign, lessons })) as ResearchOutput;
        console.log('✅ Research Agent completed');
        return output;
    } catch (error) {
        console.warn('Research agent failed, using contextual fallback:', error);
        return {
            trendingFormats: ['Short-form video with local music', 'Carousel showing process/behind-scenes', 'Customer testimonial reels'],
            demographics:    `Local audience in ${campaign.region.join(', ')}, aged 22–45, mobile-first`,
            bestPostingTimes: { instagram: '7:00 PM IST', facebook: '12:00 PM IST', whatsapp: '9:00 AM IST', youtube: '6:00 PM IST', twitter: '11:00 AM IST' },
            hashtags: [`#${campaign.businessType.replace(/\s+/g, '')}`, '#VocalForLocal', '#MadeInIndia', `#${(campaign.region[0] || 'India').replace(/\s+/g, '')}`, '#IndianSMB', '#LocalBusiness'],
            culturalContext:    `Authentic local craftsmanship from ${campaign.region[0] || 'India'} — emphasise heritage and quality over price`,
            competitorInsights: 'Competitors focus on discounts; opportunity to differentiate on quality, story, and cultural authenticity',
            evidence:           ['Fallback: Bedrock call unavailable — using regional knowledge base defaults'],
            historicalLessons:  lessons,
        };
    }
}
