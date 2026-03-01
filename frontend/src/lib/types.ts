// Campaign types
export interface Campaign {
    id: string;
    userId: string;
    title?: string;
    input: string;
    inputType: 'voice' | 'text';
    language: string;
    businessType: string;
    region: string[];
    status: 'pending' | 'processing' | 'done' | 'error';
    createdAt: string;
    updatedAt: string;
    scheduledFor?: string;
    publishedAt?: string;
    tags?: string[];
    templateId?: string;
    content?: GeneratedContent;
    bharatScore?: BharatScore;
    publishedPlatforms?: string[];
}

export interface CampaignTemplate {
    id: string;
    userId: string;
    name: string;
    description: string;
    businessType: string;
    language: string;
    content: GeneratedContent;
    isPublic: boolean;
    createdAt: string;
    usageCount: number;
}

export interface User {
    id: string;
    email: string;
    phone?: string;
    name: string;
    language: string;
    businessType: string;
    region: string[];
    tier: 'free' | 'pro' | 'enterprise';
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface GeneratedContent {
    images: ContentItem[];
    captions: CaptionSet;
    video?: VideoScript;
    seo: SEOData;
    whatsapp: WhatsAppContent;
    hashtags: string[];
    publishTimes: Record<string, string>;
}

export interface ContentItem {
    id: string;
    url: string;
    platform: string;
    caption?: string;
}

export interface CaptionSet {
    instagram: string;
    facebook: string;
    twitter: string;
    youtube: string;
    whatsapp: string;
    linkedin?: string;
}

export interface VideoScript {
    duration: number;
    script: string;
    hook: string;
    cta: string;
}

export interface SEOData {
    title: string;
    metaDescription: string;
    keywords: string[];
    blogOutline: string[];
}

export interface WhatsAppContent {
    message: string;
    statusText: string;
}

export interface BharatScore {
    total: number;
    culturalFit: number;
    seoScore: number;
    engagementPotential: number;
    platformOptimization: number;
}

// Pipeline/Agent types
export interface PipelineStage {
    id: number;
    label: string;
    detail: string;
    status: 'waiting' | 'running' | 'done' | 'error';
    agent: string;
    aws: string;
}

// Language types
export interface IndianLanguage {
    code: string;
    name: string;
    nativeName: string;
    script: string;
    region: string;
}

// Festival types
export interface Festival {
    name: string;
    date: string;
    emoji: string;
    color: string;
    description: string;
}

// Analytics types
export interface AnalyticsData {
    campaignsCreated: number;
    languagesUsed: string[];
    platformsPublished: string[];
    estimatedReach: number;
    engagement: EngagementPoint[];
    platformBreakdown: PlatformStat[];
    languageBreakdown: LanguageStat[];
    stateData: Record<string, number>;
}

export interface EngagementPoint {
    date: string;
    views: number;
    likes: number;
    shares: number;
}

export interface PlatformStat {
    platform: string;
    campaigns: number;
    reach: number;
}

export interface LanguageStat {
    language: string;
    count: number;
    color: string;
}

// WebSocket event
export interface PipelineEvent {
    type: 'stage_update' | 'done' | 'error';
    campaignId: string;
    stage: number;
    label: string;
    status: 'running' | 'done';
    detail: string;
}
