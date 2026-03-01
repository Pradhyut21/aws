import * as dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { body, param, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import {
    campaigns,
    Campaign,
    createCampaign,
    getCampaign,
    getUserCampaigns,
    updateCampaign,
    templates,
    createTemplate,
    getUserTemplates,
    getPublicTemplates,
    getOrCreateAnalytics,
    updateAnalytics,
} from './services/store';
import {
    createUser,
    getUserByEmail,
    getUserById,
    updateUser,
    verifyPassword,
    generateToken,
    User,
} from './services/auth';
import { authMiddleware, optionalAuthMiddleware, AuthRequest } from './middleware/auth';
import { runPipeline } from './agents/pipeline';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Map campaignId → Set of WebSocket clients
const campaignClients = new Map<string, Set<WebSocket>>();

// ─── SECURITY MIDDLEWARE ───────────────────────────────────────────────────

// CORS with whitelist
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173').split(',');
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS not allowed'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // 5 attempts per 15 minutes
    message: 'Too many login attempts, please try again later.',
    skipSuccessfulRequests: true,
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

// Validation error handler middleware
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }
    next();
};

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    if (err.message === 'CORS not allowed') {
        return res.status(403).json({ error: 'CORS not allowed' });
    }
    res.status(500).json({ error: 'Internal server error', message: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

// Broadcast to all WS clients for a campaign
function broadcast(campaignId: string, data: object) {
    const clients = campaignClients.get(campaignId);
    if (!clients) return;
    const msg = JSON.stringify(data);
    clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(msg); });
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
        if (!campaignClients.has(campaignId)) campaignClients.set(campaignId, new Set());
        campaignClients.get(campaignId)!.add(ws);

        ws.on('close', () => {
            campaignClients.get(campaignId)?.delete(ws);
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    } catch (error) {
        console.error('WebSocket connection error:', error);
        ws.close(1011, 'Server error');
    }
});

// ─── AUTH ROUTES ───────────────────────────────────────────────────────────

// POST /api/auth/signup
app.post('/api/auth/signup',
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('language').optional().isIn(['hi', 'en', 'ta', 'te', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa', 'or']),
    body('businessType').optional().trim(),
    body('region').optional().isArray(),
    handleValidationErrors,
    async (req: Request, res: Response) => {
        try {
            const { email, password, name, language, businessType, region } = req.body;

            if (getUserByEmail(email)) {
                return res.status(409).json({ error: 'Email already registered' });
            }

            // Create user with FREE tier activated
            const user = await createUser(email, password, name, language || 'hi', businessType || 'other', region || []);
            const token = generateToken(user);

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
        } catch (error: any) {
            console.error('Signup error:', error);
            res.status(500).json({ error: 'Signup failed', message: error.message });
        }
    }
);

// POST /api/auth/login
app.post('/api/auth/login',
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    handleValidationErrors,
    async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;

            const user = getUserByEmail(email);
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const isPasswordValid = await verifyPassword(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const token = generateToken(user);
            const { password: _, ...userWithoutPassword } = user;

            res.json({ user: userWithoutPassword, token });
        } catch (error: any) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Login failed', message: error.message });
        }
    }
);

// GET /api/auth/me
app.get('/api/auth/me', authMiddleware, (req: AuthRequest, res: Response) => {
    try {
        const user = getUserById(req.userId!);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error: any) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user', message: error.message });
    }
});

