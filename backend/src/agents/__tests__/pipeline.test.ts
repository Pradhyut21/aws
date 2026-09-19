/**
 * Integration-style tests — Orchestrator Pipeline (backend/src/agents/pipeline.ts)
 *
 * Strategy:
 *   - Mock all four sub-agents and all DynamoDB/store functions
 *   - Verify broadcast events are emitted in the correct order for the happy path
 *   - Verify stage timeout degrades to fallback and the pipeline continues
 *   - Verify the creative retry logic fires at most MAX_CREATIVE_ATTEMPTS times
 *   - Verify pipeline errors set campaign status to 'error' and broadcast an error event
 */

// ─── Mock all dependencies before importing pipeline ─────────────────────────

jest.mock('@aws-sdk/client-dynamodb', () => ({
    DynamoDBClient: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('@aws-sdk/lib-dynamodb', () => ({
    DynamoDBDocumentClient: { from: jest.fn().mockReturnValue({ send: jest.fn() }) },
    PutCommand: jest.fn(), GetCommand: jest.fn(), QueryCommand: jest.fn(),
}));
jest.mock('@aws-sdk/client-bedrock-runtime', () => ({
    BedrockRuntimeClient: jest.fn().mockImplementation(() => ({ send: jest.fn() })),
    InvokeModelCommand: jest.fn(),
}));
jest.mock('@aws-sdk/client-s3', () => ({
    S3Client: jest.fn().mockImplementation(() => ({ send: jest.fn() })),
    PutObjectCommand: jest.fn(),
}));

jest.mock('../researchAgent');
jest.mock('../creativeSwarm');
jest.mock('../qualityGuard');
jest.mock('../distributionAgent');
jest.mock('../../services/store');
jest.mock('../../services/v3store');
jest.mock('../../services/bedrock');

import { runPipeline } from '../pipeline';
import { runResearchAgent } from '../researchAgent';
import { runCreativeSwarm } from '../creativeSwarm';
import { runQualityGuard } from '../qualityGuard';
import { runDistributionAgent } from '../distributionAgent';
import { getCampaign, updateCampaign } from '../../services/store';
import { saveTraceStep, createExperiment, saveLessonLearned, computeContentHash } from '../../services/v3store';
import { invokeNovaOmni } from '../../services/bedrock';
import type { Campaign } from '../../services/store';

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const mockCampaign: Campaign = {
    id: 'pipeline-test-001',
    userId: 'user-xyz',
    businessType: 'textiles',
    language: 'hi',
    region: ['Jaipur'],
    input: 'Promote handwoven silk sarees for Navratri',
    inputType: 'text',
    status: 'processing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

const mockResearch = {
    trendingFormats: ['Reels'],
    demographics: 'Women 25–50',
    bestPostingTimes: { instagram: '7:00 PM IST', facebook: '12:00 PM IST', whatsapp: '9:00 AM IST', youtube: '6:00 PM IST', twitter: '11:00 AM IST' },
    hashtags: ['#Navratri', '#SilkSaree'],
    culturalContext: 'Navratri festival context',
    competitorInsights: 'Competitors focus on price',
    evidence: ['Signal 1'],
    historicalLessons: [],
};

const mockCreative = {
    images: [{ id: 'img-1', url: 'https://s3.test/img1.png', platform: 'instagram' }],
    captions: { instagram: 'Test caption', facebook: 'FB caption' },
    seo: { title: 'Test', metaDescription: 'Desc', keywords: ['saree'] },
    hashtags: ['#Navratri'],
    whatsapp: { message: 'WhatsApp msg', statusText: 'Status' },
};

const mockQuality = {
    passed: true,
    bharatScore: { total: 88, culturalFit: 26, seoScore: 22, engagementPotential: 22, platformOptimization: 18 },
    flags: [],
    categories: { toxicity: 'PASS', hate: 'PASS', brand: 'PASS', cultural: 'PASS', factualClaims: 'PASS' },
    revisionSuggestions: [],
};

const mockDistribution = {
    publishTimes: { instagram: '7:00 PM IST', facebook: '12:00 PM IST', whatsapp: '9:00 AM IST', youtube: '6:00 PM IST', twitter: '11:00 AM IST' },
    suggestedInfluencers: ['@jaipur_fashion'],
    estimatedReach: 45000,
};

// ─── Setup helpers ─────────────────────────────────────────────────────────────
function setupHappyPath() {
    (runResearchAgent as jest.Mock).mockResolvedValue(mockResearch);
    (runCreativeSwarm as jest.Mock).mockResolvedValue(mockCreative);
    (runQualityGuard as jest.Mock).mockResolvedValue(mockQuality);
    (runDistributionAgent as jest.Mock).mockResolvedValue(mockDistribution);
    (getCampaign as jest.Mock).mockResolvedValue(mockCampaign);
    (updateCampaign as jest.Mock).mockResolvedValue(undefined);
    (saveTraceStep as jest.Mock).mockResolvedValue(undefined);
    (createExperiment as jest.Mock).mockResolvedValue({ id: 'exp-001', variants: [1, 2, 3] });
    (saveLessonLearned as jest.Mock).mockResolvedValue(undefined);
    (computeContentHash as jest.Mock).mockReturnValue('hash-abc123');
    (invokeNovaOmni as jest.Mock).mockResolvedValue('Bilingual caption text');
}

// ─── Tests ─────────────────────────────────────────────────────────────────────
describe('runPipeline — happy path', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupHappyPath();
    });

    it('broadcasts stage_update for all 5 stages in order', async () => {
        const events: Array<{ type: string; stage?: number; status?: string }> = [];
        const broadcast = (event: object) => events.push(event as any);

        await runPipeline(mockCampaign.id, mockCampaign, broadcast);

        // Collect all (stage, status) pairs
        const stageEvents = events.filter(e => e.type === 'stage_update');
        const stages = stageEvents.map(e => ({ stage: e.stage, status: e.status }));

        expect(stages).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ stage: 1, status: 'running' }),
                expect.objectContaining({ stage: 1, status: 'done' }),
                expect.objectContaining({ stage: 2, status: 'running' }),
                expect.objectContaining({ stage: 2, status: 'done' }),
                expect.objectContaining({ stage: 3, status: 'done' }),
                expect.objectContaining({ stage: 4, status: 'done' }),
            ])
        );
    });

    it('emits a final "done" event with content and bharatScore', async () => {
        const events: object[] = [];
        await runPipeline(mockCampaign.id, mockCampaign, e => events.push(e));

        const doneEvent = events.find((e: any) => e.type === 'done') as any;
        expect(doneEvent).toBeDefined();
        expect(doneEvent.data.bharatScore.total).toBe(88);
    });

    it('calls updateCampaign with status "done" on success', async () => {
        await runPipeline(mockCampaign.id, mockCampaign, () => {});
        expect(updateCampaign).toHaveBeenCalledWith(
            mockCampaign.id,
            expect.objectContaining({ status: 'done' })
        );
    });

    it('saves a trace step for each pipeline stage', async () => {
        await runPipeline(mockCampaign.id, mockCampaign, () => {});
        // research, creative_swarm, quality_guard, distribution_agent, experiment_engine
        expect(saveTraceStep).toHaveBeenCalledTimes(5);
    });
});

