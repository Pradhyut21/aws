/**
 * BharatMedia — DynamoDB Single-Table Store
 *
 * Single-table design:
 *   PK (partition key)  = entity prefix + ID
 *   SK (sort key)       = same value for primary record
 *
 *   "USER#<id>"           | "USER#<id>"            → User record (password included)
 *   "CAMP#<id>"           | "CAMP#<id>"            → Campaign record
 *   "TMPL#<id>"           | "TMPL#<id>"            → CampaignTemplate record
 *   "ANALYTICS#<userId>"  | "ANALYTICS#<userId>"   → Analytics record
 *
 *   GSI 1 — "UserCampaignsIndex":
 *     GSI1PK = "USER#<userId>", GSI1SK = "CAMP#<createdAt>"
 *     Purpose: getUserCampaigns(userId) — Query instead of Scan
 *
 *   GSI 2 — "PublicTemplatesIndex":
 *     GSI2PK = "TMPL#PUBLIC" (set when isPublic=true), GSI2SK = "TMPL#<id>"
 *     Purpose: getPublicTemplates() — Query instead of Scan
 *
 * Why single-table?
 *   ✅ 1 provisioned table — $0 extra for hackathon (on-demand billing)
 *   ✅ Simpler IAM policy (one table ARN)
 *   ✅ All related data accessible via GSIs, no JOINs
 *   ✅ Easy to demo "real AWS" in the video
 *   ⚠️  Query patterns must be pre-designed — ad-hoc queries require Scan
 *
 * AWS CLI to create table + GSIs (run once, or use createTableIfNotExists() on startup):
 *   aws dynamodb create-table \
 *     --table-name bharatmedia-dev \
 *     --attribute-definitions \
 *       AttributeName=PK,AttributeType=S \
 *       AttributeName=SK,AttributeType=S \
 *       AttributeName=GSI1PK,AttributeType=S \
 *       AttributeName=GSI1SK,AttributeType=S \
 *       AttributeName=GSI2PK,AttributeType=S \
 *       AttributeName=GSI2SK,AttributeType=S \
 *     --key-schema AttributeName=PK,KeyType=HASH AttributeName=SK,KeyType=RANGE \
 *     --billing-mode PAY_PER_REQUEST \
 *     --global-secondary-indexes \
 *       "[{\"IndexName\":\"UserCampaignsIndex\",\"KeySchema\":[{\"AttributeName\":\"GSI1PK\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"GSI1SK\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}},{\"IndexName\":\"PublicTemplatesIndex\",\"KeySchema\":[{\"AttributeName\":\"GSI2PK\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"GSI2SK\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}]" \
 *     --region us-east-1
 */

import crypto from 'crypto';
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand, ResourceNotFoundException } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = process.env.DYNAMODB_TABLE || 'bharatmedia-dev';
const REGION     = process.env.AWS_REGION      || 'us-east-1';

const rawClient = new DynamoDBClient({ region: REGION });
export const ddbClient = DynamoDBDocumentClient.from(rawClient, {
    marshallOptions:   { removeUndefinedValues: true },
    unmarshallOptions: { wrapNumbers: false },
});

// ─── INTERFACES (unchanged — downstream code must not break) ─────────────────

export interface Campaign {
    id: string;
    userId: string;
    input: string;
    inputType: 'voice' | 'text';
    language: string;
    businessType: string;
    region: string[];
    status: 'pending' | 'processing' | 'done' | 'error' | 'aborted';
    createdAt: string;
    updatedAt: string;
    scheduledFor?: string;
    content?: object;
    bharatScore?: object;
    publishedPlatforms?: string[];
    publishedAt?: string;
    tags?: string[];
    templateId?: string;
    contentHash?: string;
    personaReview?: object;
}

export interface CampaignTemplate {
    id: string;
    userId: string;
    name: string;
    description: string;
    businessType: string;
    language: string;
    content: object;
    isPublic: boolean;
    createdAt: string;
    usageCount: number;
}

export interface Analytics {
    userId: string;
    campaignsCreated: number;
    languagesUsed: string[];
    platformsPublished: string[];
    estimatedReach: number;
    totalEngagement: number;
    lastUpdated: string;
}

// ─── BOOTSTRAP — creates table if it doesn't exist ──────────────────────────

