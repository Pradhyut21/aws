import crypto from 'crypto';

// In-memory store (replace with DynamoDB for production)
export interface Campaign {
    id: string;
    userId: string;
    input: string;
    inputType: 'voice' | 'text';
    language: string;
    businessType: string;
    region: string[];
    status: 'pending' | 'processing' | 'done' | 'error';
    createdAt: string;
    updatedAt: string;
    scheduledFor?: string;
    content?: object;
    bharatScore?: object;
    publishedPlatforms?: string[];
    publishedAt?: string;
    tags?: string[];
    templateId?: string;
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

// In-memory stores
export const campaigns = new Map<string, Campaign>();
export const templates = new Map<string, CampaignTemplate>();
export const analytics = new Map<string, Analytics>();

// Campaign operations
export function createCampaign(userId: string, data: Omit<Campaign, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Campaign {
    const campaign: Campaign = {
        id: crypto.randomUUID(),
        userId,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    campaigns.set(campaign.id, campaign);
    return campaign;
}

export function getCampaign(campaignId: string): Campaign | undefined {
    return campaigns.get(campaignId);
}

export function getUserCampaigns(userId: string): Campaign[] {
    return Array.from(campaigns.values()).filter(c => c.userId === userId);
}

export function updateCampaign(campaignId: string, updates: Partial<Campaign>): Campaign | null {
    const campaign = campaigns.get(campaignId);
    if (!campaign) return null;
    const updated = { ...campaign, ...updates, updatedAt: new Date().toISOString() };
    campaigns.set(campaignId, updated);
    return updated;
}

export function deleteCampaign(campaignId: string): boolean {
    return campaigns.delete(campaignId);
}

// Template operations
export function createTemplate(userId: string, data: Omit<CampaignTemplate, 'id' | 'userId' | 'createdAt' | 'usageCount'>): CampaignTemplate {
    const template: CampaignTemplate = {
        id: crypto.randomUUID(),
        userId,
        ...data,
        createdAt: new Date().toISOString(),
        usageCount: 0,
    };
    templates.set(template.id, template);
    return template;
}

export function getTemplate(templateId: string): CampaignTemplate | undefined {
    return templates.get(templateId);
}

export function getUserTemplates(userId: string): CampaignTemplate[] {
    return Array.from(templates.values()).filter(t => t.userId === userId);
}

export function getPublicTemplates(): CampaignTemplate[] {
    return Array.from(templates.values()).filter(t => t.isPublic);
}

export function updateTemplate(templateId: string, updates: Partial<CampaignTemplate>): CampaignTemplate | null {
    const template = templates.get(templateId);
    if (!template) return null;
    const updated = { ...template, ...updates };
    templates.set(templateId, updated);
    return updated;
}

export function deleteTemplate(templateId: string): boolean {
    return templates.delete(templateId);
}

// Analytics operations
export function getOrCreateAnalytics(userId: string): Analytics {
    let userAnalytics = analytics.get(userId);
    if (!userAnalytics) {
        userAnalytics = {
            userId,
            campaignsCreated: 0,
            languagesUsed: [],
            platformsPublished: [],
            estimatedReach: 0,
            totalEngagement: 0,
            lastUpdated: new Date().toISOString(),
        };
        analytics.set(userId, userAnalytics);
    }
    return userAnalytics;
}

export function updateAnalytics(userId: string, updates: Partial<Analytics>): Analytics {
    const userAnalytics = getOrCreateAnalytics(userId);
    const updated = { ...userAnalytics, ...updates, lastUpdated: new Date().toISOString() };
    analytics.set(userId, updated);
    return updated;
}