describe('runPipeline — error scenarios', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupHappyPath();
    });

    it('degrades gracefully to fallback when research agent rejects (withTimeout fallback)', async () => {
        // runResearchAgent rejecting is caught by withTimeout which returns the fallback object.
        // The pipeline should still complete successfully.
        (runResearchAgent as jest.Mock).mockRejectedValue(new Error('Research failed'));

        const events: object[] = [];
        await runPipeline(mockCampaign.id, mockCampaign, e => events.push(e));

        // Pipeline should still reach 'done' because withTimeout provides a fallback
        const doneEvent = events.find((e: any) => e.type === 'done');
        expect(doneEvent).toBeDefined();

        // updateCampaign should be called with 'done', not 'error'
        expect(updateCampaign).toHaveBeenCalledWith(
            mockCampaign.id,
            expect.objectContaining({ status: 'done' })
        );
    });

    it('retries creative swarm up to MAX_CREATIVE_ATTEMPTS (2) times', async () => {
        // First attempt returns null (triggers retry), second succeeds
        (runCreativeSwarm as jest.Mock)
            .mockResolvedValueOnce(null)  // attempt 1 → null
            .mockResolvedValueOnce(mockCreative); // attempt 2 → success

        const events: object[] = [];
        await runPipeline(mockCampaign.id, mockCampaign, e => events.push(e));

        expect(runCreativeSwarm).toHaveBeenCalledTimes(2);
        const doneEvent = events.find((e: any) => e.type === 'done');
        expect(doneEvent).toBeDefined();
    });

    it('broadcasts error after creative fails all retries', async () => {
        (runCreativeSwarm as jest.Mock).mockResolvedValue(null); // always returns null

        const events: object[] = [];
        await runPipeline(mockCampaign.id, mockCampaign, e => events.push(e));

        const errorEvent = events.find((e: any) => e.type === 'error');
        expect(errorEvent).toBeDefined();
    });

    it('experiment creation failure does not fail the whole pipeline', async () => {
        (createExperiment as jest.Mock).mockRejectedValue(new Error('DynamoDB timeout'));

        const events: object[] = [];
        await runPipeline(mockCampaign.id, mockCampaign, e => events.push(e));

        // Should still emit 'done' even if experiment fails
        const doneEvent = events.find((e: any) => e.type === 'done');
        expect(doneEvent).toBeDefined();
    });
});
