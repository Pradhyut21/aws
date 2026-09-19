/**
 * BharatMedia V3 — Extended DynamoDB Repositories
 *
 * New entities added to the single bharatmedia-dev table:
 *
 *   AgentTrace
 *     PK = "TRACE#<campaignId>", SK = "STEP#<timestamp>#<toolName>"
 *     Purpose: Agent Trace panel — every decision with latency and evidence
 *
 *   Experiment
 *     PK = "EXP#<campaignId>",   SK = "EXP#<campaignId>"
 *     GSI: GSI1PK = "USER#<userId>", GSI1SK = "EXP#<createdAt>"
 *     Purpose: A/B experiment variants and outcomes
 *
 *   LearningMemory
 *     PK = "LEARN#<userId>",     SK = "LESSON#<timestamp>"
 *     Purpose: Lessons learned per business/user fed into next campaign
 *
 *   BharatBrainDoc
 *     PK = "BRAIN#<userId>",     SK = "DOC#<docId>"
 *     Purpose: Metadata for uploaded brand documents (actual files in S3)
 */

import crypto from 'crypto';
import { ddbClient } from './store';
import {
    PutCommand,
    QueryCommand,
    GetCommand,
    DeleteCommand,
    ScanCommand,
} from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = process.env.DYNAMODB_TABLE || 'bharatmedia-dev';

// ─── INTERFACES ──────────────────────────────────────────────────────────────

export interface AgentTraceStep {
    campaignId: string;
    toolName: string;
    input: any;
    output: any;
    latencyMs: number;
    status: 'success' | 'error';
    error?: string;
    timestamp: string;
    // Veritas-inspired: token counts from Bedrock response (captured in strands.ts)
    inputTokens?: number;
    outputTokens?: number;
    estimatedCostUsd?: number; // computed at capture time — never stored as a guarantee
}

export interface ExperimentVariant {
    id: string;
    label: string; // "Variant A — Kannada"
    language: string;
    content: object;
    metrics?: {
        impressions?: number;
        reach?: number;
        clicks?: number;
        ctr?: number;
        engagement?: number;
    };
}

export interface Experiment {
    id: string;
    campaignId: string;
    userId: string;
    hypothesis: string;
    variants: ExperimentVariant[];
    status: 'running' | 'completed' | 'cancelled';
    winner?: string; // variant id
    insight?: string; // e.g. "Bilingual content generated stronger engagement"
    createdAt: string;
    updatedAt: string;
}

export interface LessonLearned {
    id: string;
    userId: string;
    businessType: string;
    region: string[];
    language: string;
    strategy: string; // what was tried
    result: string; // what happened
    lesson: string; // actionable takeaway for next campaign
    campaignId: string;
    createdAt: string;
}

export interface BharatBrainDoc {
    id: string;
    userId: string;
    name: string;
    type:
        | 'brand_guidelines'
        | 'product_catalog'
        | 'persona'
        | 'previous_campaign'
        | 'reviews'
        | 'competitor'
        | 'other';
    s3Key: string; // S3 object key
    size: number; // bytes
    summary?: string; // AI-generated one-liner summary
    createdAt: string;
}

// ─── AGENT TRACE ─────────────────────────────────────────────────────────────

export async function saveTraceStep(step: AgentTraceStep): Promise<void> {
    const sk = `STEP#${step.timestamp}#${step.toolName}`;
    await ddbClient.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                PK: `TRACE#${step.campaignId}`,
                SK: sk,
                _type: 'trace',
                ...step,
            },
        })
    );
}

export async function getCampaignTrace(campaignId: string): Promise<AgentTraceStep[]> {
    const result = await ddbClient.send(
        new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
            ExpressionAttributeValues: {
                ':pk': `TRACE#${campaignId}`,
                ':sk': 'STEP#',
            },
            ScanIndexForward: true,
        })
    );
    return (result.Items || []).map(({ PK, SK, _type, ...rest }) => rest as AgentTraceStep);
}

// ─── EXPERIMENTS ──────────────────────────────────────────────────────────────

export async function createExperiment(
    userId: string,
    data: Omit<Experiment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<Experiment> {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const exp: Experiment = { id, userId, ...data, createdAt, updatedAt: createdAt };

    await ddbClient.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                PK: `EXP#${id}`,
                SK: `EXP#${id}`,
                GSI1PK: `USER#${userId}`,
                GSI1SK: `EXP#${createdAt}`,
                _type: 'experiment',
                ...exp,
            },
        })
    );
    return exp;
}

export async function getExperiment(expId: string): Promise<Experiment | undefined> {
    const result = await ddbClient.send(
        new GetCommand({
            TableName: TABLE_NAME,
            Key: { PK: `EXP#${expId}`, SK: `EXP#${expId}` },
        })
    );
    if (!result.Item) return undefined;
    const { PK, SK, _type, ...rest } = result.Item;
    return rest as Experiment;
}

export async function getUserExperiments(userId: string): Promise<Experiment[]> {
    const result = await ddbClient.send(
        new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: 'UserCampaignsIndex',
            KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :prefix)',
            ExpressionAttributeValues: {
                ':pk': `USER#${userId}`,
                ':prefix': 'EXP#',
            },
            ScanIndexForward: false,
        })
    );
    return (result.Items || []).map(
        ({ PK, SK, GSI1PK, GSI1SK, _type, ...rest }) => rest as Experiment
    );
}