// PUT /api/auth/profile
app.put('/api/auth/profile',
    authMiddleware,
    body('name').optional().trim().notEmpty(),
    body('language').optional().isIn(['hi', 'en', 'ta', 'te', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa', 'or']),
    body('businessType').optional().trim(),
    body('region').optional().isArray(),
    handleValidationErrors,
    (req: AuthRequest, res: Response) => {
        try {
            const { name, language, businessType, region } = req.body;
            const user = updateUser(req.userId!, { name, language, businessType, region });
            if (!user) return res.status(404).json({ error: 'User not found' });
            res.json(user);
        } catch (error: any) {
            console.error('Profile update error:', error);
            res.status(500).json({ error: 'Failed to update profile', message: error.message });
        }
    }
);

// ─── CAMPAIGN ROUTES ───────────────────────────────────────────────────────

// POST /api/campaign/create
app.post('/api/campaign/create',
    authMiddleware,
    body('input').trim().notEmpty().withMessage('Input is required'),
    body('inputType').isIn(['text', 'voice', 'image']),
    body('language').isIn(['hi', 'en', 'ta', 'te', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa', 'or']),
    body('businessType').optional().trim(),
    body('region').optional().isArray(),
    handleValidationErrors,
    async (req: AuthRequest, res: Response) => {
        try {
            const { input, inputType, language, businessType, region, scheduledFor, templateId } = req.body;

            const campaign = createCampaign(req.userId!, {
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
            runPipeline(campaign.id, campaign as any, (event) => broadcast(campaign.id, event));

            res.json({ campaignId: campaign.id, wsChannel: `/ws?campaignId=${campaign.id}` });
        } catch (error: any) {
            console.error('Campaign creation error:', error);
            res.status(500).json({ error: 'Failed to create campaign', message: error.message });
        }
    }
);

// GET /api/campaign/:id
app.get('/api/campaign/:id',
    param('id').notEmpty(),
    handleValidationErrors,
    optionalAuthMiddleware,
    (req: AuthRequest, res: Response) => {
        try {
            const campaign = getCampaign(req.params.id);
            if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

            // Check authorization (allow if user owns it or it's public)
            if (campaign.userId !== req.userId && !campaign.publishedPlatforms) {
                return res.status(403).json({ error: 'Unauthorized' });
            }

            res.json(campaign);
        } catch (error: any) {
            console.error('Get campaign error:', error);
            res.status(500).json({ error: 'Failed to get campaign', message: error.message });
        }
    }
);

// GET /api/campaigns
app.get('/api/campaigns',
    authMiddleware,
    (req: AuthRequest, res: Response) => {
        try {
            const userCampaigns = getUserCampaigns(req.userId!);
            res.json(userCampaigns);
        } catch (error: any) {
            console.error('Get campaigns error:', error);
            res.status(500).json({ error: 'Failed to get campaigns', message: error.message });
        }
    }
);

// POST /api/campaign/:id/publish
app.post('/api/campaign/:id/publish',
    authMiddleware,
    param('id').notEmpty(),
    body('platforms').isArray().notEmpty(),
    handleValidationErrors,
    (req: AuthRequest, res: Response) => {
        try {
            const campaign = getCampaign(req.params.id);
            if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
            if (campaign.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

            const { platforms } = req.body;
            updateCampaign(campaign.id, {
                publishedPlatforms: platforms,
                publishedAt: new Date().toISOString(),
            });

            res.json({ success: true, platforms, message: `Published to ${platforms.length} platforms!` });
        } catch (error: any) {
            console.error('Publish campaign error:', error);
            res.status(500).json({ error: 'Failed to publish campaign', message: error.message });
        }
    }
);

// DELETE /api/campaign/:id
app.delete('/api/campaign/:id',
    authMiddleware,
    param('id').notEmpty(),
    handleValidationErrors,
    (req: AuthRequest, res: Response) => {
        try {
            const campaign = getCampaign(req.params.id);
            if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
            if (campaign.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

            campaigns.delete(campaign.id);
            res.json({ success: true });
        } catch (error: any) {
            console.error('Delete campaign error:', error);
            res.status(500).json({ error: 'Failed to delete campaign', message: error.message });
        }
    }
);

// ─── TEMPLATE ROUTES ───────────────────────────────────────────────────────

// POST /api/templates
app.post('/api/templates',
    authMiddleware,
    body('name').trim().notEmpty(),
    body('description').optional().trim(),
    body('businessType').optional().trim(),
    body('language').optional().isIn(['hi', 'en', 'ta', 'te', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa', 'or']),
    body('content').notEmpty(),
    body('isPublic').optional().isBoolean(),
    handleValidationErrors,
    (req: AuthRequest, res: Response) => {
        try {
            const { name, description, businessType, language, content, isPublic } = req.body;

            const template = createTemplate(req.userId!, {
                name,
                description,
                businessType,
                language,
                content,
                isPublic: isPublic || false,
            });

            res.status(201).json(template);
        } catch (error: any) {
            console.error('Create template error:', error);
            res.status(500).json({ error: 'Failed to create template', message: error.message });
        }
    }
);

// GET /api/templates
app.get('/api/templates',
    authMiddleware,
    (req: AuthRequest, res: Response) => {
        try {
            const userTemplates = getUserTemplates(req.userId!);
            res.json(userTemplates);
        } catch (error: any) {
            console.error('Get templates error:', error);
            res.status(500).json({ error: 'Failed to get templates', message: error.message });
        }
    }
);

// GET /api/templates/public
app.get('/api/templates/public', (_req: Request, res: Response) => {
    try {
        const publicTemplates = getPublicTemplates();
        res.json(publicTemplates);
    } catch (error: any) {
        console.error('Get public templates error:', error);
        res.status(500).json({ error: 'Failed to get templates', message: error.message });
    }
});

// ─── ANALYTICS ROUTES ──────────────────────────────────────────────────────

// GET /api/analytics
app.get('/api/analytics',
    authMiddleware,
    (req: AuthRequest, res: Response) => {
        try {
            const userAnalytics = getOrCreateAnalytics(req.userId!);
            res.json(userAnalytics);
        } catch (error: any) {
            console.error('Get analytics error:', error);
            res.status(500).json({ error: 'Failed to get analytics', message: error.message });
        }
    }
);

// POST /api/voice/transcribe  
app.post('/api/voice/transcribe',
    authMiddleware,
    body('audio').notEmpty(),
    handleValidationErrors,
    (req: AuthRequest, res: Response) => {
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
        } catch (error: any) {
            console.error('Transcribe error:', error);
            res.status(500).json({ error: 'Failed to transcribe', message: error.message });
        }
    }
);

// ─── PRICING & TIER ROUTES ────────────────────────────────────────────────

// GET /api/pricing
app.get('/api/pricing', (_req: Request, res: Response) => {
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
    } catch (error: any) {
        console.error('Get pricing error:', error);
        res.status(500).json({ error: 'Failed to get pricing', message: error.message });
    }
});

// POST /api/upgrade
app.post('/api/upgrade',
    authMiddleware,
    body('tier').isIn(['free', 'pro', 'enterprise']),
    handleValidationErrors,
    (req: AuthRequest, res: Response) => {
        try {
            const { tier } = req.body;

            const user = updateUser(req.userId!, { tier: tier as any });
            if (!user) return res.status(404).json({ error: 'User not found' });

            res.json({
                success: true,
                message: `Upgraded to ${tier} tier!`,
                user,
                nextSteps: tier === 'pro' ? 'Payment link will be sent to your email' : 'Our team will contact you soon'
            });
        } catch (error: any) {
            console.error('Upgrade error:', error);
            res.status(500).json({ error: 'Failed to upgrade', message: error.message });
        }
    }
);

// Health check
app.get('/health', (_req: Request, res: Response) => {
    try {
        res.json({ status: 'ok', service: 'BharatMedia API', version: '2.0.0' });
    } catch (error: any) {
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

export { app, broadcast };
