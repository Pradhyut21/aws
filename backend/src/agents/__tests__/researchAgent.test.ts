/**
 * Unit tests — Research Agent (backend/src/agents/researchAgent.ts)
 *
 * Strategy:
 *   - Mock invokeNovaPro so no Bedrock calls are made
 *   - Mock getUserLessons so no DynamoDB calls are made
 *   - Test that the agent parses valid JSON, falls back gracefully on error,
 *     and correctly incorporates historical lessons into the output
 */

jest.mock('@aws-sdk/client-dynamodb', () => ({
    DynamoDBClient: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('@aws-sdk/lib-dynamodb', () => ({
    DynamoDBDocumentClient: {
        from: jest.fn().mockReturnValue({ send: jest.fn() }),
    },
    PutCommand: jest.fn(),
    GetCommand: jest.fn(),
    QueryCommand: jest.fn(),
}));

jest.mock('@aws-sdk/client-bedrock-runtime', () => ({
    BedrockRuntimeClient: jest.fn().mockImplementation(() => ({ send: jest.fn() })),
    InvokeModelCommand: jest.fn(),
}));

jest.mock('@aws-sdk/client-s3', () => ({
    S3Client: jest.fn().mockImplementation(() => ({ send: jest.fn() })),
    PutObjectCommand: jest.fn(),
}));

// Mock the Bedrock service (used by the Agent internally)
jest.mock('../../services/bedrock', () => ({
    invokeNovaPro: jest.fn(),
}));

// Mock DynamoDB lesson store
jest.mock('../../services/v3store', () => ({
    getUserLessons: jest.fn(),
}));

import { runResearchAgent, ResearchOutput } from '../researchAgent';
import { invokeNovaPro } from '../../services/bedrock';
import { getUserLessons } from '../../services/v3store';
import type { Campaign } from '../../services/store';

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const mockCampaign: Campaign = {
    id: 'campaign-001',
    userId: 'user-abc',
    businessType: 'restaurant',
    language: 'hi',
    region: ['Mumbai', 'Pune'],
    input: 'Launch our new thali menu for Diwali',
    inputType: 'text',
    status: 'processing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

const validResearchJson: ResearchOutput = {
    trendingFormats: ['Short reels with regional music', 'Carousel behind-the-scenes'],
    demographics: 'Urban families aged 28–50 in Mumbai and Pune',
    bestPostingTimes: {
        instagram: '7:00 PM IST',
        facebook: '12:00 PM IST',
        whatsapp: '9:00 AM IST',
        youtube: '6:00 PM IST',
        twitter: '11:00 AM IST',
    },
    hashtags: ['#MumbaiFood', '#DiwaliSpecial', '#ThaliLovers', '#MadeInIndia'],
    culturalContext: 'Diwali is peak festive season — emphasise family and celebration',
    competitorInsights: 'Competitors focus on discounts; differentiate on authenticity',
    evidence: ['Signal 1: Festival season drives 3x engagement', 'Signal 2: Short-form video preferred'],
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('runResearchAgent', () => {
    const mockInvokeNovaPro = invokeNovaPro as jest.MockedFunction<typeof invokeNovaPro>;
    const mockGetUserLessons = getUserLessons as jest.MockedFunction<typeof getUserLessons>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetUserLessons.mockResolvedValue([]);
    });

    it('returns a valid ResearchOutput when Bedrock responds with correct JSON', async () => {
        mockInvokeNovaPro.mockResolvedValue(JSON.stringify(validResearchJson));

        const result = await runResearchAgent(mockCampaign);

        expect(result).toMatchObject({
            trendingFormats: expect.arrayContaining([expect.any(String)]),
            demographics: expect.any(String),
            hashtags: expect.arrayContaining([expect.any(String)]),
            culturalContext: expect.any(String),
            evidence: expect.arrayContaining([expect.any(String)]),
        });
        expect(result.bestPostingTimes).toHaveProperty('instagram');
    });

    it('incorporates historical lessons into the output when getUserLessons returns data', async () => {
        const lessons = [
            {
                id: 'lesson-001',
                userId: 'user-abc',
                businessType: 'restaurant',
                region: ['Mumbai'],
                language: 'hi',
                lesson: 'Festival content performed 40% better with cultural visuals',
                strategy: 'hi content for restaurant',
                result: 'BharatScore: 88/100',
                campaignId: 'prev-001',
                createdAt: new Date().toISOString(),
            },
        ];
        mockGetUserLessons.mockResolvedValue(lessons);
        mockInvokeNovaPro.mockResolvedValue(JSON.stringify(validResearchJson));

        const result = await runResearchAgent(mockCampaign);
        expect(result.historicalLessons).toContain(lessons[0].lesson);
    });

    it('returns fallback output when invokeNovaPro throws', async () => {
        mockInvokeNovaPro.mockRejectedValue(new Error('Bedrock unavailable'));

        const result = await runResearchAgent(mockCampaign);

        // Fallback should still be a valid ResearchOutput
        expect(result.trendingFormats.length).toBeGreaterThan(0);
        expect(result.hashtags.length).toBeGreaterThan(0);
        expect(result.evidence[0]).toMatch(/Fallback|fallback/);
    });

    it('proceeds without historical lessons when getUserLessons throws', async () => {
        mockGetUserLessons.mockRejectedValue(new Error('DynamoDB unavailable'));
        mockInvokeNovaPro.mockResolvedValue(JSON.stringify(validResearchJson));

        // Should not throw — lessons are non-critical
        const result = await runResearchAgent(mockCampaign);
        expect(result).toBeDefined();
    });
});