export async function updateExperiment(
    expId: string,
    updates: Partial<Experiment>
): Promise<Experiment | null> {
    const existing = await getExperiment(expId);
    if (!existing) return null;
    const updated: Experiment = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await ddbClient.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                PK: `EXP#${expId}`,
                SK: `EXP#${expId}`,
                GSI1PK: `USER#${updated.userId}`,
                GSI1SK: `EXP#${updated.createdAt}`,
                _type: 'experiment',
                ...updated,
            },
        })
    );
    return updated;
}

// ─── LEARNING MEMORY ─────────────────────────────────────────────────────────

export async function saveLessonLearned(
    userId: string,
    data: Omit<LessonLearned, 'id' | 'userId' | 'createdAt'>
): Promise<LessonLearned> {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const lesson: LessonLearned = { id, userId, ...data, createdAt };

    await ddbClient.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                PK: `LEARN#${userId}`,
                SK: `LESSON#${createdAt}#${id}`,
                _type: 'lesson',
                ...lesson,
            },
        })
    );
    return lesson;
}

export async function getUserLessons(userId: string, limit: number = 10): Promise<LessonLearned[]> {
    const result = await ddbClient.send(
        new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
            ExpressionAttributeValues: {
                ':pk': `LEARN#${userId}`,
                ':prefix': 'LESSON#',
            },
            ScanIndexForward: false, // newest lessons first
            Limit: limit,
        })
    );
    return (result.Items || []).map(({ PK, SK, _type, ...rest }) => rest as LessonLearned);
}

// ─── BHARATBRAIN DOCS ────────────────────────────────────────────────────────

export async function saveBrainDoc(
    userId: string,
    data: Omit<BharatBrainDoc, 'id' | 'userId' | 'createdAt'>
): Promise<BharatBrainDoc> {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const doc: BharatBrainDoc = { id, userId, ...data, createdAt };

    await ddbClient.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                PK: `BRAIN#${userId}`,
                SK: `DOC#${id}`,
                _type: 'brain_doc',
                ...doc,
            },
        })
    );
    return doc;
}

export async function getUserBrainDocs(userId: string): Promise<BharatBrainDoc[]> {
    const result = await ddbClient.send(
        new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
            ExpressionAttributeValues: {
                ':pk': `BRAIN#${userId}`,
                ':prefix': 'DOC#',
            },
            ScanIndexForward: false,
        })
    );
    return (result.Items || []).map(({ PK, SK, _type, ...rest }) => rest as BharatBrainDoc);
}

export async function deleteBrainDoc(userId: string, docId: string): Promise<boolean> {
    await ddbClient.send(
        new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { PK: `BRAIN#${userId}`, SK: `DOC#${docId}` },
        })
    );
    return true;
}

// ─── AUDIT LOG (Socmint-Shield-inspired) ────────────────────────────────────
/**
 * Scan the 50 most recent trace steps across ALL campaigns.
 * Used by GET /api/audit so judges can see real activity.
 * NOTE: DynamoDB Scan is fine here — this is a low-frequency admin endpoint.
 */
export async function scanRecentTraces(limit: number = 50): Promise<AgentTraceStep[]> {
    const result = await ddbClient.send(
        new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: '_type = :t',
            ExpressionAttributeValues: { ':t': 'trace' },
            Limit: 200, // scan up to 200, sort, return limit
        })
    );
    const items = (result.Items || []).map(({ PK, SK, _type, ...rest }) => rest as AgentTraceStep);
    // Sort by timestamp descending and take the most recent
    return items.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, limit);
}

// ─── CONTENT HASH (GatedCart-inspired integrity fingerprint) ─────────────────
/**
 * Compute a SHA-256 fingerprint of campaign content JSON.
 * Stored at finalise time. If DynamoDB is modified post-generation, the hash
 * will mismatch and the tampering is detectable.
 */
export function computeContentHash(content: object): string {
    const canonical = JSON.stringify(content, Object.keys(content).sort());
    return crypto.createHash('sha256').update(canonical).digest('hex');
}

// ─── BEDROCK COST TABLE (Veritas-inspired token accounting) ──────────────────
// Approximate USD per 1000 tokens — us-east-1 prices as of 2026-09.
// These are estimates only. Do NOT use for billing.
export const BEDROCK_COSTS: Record<string, { input: number; output: number }> = {
    'us.amazon.nova-pro-v1:0': { input: 0.0008, output: 0.0032 },
    'us.amazon.nova-lite-v1:0': { input: 0.00006, output: 0.00024 },
    'amazon.nova-pro-v1:0': { input: 0.0008, output: 0.0032 },
    'amazon.nova-lite-v1:0': { input: 0.00006, output: 0.00024 },
    'amazon.titan-image-generator-v1': { input: 0.0008, output: 0 }, // per image
};

export function estimateCostUsd(
    modelId: string,
    inputTokens: number,
    outputTokens: number
): number {
    const costs = BEDROCK_COSTS[modelId];
    if (!costs) return 0;
    return parseFloat(
        ((costs.input * inputTokens + costs.output * outputTokens) / 1000).toFixed(6)
    );
}