export async function createTableIfNotExists(): Promise<void> {
    try {
        await rawClient.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
        console.log(`✅ DynamoDB table '${TABLE_NAME}' found.`);
    } catch (err: any) {
        if (err.name !== 'ResourceNotFoundException' && !(err instanceof ResourceNotFoundException)) {
            console.error('DynamoDB DescribeTable error:', err.message);
            throw err;
        }
        console.log(`⚙️  Creating DynamoDB table '${TABLE_NAME}'...`);
        await rawClient.send(new CreateTableCommand({
            TableName: TABLE_NAME,
            AttributeDefinitions: [
                { AttributeName: 'PK',     AttributeType: 'S' },
                { AttributeName: 'SK',     AttributeType: 'S' },
                { AttributeName: 'GSI1PK', AttributeType: 'S' },
                { AttributeName: 'GSI1SK', AttributeType: 'S' },
                { AttributeName: 'GSI2PK', AttributeType: 'S' },
                { AttributeName: 'GSI2SK', AttributeType: 'S' },
                // ─── EmailIndex: used by auth.ts → getUserByEmail() ──────────
                // Without this, every login fails with DynamoDB ValidationException.
                { AttributeName: 'email',  AttributeType: 'S' },
            ],
            KeySchema: [
                { AttributeName: 'PK', KeyType: 'HASH' },
                { AttributeName: 'SK', KeyType: 'RANGE' },
            ],
            BillingMode: 'PAY_PER_REQUEST',
            GlobalSecondaryIndexes: [
                {
                    IndexName: 'UserCampaignsIndex',
                    KeySchema: [
                        { AttributeName: 'GSI1PK', KeyType: 'HASH' },
                        { AttributeName: 'GSI1SK', KeyType: 'RANGE' },
                    ],
                    Projection: { ProjectionType: 'ALL' },
                },
                {
                    IndexName: 'PublicTemplatesIndex',
                    KeySchema: [
                        { AttributeName: 'GSI2PK', KeyType: 'HASH' },
                        { AttributeName: 'GSI2SK', KeyType: 'RANGE' },
                    ],
                    Projection: { ProjectionType: 'ALL' },
                },
                {
                    // ─── EmailIndex ─────────────────────────────────────────
                    // Purpose: getUserByEmail(email) — Query instead of Scan.
                    // Hash key is 'email' (the user's email address string).
                    // No sort key needed — email is globally unique.
                    IndexName: 'EmailIndex',
                    KeySchema: [
                        { AttributeName: 'email', KeyType: 'HASH' },
                    ],
                    Projection: { ProjectionType: 'ALL' },
                },
            ],
        }));
        console.log(`✅ DynamoDB table '${TABLE_NAME}' created with UserCampaignsIndex, PublicTemplatesIndex, EmailIndex.`);
    }
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

function stripMeta(item: Record<string, any>): any {
    const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, _type, ...rest } = item;
    return rest;
}

// ─── CAMPAIGN OPERATIONS ─────────────────────────────────────────────────────

export async function createCampaign(
    userId: string,
    data: Omit<Campaign, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<Campaign> {
    const id        = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const campaign: Campaign = {
        id, userId, ...data,
        createdAt,
        updatedAt: createdAt,
    };
    await ddbClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
            PK:     `CAMP#${id}`,
            SK:     `CAMP#${id}`,
            GSI1PK: `USER#${userId}`,
            GSI1SK: `CAMP#${createdAt}`,
            _type:  'campaign',
            ...campaign,
        },
        ConditionExpression: 'attribute_not_exists(PK)',
    }));
    return campaign;
}

export async function getCampaign(campaignId: string): Promise<Campaign | undefined> {
    const result = await ddbClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `CAMP#${campaignId}`, SK: `CAMP#${campaignId}` },
    }));
    if (!result.Item) return undefined;
    return stripMeta(result.Item) as Campaign;
}

export async function getUserCampaigns(userId: string): Promise<Campaign[]> {
    const result = await ddbClient.send(new QueryCommand({
        TableName:              TABLE_NAME,
        IndexName:              'UserCampaignsIndex',
        KeyConditionExpression: 'GSI1PK = :pk',
        ExpressionAttributeValues: { ':pk': `USER#${userId}` },
        ScanIndexForward: false, // newest first
    }));
    return (result.Items || []).map(stripMeta) as Campaign[];
}

export async function updateCampaign(campaignId: string, updates: Partial<Campaign>): Promise<Campaign | null> {
    const existing = await getCampaign(campaignId);
    if (!existing) return null;

    const updated: Campaign = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
    };

    await ddbClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
            PK:     `CAMP#${campaignId}`,
            SK:     `CAMP#${campaignId}`,
            GSI1PK: `USER#${updated.userId}`,
            GSI1SK: `CAMP#${updated.createdAt}`,
            _type:  'campaign',
            ...updated,
        },
    }));
    return updated;
}

export async function deleteCampaign(campaignId: string): Promise<boolean> {
    const existing = await getCampaign(campaignId);
    if (!existing) return false;
    await ddbClient.send(new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { PK: `CAMP#${campaignId}`, SK: `CAMP#${campaignId}` },
    }));
    return true;
}

// ─── TEMPLATE OPERATIONS ─────────────────────────────────────────────────────

