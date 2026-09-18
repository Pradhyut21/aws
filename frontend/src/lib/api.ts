import axios from 'axios';
import type { Campaign, AnalyticsData, User, AuthResponse, CampaignTemplate } from './types';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ─── AUTH ENDPOINTS ────────────────────────────────────────────────────────

export const signup = async (data: {
    email: string;
    password: string;
    name: string;
    language?: string;
    businessType?: string;
    region?: string[];
}): Promise<AuthResponse> => {
    const res = await api.post('/auth/signup', data);
    if (res.data.token) {
        localStorage.setItem('authToken', res.data.token);
    }
    return res.data;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.token) {
        localStorage.setItem('authToken', res.data.token);
    }
    return res.data;
};

export const logout = () => {
    localStorage.removeItem('authToken');
};

export const getCurrentUser = async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data;
};

export const updateProfile = async (data: Partial<User>): Promise<User> => {
    const res = await api.put('/auth/profile', data);
    return res.data;
};

// ─── CAMPAIGN ENDPOINTS ────────────────────────────────────────────────────

export const createCampaign = async (data: {
    input: string;
    inputType: 'voice' | 'text';
    language: string;
    businessType: string;
    region: string[];
    scheduledFor?: string;
    templateId?: string;
}): Promise<{ campaignId: string; wsChannel: string }> => {
    const res = await api.post('/campaign/create', data);
    return res.data;
};

export const getCampaign = async (id: string): Promise<Campaign> => {
    const res = await api.get(`/campaign/${id}`);
    return res.data;
};

export const getCampaigns = async (): Promise<Campaign[]> => {
    const res = await api.get('/campaigns');
    return res.data;
};

export const publishCampaign = async (id: string, platforms: string[]): Promise<{ success: boolean }> => {
    const res = await api.post(`/campaign/${id}/publish`, { platforms });
    return res.data;
};

export const deleteCampaign = async (id: string): Promise<{ success: boolean }> => {
    const res = await api.delete(`/campaign/${id}`);
    return res.data;
};

// ─── TEMPLATE ENDPOINTS ────────────────────────────────────────────────────

export const createTemplate = async (data: {
    name: string;
    description: string;
    businessType: string;
    language: string;
    content: object;
    isPublic?: boolean;
}): Promise<CampaignTemplate> => {
    const res = await api.post('/templates', data);
    return res.data;
};

export const getTemplates = async (): Promise<CampaignTemplate[]> => {
    const res = await api.get('/templates');
    return res.data;
};

export const getPublicTemplates = async (): Promise<CampaignTemplate[]> => {
    const res = await api.get('/templates/public');
    return res.data;
};

// ─── ANALYTICS ENDPOINTS ───────────────────────────────────────────────────

export const getAnalytics = async (): Promise<AnalyticsData> => {
    const res = await api.get('/analytics');
    return res.data;
};

// ─── VOICE ENDPOINTS ───────────────────────────────────────────────────────

export const transcribeVoice = async (
    audioBlob: Blob,
    language: string = 'hi'
): Promise<{
    transcription: string;
    detectedLanguage: string;
    languageName: string;
    confidence: number;
    source: 'amazon_transcribe' | 'DEMO_FALLBACK' | 'DEMO';
    note?: string;
    service?: string;
    durationMs?: number;
}> => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('language', language);
    const res = await api.post('/voice/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000, // Transcribe can take up to 30s for longer recordings
    });
    return res.data;
};

// ─── V3 AGENT TRACE ────────────────────────────────────────────────────────

export const getAgentTrace = async (campaignId: string) => {
    const res = await api.get(`/campaign/${campaignId}/trace`);
    return res.data;
};

// ─── V3 EXPERIMENTS ────────────────────────────────────────────────────────

export const getExperiments = async () => {
    const res = await api.get('/experiments');
    return res.data;
};

export const getExperiment = async (id: string) => {
    const res = await api.get(`/experiments/${id}`);
    return res.data;
};

export const updateExperimentMetrics = async (expId: string, variantId: string, metrics: Record<string, number>) => {
    const res = await api.patch(`/experiments/${expId}/metrics`, { variantId, metrics });
    return res.data;
};

// ─── V3 LEARNING MEMORY ────────────────────────────────────────────────────

export const getLearningLessons = async () => {
    const res = await api.get('/learning');
    return res.data;
};

// ─── V3 BHARATBRAIN ────────────────────────────────────────────────────────

export const uploadBrainDoc = async (file: File, type: string) => {
    const buffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    const res = await api.post('/brain/upload', {
        name:     file.name,
        type,
        content:  base64,
        mimeType: file.type || 'application/octet-stream',
    });
    return res.data;
};

export const getBrainDocs = async () => {
    const res = await api.get('/brain');
    return res.data;
};

export const deleteBrainDoc = async (id: string) => {
    const res = await api.delete(`/brain/${id}`);
    return res.data;
};

// ─── V3 MARKET PULSE ───────────────────────────────────────────────────────

export const getMarketPulse = async () => {
    const res = await api.get('/market-pulse');
    return res.data;
};

// ─── V3 CAMPAIGN SIMULATOR ─────────────────────────────────────────────────

export const simulateCampaign = async (data: {
    businessType: string;
    region: string[];
    language: string;
    platform?: string;
}) => {
    const res = await api.post('/campaign/simulate', data);
    return res.data;
};

// ─── ABORT / EMERGENCY STOP (GatedCart-inspired) ──────────────────────────

export const abortCampaign = async (campaignId: string) => {
    const res = await api.post(`/campaign/${campaignId}/abort`);
    return res.data;
};

// ─── AUDIT LOG (Socmint-Shield-inspired) ──────────────────────────────────

export const getAuditLog = async () => {
    const res = await api.get('/audit');
    return res.data;
};

// ─── AMAZON POLLY — TTS ────────────────────────────────────────────────────

export const synthesizeVoice = async (text: string, language: string = 'hi'): Promise<{
    audioUrl: string;
    voice: string;
    language: string;
    source: string;
    characters: number;
}> => {
    const res = await api.post('/voice/synthesize', { text: text.slice(0, 1500), language });
    return res.data;
};

// ─── AMAZON TRANSLATE — 10-language captions ───────────────────────────────

export const translateCaptions = async (
    text: string,
    sourceLang: string = 'en',
    targetLangs?: string[]
): Promise<{
    source: string;
    sourceLang: string;
    translations: Record<string, string>;
    service: string;
    languageCount: number;
}> => {
    const res = await api.post('/translate', { text, sourceLang, targetLangs });
    return res.data;
};

// ─── AMAZON COMPREHEND — Sentiment + Key Phrases ───────────────────────────

export const analyzeCopy = async (text: string, language: string = 'en'): Promise<{
    sentiment: { label: string; scores: Record<string, number> };
    keyPhrases: { text: string; score: number }[];
    service: string;
    characterCount: number;
}> => {
    const res = await api.post('/analyze', { text, language });
    return res.data;
};

// ─── AMAZON REKOGNITION — Image Content Moderation ─────────────────────────

export const moderateImage = async (
    imageBase64: string,
    minConfidence: number = 60
): Promise<{
    safe: boolean;
    score: number;
    flaggedLabels: { name: string; parentName: string; confidence: number }[];
    labelCount: number;
    checkedCategories: string[];
    service: string;
    moderationModelVersion: string;
}> => {
    const res = await api.post('/image/moderate', { imageBase64, minConfidence });
    return res.data;
};

export default api;
