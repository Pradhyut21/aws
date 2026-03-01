"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analytics = exports.templates = exports.campaigns = void 0;
exports.createCampaign = createCampaign;
exports.getCampaign = getCampaign;
exports.getUserCampaigns = getUserCampaigns;
exports.updateCampaign = updateCampaign;
exports.deleteCampaign = deleteCampaign;
exports.createTemplate = createTemplate;
exports.getTemplate = getTemplate;
exports.getUserTemplates = getUserTemplates;
exports.getPublicTemplates = getPublicTemplates;
exports.updateTemplate = updateTemplate;
exports.deleteTemplate = deleteTemplate;
exports.getOrCreateAnalytics = getOrCreateAnalytics;
exports.updateAnalytics = updateAnalytics;
const crypto_1 = __importDefault(require("crypto"));
// In-memory stores
exports.campaigns = new Map();
exports.templates = new Map();
exports.analytics = new Map();
// Campaign operations
function createCampaign(userId, data) {
    const campaign = {
        id: crypto_1.default.randomUUID(),
        userId,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    exports.campaigns.set(campaign.id, campaign);
    return campaign;
}
function getCampaign(campaignId) {
    return exports.campaigns.get(campaignId);
}
function getUserCampaigns(userId) {
    return Array.from(exports.campaigns.values()).filter(c => c.userId === userId);
}
function updateCampaign(campaignId, updates) {
    const campaign = exports.campaigns.get(campaignId);
    if (!campaign)
        return null;
    const updated = { ...campaign, ...updates, updatedAt: new Date().toISOString() };
    exports.campaigns.set(campaignId, updated);
    return updated;
}
function deleteCampaign(campaignId) {
    return exports.campaigns.delete(campaignId);
}
// Template operations
function createTemplate(userId, data) {
    const template = {
        id: crypto_1.default.randomUUID(),
        userId,
        ...data,
        createdAt: new Date().toISOString(),
        usageCount: 0,
    };
    exports.templates.set(template.id, template);
    return template;
}
function getTemplate(templateId) {
    return exports.templates.get(templateId);
}
function getUserTemplates(userId) {
    return Array.from(exports.templates.values()).filter(t => t.userId === userId);
}
function getPublicTemplates() {
    return Array.from(exports.templates.values()).filter(t => t.isPublic);
}
function updateTemplate(templateId, updates) {
    const template = exports.templates.get(templateId);
    if (!template)
        return null;
    const updated = { ...template, ...updates };
    exports.templates.set(templateId, updated);
    return updated;
}
function deleteTemplate(templateId) {
    return exports.templates.delete(templateId);
}
// Analytics operations
function getOrCreateAnalytics(userId) {
    let userAnalytics = exports.analytics.get(userId);
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
        exports.analytics.set(userId, userAnalytics);
    }
    return userAnalytics;
}
function updateAnalytics(userId, updates) {
    const userAnalytics = getOrCreateAnalytics(userId);
    const updated = { ...userAnalytics, ...updates, lastUpdated: new Date().toISOString() };
    exports.analytics.set(userId, updated);
    return updated;
}