export async function createTemplate(
    userId: string,
    data: Omit<CampaignTemplate, 'id' | 'userId' | 'createdAt' | 'usageCount'>
): Promise<CampaignTemplate> {
    const id        = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const template: CampaignTemplate = {
        id, userId, ...data,
        createdAt,
        usageCount: 0,
    };
    const item: Record<string, any> = {
        PK:    `TMPL#${id}`,
        SK:    `TMPL#${id}`,
        _type: 'template',
        ...template,
    };
    if (template.isPublic) {
        item.GSI2PK = 'TMPL#PUBLIC';
        item.GSI2SK = `TMPL#${id}`;
    }
    await ddbClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
        ConditionExpression: 'attribute_not_exists(PK)',
    }));
    return template;
}

export async function getTemplate(templateId: string): Promise<CampaignTemplate | undefined> {
    const result = await ddbClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `TMPL#${templateId}`, SK: `TMPL#${templateId}` },
    }));
    if (!result.Item) return undefined;
    return stripMeta(result.Item) as CampaignTemplate;
}

export async function getUserTemplates(userId: string): Promise<CampaignTemplate[]> {
    // No dedicated GSI for user templates — use Query on main table with filter
    // (Low volume: users rarely have >100 templates, so a filtered query is fine)
    const result = await ddbClient.send(new QueryCommand({
        TableName:              TABLE_NAME,
        IndexName:              'UserCampaignsIndex',
        KeyConditionExpression: 'GSI1PK = :pk',
        FilterExpression:       '_type = :t',
        ExpressionAttributeValues: {
            ':pk': `USER#${userId}`,
            ':t':  'template',
        },
    }));
    return (result.Items || []).map(stripMeta) as CampaignTemplate[];
}

export async function getPublicTemplates(): Promise<CampaignTemplate[]> {
    const result = await ddbClient.send(new QueryCommand({
        TableName:              TABLE_NAME,
        IndexName:              'PublicTemplatesIndex',
        KeyConditionExpression: 'GSI2PK = :pk',
        ExpressionAttributeValues: { ':pk': 'TMPL#PUBLIC' },
    }));
    return (result.Items || []).map(stripMeta) as CampaignTemplate[];
}

export async function updateTemplate(templateId: string, updates: Partial<CampaignTemplate>): Promise<CampaignTemplate | null> {
    const existing = await getTemplate(templateId);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    const item: Record<string, any> = {
        PK:    `TMPL#${templateId}`,
        SK:    `TMPL#${templateId}`,
        _type: 'template',
        ...updated,
    };
    if (updated.isPublic) {
        item.GSI2PK = 'TMPL#PUBLIC';
        item.GSI2SK = `TMPL#${templateId}`;
    }
    await ddbClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
    return updated;
}

export async function deleteTemplate(templateId: string): Promise<boolean> {
    const existing = await getTemplate(templateId);
    if (!existing) return false;
    await ddbClient.send(new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { PK: `TMPL#${templateId}`, SK: `TMPL#${templateId}` },
    }));
    return true;
}

// ─── ANALYTICS OPERATIONS ────────────────────────────────────────────────────

export async function getOrCreateAnalytics(userId: string): Promise<Analytics> {
    const result = await ddbClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `ANALYTICS#${userId}`, SK: `ANALYTICS#${userId}` },
    }));
    if (result.Item) return stripMeta(result.Item) as Analytics;

    const fresh: Analytics = {
        userId,
        campaignsCreated:   0,
        languagesUsed:      [],
        platformsPublished: [],
        estimatedReach:     0,
        totalEngagement:    0,
        lastUpdated:        new Date().toISOString(),
    };
    await ddbClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
            PK:    `ANALYTICS#${userId}`,
            SK:    `ANALYTICS#${userId}`,
            _type: 'analytics',
            ...fresh,
        },
    }));
    return fresh;
}

export async function updateAnalytics(userId: string, updates: Partial<Analytics>): Promise<Analytics> {
    const existing = await getOrCreateAnalytics(userId);
    const updated: Analytics = {
        ...existing,
        ...updates,
        lastUpdated: new Date().toISOString(),
    };
    await ddbClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
            PK:    `ANALYTICS#${userId}`,
            SK:    `ANALYTICS#${userId}`,
            _type: 'analytics',
            ...updated,
        },
    }));
    return updated;
}

// ─── LEGACY MAP SHIMS (keep 'campaigns' export for pipeline.ts backward compat)
// pipeline.ts calls `campaigns.get()` — provide a proxy that reads from DynamoDB.
// This is a thin compatibility layer; new code should call getCampaign() directly.
export const campaigns = {
    get: async (id: string) => getCampaign(id),
    delete: async (id: string) => deleteCampaign(id),
    set: async (_id: string, _campaign: Campaign) => { /* no-op — use updateCampaign */ },
};
