import axios from 'axios';
import type { Campaign, AnalyticsData, User, AuthResponse, CampaignTemplate } from './types';

const api = axios.create({
    baseURL: 'http://localhost:4000/api',
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

export const transcribeVoice = async (audioBlob: Blob): Promise<{ transcription: string; detectedLanguage: string }> => {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    const res = await api.post('/voice/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
};

export default api;
