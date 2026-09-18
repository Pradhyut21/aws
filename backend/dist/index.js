"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
exports.broadcast = broadcast;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const express_validator_1 = require("express-validator");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const store_1 = require("./services/store");
const auth_1 = require("./services/auth");
const auth_2 = require("./middleware/auth");
const pipeline_1 = require("./agents/pipeline");
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server, path: '/ws' });
// Map campaignId → Set of WebSocket clients
const campaignClients = new Map();
// ─── SECURITY MIDDLEWARE ───────────────────────────────────────────────────
// CORS with whitelist
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173').split(',');
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('CORS not allowed'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json({ limit: '50mb' }));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5, // 5 attempts per 15 minutes
    message: 'Too many login attempts, please try again later.',
    skipSuccessfulRequests: true,
});
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);
// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }
    next();
};
// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    if (err.message === 'CORS not allowed') {
        return res.status(403).json({ error: 'CORS not allowed' });
    }
    res.status(500).json({ error: 'Internal server error', message: process.env.NODE_ENV === 'development' ? err.message : undefined });
});
// Broadcast to all WS clients for a campaign
function broadcast(campaignId, data) {
    const clients = campaignClients.get(campaignId);
    if (!clients)
        return;
    const msg = JSON.stringify(data);
    clients.forEach(ws => { if (ws.readyState === ws_1.WebSocket.OPEN)
        ws.send(msg); });
}
// WebSocket connection handler
wss.on('connection', (ws, req) => {
    try {
        const url = new URL(req.url || '', `ws://localhost`);
        const campaignId = url.searchParams.get('campaignId') || '';
        if (!campaignId) {
            ws.close(1008, 'Missing campaignId');
            return;
        }
        if (!campaignClients.has(campaignId))
            campaignClients.set(campaignId, new Set());
        campaignClients.get(campaignId).add(ws);
        ws.on('close', () => {
            campaignClients.get(campaignId)?.delete(ws);
        });
        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    }
    catch (error) {
        console.error('WebSocket connection error:', error);
        ws.close(1011, 'Server error');
    }
});
// ─── AUTH ROUTES ───────────────────────────────────────────────────────────
// POST /api/auth/signup
app.post('/api/auth/signup', (0, express_validator_1.body)('email').isEmail().normalizeEmail(), (0, express_validator_1.body)('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'), (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Name is required'), (0, express_validator_1.body)('language').optional().isIn(['hi', 'en', 'ta', 'te', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa', 'or']), (0, express_validator_1.body)('businessType').optional().trim(), (0, express_validator_1.body)('region').optional().isArray(), handleValidationErrors, async (req, res) => {
    try {
        const { email, password, name, language, businessType, region } = req.body;
        if ((0, auth_1.getUserByEmail)(email)) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        // Create user with FREE tier activated
        const user = await (0, auth_1.createUser)(email, password, name, language || 'hi', businessType || 'other', region || []);
        const token = (0, auth_1.generateToken)(user);
        // Auto-login response (no login needed)
        res.status(201).json({
            user,
            token,
            message: 'Welcome to BharatMedia! Your FREE tier is activated. Start creating campaigns now!',
            tier: 'free',
            features: {
                free: ['5 campaigns/month', '3 languages', 'Instagram + WhatsApp', 'Basic analytics'],
                pro: ['Unlimited campaigns', '22 languages', 'All 15 platforms', 'AI Video (Nova Reel)', 'Smart scheduling', 'BharatScore analytics']
            }
        });
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Signup failed', message: error.message });
    }
});
// POST /api/auth/login
app.post('/api/auth/login', (0, express_validator_1.body)('email').isEmail().normalizeEmail(), (0, express_validator_1.body)('password').notEmpty(), handleValidationErrors, async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = (0, auth_1.getUserByEmail)(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isPasswordValid = await (0, auth_1.verifyPassword)(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = (0, auth_1.generateToken)(user);
        const { password: _, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword, token });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed', message: error.message });
    }
});
// GET /api/auth/me
app.get('/api/auth/me', auth_2.authMiddleware, (req, res) => {
    try {
        const user = (0, auth_1.getUserById)(req.userId);
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json(user);
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user', message: error.message });
    }
});
// PUT /api/auth/profile
app.put('/api/auth/profile', auth_2.authMiddleware, (0, express_validator_1.body)('name').optional().trim().notEmpty(), (0, express_validator_1.body)('language').optional().isIn(['hi', 'en', 'ta', 'te', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa', 'or']), (0, express_validator_1.body)('businessType').optional().trim(), (0, express_validator_1.body)('region').optional().isArray(), handleValidationErrors, (req, res) => {
    try {
        const { name, language, businessType, region } = req.body;
        const user = (0, auth_1.updateUser)(req.userId, { name, language, businessType, region });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json(user);
    }
    catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Failed to update profile', message: error.message });
    }
});
// ─── CAMPAIGN ROUTES ───────────────────────────────────────────────────────
// POST /api/campaign/create
app.post('/api/campaign/create', auth_2.authMiddleware, (0, express_validator_1.body)('input').trim().notEmpty().withMessage('Input is required'), (0, express_validator_1.body)('inputType').isIn(['text', 'voice', 'image']), (0, express_validator_1.body)('language').isIn(['hi', 'en', 'ta', 'te', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa', 'or']), (0, express_validator_1.body)('businessType').optional().trim(), (0, express_validator_1.body)('region').optional().isArray(), handleValidationErrors, async (req, res) => {
    try {
        const { input, inputType, language, businessType, region, scheduledFor, templateId } = req.body;
        const campaign = (0, store_1.createCampaign)(req.userId, {
            input,
            inputType,
            language,
            businessType,
            region: region || [],
            status: 'processing',
            scheduledFor,
            templateId,
        });
        // Start async pipeline
        (0, pipeline_1.runPipeline)(campaign.id, campaign, (event) => broadcast(campaign.id, event));
        res.json({ campaignId: campaign.id, wsChannel: `/ws?campaignId=${campaign.id}` });
    }
    catch (error) {
        console.error('Campaign creation error:', error);
        res.status(500).json({ error: 'Failed to create campaign', message: error.message });
    }
});
// GET /api/campaign/:id
app.get('/api/campaign/:id', (0, express_validator_1.param)('id').notEmpty(), handleValidationErrors, auth_2.optionalAuthMiddleware, (req, res) => {
    try {
        const campaign = (0, store_1.getCampaign)(req.params.id);
        if (!campaign)
            return res.status(404).json({ error: 'Campaign not found' });
        // Check authorization (allow if user owns it or it's public)
        if (campaign.userId !== req.userId && !campaign.publishedPlatforms) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        res.json(campaign);
    }
    catch (error) {
        console.error('Get campaign error:', error);
        res.status(500).json({ error: 'Failed to get campaign', message: error.message });
    }
});
// GET /api/campaigns
app.get('/api/campaigns', auth_2.authMiddleware, (req, res) => {
    try {
        const userCampaigns = (0, store_1.getUserCampaigns)(req.userId);
        res.json(userCampaigns);
    }
    catch (error) {
        console.error('Get campaigns error:', error);
        res.status(500).json({ error: 'Failed to get campaigns', message: error.message });
    }
});
// POST /api/campaign/:id/publish
app.post('/api/campaign/:id/publish', auth_2.authMiddleware, (0, express_validator_1.param)('id').notEmpty(), (0, express_validator_1.body)('platforms').isArray().notEmpty(), handleValidationErrors, (req, res) => {
    try {
        const campaign = (0, store_1.getCampaign)(req.params.id);
        if (!campaign)
            return res.status(404).json({ error: 'Campaign not found' });
        if (campaign.userId !== req.userId)
            return res.status(403).json({ error: 'Unauthorized' });
        const { platforms } = req.body;
        (0, store_1.updateCampaign)(campaign.id, {
            publishedPlatforms: platforms,
            publishedAt: new Date().toISOString(),
        });
        res.json({ success: true, platforms, message: `Published to ${platforms.length} platforms!` });
    }
    catch (error) {
        console.error('Publish campaign error:', error);
        res.status(500).json({ error: 'Failed to publish campaign', message: error.message });
    }
});
// DELETE /api/campaign/:id
app.delete('/api/campaign/:id', auth_2.authMiddleware, (0, express_validator_1.param)('id').notEmpty(), handleValidationErrors, (req, res) => {
    try {
        const campaign = (0, store_1.getCampaign)(req.params.id);
        if (!campaign)
            return res.status(404).json({ error: 'Campaign not found' });
        if (campaign.userId !== req.userId)
            return res.status(403).json({ error: 'Unauthorized' });
        store_1.campaigns.delete(campaign.id);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Delete campaign error:', error);
        res.status(500).json({ error: 'Failed to delete campaign', message: error.message });
    }
});
// ─── TEMPLATE ROUTES ───────────────────────────────────────────────────────
// POST /api/templates
app.post('/api/templates', auth_2.authMiddleware, (0, express_validator_1.body)('name').trim().notEmpty(), (0, express_validator_1.body)('description').optional().trim(), (0, express_validator_1.body)('businessType').optional().trim(), (0, express_validator_1.body)('language').optional().isIn(['hi', 'en', 'ta', 'te', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa', 'or']), (0, express_validator_1.body)('content').notEmpty(), (0, express_validator_1.body)('isPublic').optional().isBoolean(), handleValidationErrors, (req, res) => {
    try {
        const { name, description, businessType, language, content, isPublic } = req.body;
        const template = (0, store_1.createTemplate)(req.userId, {
            name,
            description,
            businessType,
            language,
            content,
            isPublic: isPublic || false,
        });
        res.status(201).json(template);
    }
    catch (error) {
        console.error('Create template error:', error);
        res.status(500).json({ error: 'Failed to create template', message: error.message });
    }
});
// GET /api/templates
app.get('/api/templates', auth_2.authMiddleware, (req, res) => {
    try {
        const userTemplates = (0, store_1.getUserTemplates)(req.userId);
        res.json(userTemplates);
    }
    catch (error) {
        console.error('Get templates error:', error);
        res.status(500).json({ error: 'Failed to get templates', message: error.message });
    }
});
// GET /api/templates/public
app.get('/api/templates/public', (_req, res) => {
    try {
        const publicTemplates = (0, store_1.getPublicTemplates)();
        res.json(publicTemplates);
    }
    catch (error) {
        console.error('Get public templates error:', error);
        res.status(500).json({ error: 'Failed to get templates', message: error.message });
    }
});
// ─── ANALYTICS ROUTES ──────────────────────────────────────────────────────
// GET /api/analytics
app.get('/api/analytics', auth_2.authMiddleware, (req, res) => {
    try {
        const userAnalytics = (0, store_1.getOrCreateAnalytics)(req.userId);
        res.json(userAnalytics);
    }
    catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ error: 'Failed to get analytics', message: error.message });
    }
});
// POST /api/voice/transcribe  
app.post('/api/voice/transcribe', auth_2.authMiddleware, (0, express_validator_1.body)('audio').notEmpty(), handleValidationErrors, (req, res) => {
    try {
        // Mock Nova Sonic transcription
        setTimeout(() => {
            res.json({
                transcription: 'Mera naam Raju hai, main Varanasi mein silk sarees bechta hoon. Mujhe Diwali ke liye ek campaign chahiye.',
                detectedLanguage: 'hi',
                languageName: 'Hindi',
                confidence: 0.97,
            });
        }, 1200);
    }
    catch (error) {
        console.error('Transcribe error:', error);
        res.status(500).json({ error: 'Failed to transcribe', message: error.message });
    }
});
// ─── PRICING & TIER ROUTES ────────────────────────────────────────────────
// GET /api/pricing
app.get('/api/pricing', (_req, res) => {
    try {
        res.json({
            tiers: [
                {
                    name: 'Free',
                    price: '₹0',
                    period: 'forever',
                    emoji: '🌱',
                    cta: 'Active',
                    features: [
                        '5 campaigns/month',
                        '3 Indian languages',
                        'Instagram + WhatsApp',
                        'Basic analytics',
                        'Standard images',
                        'Email support'
                    ],
                    limitations: [
                        'Limited to 2 platforms',
                        'No video generation',
                        'No scheduling',
                        'No influencer matching'
                    ]
                },
                {
                    name: 'Pro',
                    price: '₹99',
                    period: 'month',
                    emoji: '⚡',
                    cta: 'Upgrade Now',
                    badge: '⭐ Most Popular',
                    features: [
                        'Unlimited campaigns',
                        '22 Indian languages',
                        'All 15 platforms',
                        'AI Video (Nova Reel)',
                        'Smart scheduling',
                        'BharatScore analytics',
                        'Festival campaigns',
                        'Influencer matching',
                        'Priority support',
                        'API access'
                    ],
                    savings: 'Save ₹1,188/year vs monthly'
                },
                {
                    name: 'Enterprise',
                    price: '₹999',
                    period: 'month',
                    emoji: '🏢',
                    cta: 'Contact Sales',
                    features: [
                        'White-label solution',
                        'Custom domain',
                        'API access',
                        'Bulk campaigns',
                        'Dedicated account manager',
                        'SLA guarantee',
                        'Multi-user team',
                        'Custom integrations',
                        '24/7 support',
                        'Advanced analytics'
                    ]
                }
            ]
        });
    }
    catch (error) {
        console.error('Get pricing error:', error);
        res.status(500).json({ error: 'Failed to get pricing', message: error.message });
    }
});
// POST /api/upgrade
app.post('/api/upgrade', auth_2.authMiddleware, (0, express_validator_1.body)('tier').isIn(['free', 'pro', 'enterprise']), handleValidationErrors, (req, res) => {
    try {
        const { tier } = req.body;
        const user = (0, auth_1.updateUser)(req.userId, { tier: tier });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json({
            success: true,
            message: `Upgraded to ${tier} tier!`,
            user,
            nextSteps: tier === 'pro' ? 'Payment link will be sent to your email' : 'Our team will contact you soon'
        });
    }
    catch (error) {
        console.error('Upgrade error:', error);
        res.status(500).json({ error: 'Failed to upgrade', message: error.message });
    }
});
// Health check
app.get('/health', (_req, res) => {
    try {
        res.json({ status: 'ok', service: 'BharatMedia API', version: '2.0.0' });
    }
    catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({ error: 'Health check failed' });
    }
});
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`\n🚀 BharatMedia API v2.0 running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket server on ws://localhost:${PORT}/ws`);
    console.log(`🤖 Powered by Amazon Bedrock (Nova Pro + Omni + Reel + Sonic)\n`);
});
