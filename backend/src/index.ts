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
    Campaign,
    createCampaign,
    getCampaign,
    getUserCampaigns,
    updateCampaign,
    deleteCampaign,
    createTemplate,
    getUserTemplates,
    getPublicTemplates,
    getOrCreateAnalytics,
    updateAnalytics,
    createTableIfNotExists,
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
import {
    getCampaignTrace,
    createExperiment,
    getExperiment,
    getUserExperiments,
    updateExperiment,
    getUserLessons,
    saveBrainDoc,
    getUserBrainDocs,
    deleteBrainDoc,
} from './services/v3store';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PollyClient, SynthesizeSpeechCommand, Engine, OutputFormat, TextType, VoiceId } from '@aws-sdk/client-polly';
import { TranslateClient, TranslateTextCommand } from '@aws-sdk/client-translate';
import { ComprehendClient, DetectSentimentCommand, DetectKeyPhrasesCommand, LanguageCode } from '@aws-sdk/client-comprehend';
import { RekognitionClient, DetectModerationLabelsCommand } from '@aws-sdk/client-rekognition';
import crypto from 'crypto';
import { runPersonaSwarm }   from './agents/personaSwarm';
import { getPersonaReview, seedPersonas } from './services/personaStore';
import multer from 'multer';
import { transcribeAudioBuffer, LANG_DISPLAY_NAMES } from './services/transcribe';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './lib/logger';

// ─── Multer: memory storage for voice audio uploads (max 10 MB) ───────────
const audioUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        // Accept any audio MIME type the browser might send
        if (file.mimetype.startsWith('audio/') || file.mimetype === 'application/octet-stream') {
            cb(null, true);
        } else {
            cb(new Error(`Unsupported MIME type: ${file.mimetype}`));
        }
    },
});

const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
const S3_BUCKET = process.env.S3_BUCKET_NAME || 'bharatmedia-images-dev';
const pollyClient = new PollyClient({ region: process.env.AWS_REGION || 'us-east-1' });
const translateClient = new TranslateClient({ region: process.env.AWS_REGION || 'us-east-1' });
const comprehendClient = new ComprehendClient({ region: process.env.AWS_REGION || 'us-east-1' });
const rekognitionClient = new RekognitionClient({ region: process.env.AWS_REGION || 'us-east-1' });

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

// Global error handler — replaces the previous inline handler.
// Handles AppError subclasses with typed HTTP codes and suppresses stack traces in prod.
app.use(errorHandler);

// Broadcast to all WS clients for a campaign
function broadcast(campaignId: string, data: object) {
    const clients = campaignClients.get(campaignId);
    if (!clients) return;
    const msg = JSON.stringify(data);
    clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(msg); });
}

// ─── WebSocket keepalive — prevents silent drops on slow Bedrock calls ───────
// AWS App Runner and ALBs terminate idle connections after 60s by default.
// A 30s ping/pong keeps the pipeline status stream alive for the full ~90s pipeline.
const WS_PING_INTERVAL = 30_000;
const heartbeat = setInterval(() => {
    wss.clients.forEach((ws: any) => {
        if (ws.isAlive === false) { ws.terminate(); return; }
        ws.isAlive = false;
        ws.ping();
    });
}, WS_PING_INTERVAL);
wss.on('close', () => clearInterval(heartbeat));

// WebSocket connection handler
wss.on('connection', (ws: any, req) => {
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });

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

        ws.on('error', (error: Error) => {
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

            const existingUser = await getUserByEmail(email);
            if (existingUser) {
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

            const user = await getUserByEmail(email);
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
app.get('/api/auth/me', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await getUserById(req.userId!);
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
    async (req: AuthRequest, res: Response) => {
        try {
            const { name, language, businessType, region } = req.body;
            const user = await updateUser(req.userId!, { name, language, businessType, region });
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

            const campaign = await createCampaign(req.userId!, {
                input,
                inputType,
                language,
                businessType,
                region: region || [],
                status: 'processing',
                scheduledFor,
                templateId,
            });

            // Start async pipeline (fire-and-forget — do NOT await)
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
    async (req: AuthRequest, res: Response) => {
        try {
            const campaign = await getCampaign(req.params.id);
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
    async (req: AuthRequest, res: Response) => {
        try {
            const userCampaigns = await getUserCampaigns(req.userId!);
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
    async (req: AuthRequest, res: Response) => {
        try {
            const campaign = await getCampaign(req.params.id);
            if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
            if (campaign.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

            const { platforms } = req.body;
            await updateCampaign(campaign.id, {
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
    async (req: AuthRequest, res: Response) => {
        try {
            const campaign = await getCampaign(req.params.id);
            if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
            if (campaign.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

            await deleteCampaign(campaign.id);
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
    async (req: AuthRequest, res: Response) => {
        try {
            const { name, description, businessType, language, content, isPublic } = req.body;

            const template = await createTemplate(req.userId!, {
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
    async (req: AuthRequest, res: Response) => {
        try {
            const userTemplates = await getUserTemplates(req.userId!);
            res.json(userTemplates);
        } catch (error: any) {
            console.error('Get templates error:', error);
            res.status(500).json({ error: 'Failed to get templates', message: error.message });
        }
    }
);

// GET /api/templates/public
app.get('/api/templates/public', async (_req: Request, res: Response) => {
    try {
        const publicTemplates = await getPublicTemplates();
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
    async (req: AuthRequest, res: Response) => {
        try {
            const userAnalytics = await getOrCreateAnalytics(req.userId!);
            res.json(userAnalytics);
        } catch (error: any) {
            console.error('Get analytics error:', error);
            res.status(500).json({ error: 'Failed to get analytics', message: error.message });
        }
    }
);

// POST /api/voice/transcribe
// ─────────────────────────────────────────────────────────────────────────────
// ✅ REAL: Amazon Transcribe Streaming — speech-to-text for 10 Indian languages
//
// Audio pipeline:
//   Browser MediaRecorder (audio/webm;codecs=opus)
//     → multipart/form-data, field: "audio"
//     → ffmpeg converts to PCM 16kHz mono (s16le)
//     → Amazon Transcribe Streaming (StartStreamTranscription)
//     → Transcript + confidence returned
//
// Supported: hi-IN, en-IN, ta-IN, te-IN, kn-IN, ml-IN, mr-IN
// Fallback: if Transcribe is unavailable, returns labeled DEMO response
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/voice/transcribe',
    authMiddleware,
    audioUpload.single('audio'),
    async (req: AuthRequest, res: Response) => {
        const language = (req.body?.language || 'hi') as string;
        const langName = LANG_DISPLAY_NAMES[language] ?? 'Hindi';

        // ── Validate: must have an audio file ────────────────────────────
        if (!req.file || req.file.size === 0) {
            return res.status(400).json({
                error: 'No audio received',
                hint: 'Send audio as multipart/form-data with field name "audio"',
            });
        }

        console.log(`🎙️ [Transcribe] Received ${req.file.size} bytes (${req.file.mimetype}), language: ${language}`);

        try {
            // ── Real Amazon Transcribe Streaming call ────────────────────
            const result = await transcribeAudioBuffer(req.file.buffer, language);

            if (!result.transcription) {
                // Transcribe returned empty (silence / very short clip) — use demo
                return res.json({
                    transcription: 'Mera naam Raju hai, main Varanasi mein silk sarees bechta hoon. Mujhe Diwali ke liye ek campaign chahiye jo Instagram aur WhatsApp par Hindi mein ho.',
                    detectedLanguage: language,
                    languageName: langName,
                    confidence: 0.97,
                    source: 'DEMO_FALLBACK',
                    note: 'No speech detected in recording — showing demo transcript. Please speak clearly.',
                    service: 'Amazon Transcribe Streaming',
                });
            }

            res.json(result);

        } catch (error: any) {
            console.error('[Transcribe] Error:', error.message);

            // ── Graceful fallback — labeled as DEMO so UI is transparent ─
            res.json({
                transcription: 'Mera naam Raju hai, main Varanasi mein silk sarees bechta hoon. Mujhe Diwali ke liye ek campaign chahiye jo Instagram aur WhatsApp par Hindi mein ho.',
                detectedLanguage: language,
                languageName: langName,
                confidence: 0.97,
                source: 'DEMO_FALLBACK',
                note: `Amazon Transcribe unavailable (${error.message?.slice(0, 80) ?? 'unknown error'}) — showing demo transcript. Check IAM permissions: transcribe:StartStreamTranscription`,
                service: 'Amazon Transcribe Streaming',
                upgradeRequired: 'Ensure IAM role has transcribe:StartStreamTranscription permission',
            });
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
    async (req: AuthRequest, res: Response) => {
        try {
            const { tier } = req.body;

            const user = await updateUser(req.userId!, { tier: tier as any });
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

// ─── V3 AGENT TRACE ROUTES ────────────────────────────────────────────────

// GET /api/campaign/:id/trace
app.get('/api/campaign/:id/trace',
    authMiddleware,
    param('id').notEmpty(),
    handleValidationErrors,
    async (req: AuthRequest, res: Response) => {
        try {
            const campaign = await getCampaign(req.params.id);
            if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
            if (campaign.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });
            const trace = await getCampaignTrace(req.params.id);
            res.json(trace);
        } catch (error: any) {
            res.status(500).json({ error: 'Failed to get trace', message: error.message });
        }
    }
);

// ─── V3 EXPERIMENT ROUTES ─────────────────────────────────────────────────

// GET /api/experiments
app.get('/api/experiments',
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
        try {
            const experiments = await getUserExperiments(req.userId!);
            res.json(experiments);
        } catch (error: any) {
            res.status(500).json({ error: 'Failed to get experiments', message: error.message });
        }
    }
);

// GET /api/experiments/:id
app.get('/api/experiments/:id',
    authMiddleware,
    param('id').notEmpty(),
    handleValidationErrors,
    async (req: AuthRequest, res: Response) => {
        try {
            const exp = await getExperiment(req.params.id);
            if (!exp) return res.status(404).json({ error: 'Experiment not found' });
            if (exp.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });
            res.json(exp);
        } catch (error: any) {
            res.status(500).json({ error: 'Failed to get experiment', message: error.message });
        }
    }
);

// PATCH /api/experiments/:id/metrics  — update variant metrics
app.patch('/api/experiments/:id/metrics',
    authMiddleware,
    param('id').notEmpty(),
    body('variantId').notEmpty(),
    body('metrics').isObject(),
    handleValidationErrors,
    async (req: AuthRequest, res: Response) => {
        try {
            const exp = await getExperiment(req.params.id);
            if (!exp) return res.status(404).json({ error: 'Experiment not found' });
            if (exp.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

            const { variantId, metrics } = req.body;
            const updated = await updateExperiment(req.params.id, {
                variants: exp.variants.map(v =>
                    v.id === variantId ? { ...v, metrics: { ...v.metrics, ...metrics } } : v
                ),
            });
            res.json(updated);
        } catch (error: any) {
            res.status(500).json({ error: 'Failed to update metrics', message: error.message });
        }
    }
);

// ─── V3 LEARNING MEMORY ROUTES ────────────────────────────────────────────

// GET /api/learning
app.get('/api/learning',
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
        try {
            const lessons = await getUserLessons(req.userId!, 20);
            res.json(lessons);
        } catch (error: any) {
            res.status(500).json({ error: 'Failed to get learning data', message: error.message });
        }
    }
);

// ─── V3 BHARATBRAIN ROUTES ────────────────────────────────────────────────

// POST /api/brain/upload — upload a brand document to S3 + register in DynamoDB
app.post('/api/brain/upload',
    authMiddleware,
    body('name').trim().notEmpty(),
    body('type').isIn(['brand_guidelines', 'product_catalog', 'persona', 'previous_campaign', 'reviews', 'competitor', 'other']),
    body('content').notEmpty().withMessage('File content (base64) required'),
    body('mimeType').optional().isString(),
    handleValidationErrors,
    async (req: AuthRequest, res: Response) => {
        try {
            const { name, type, content, mimeType = 'text/plain' } = req.body;
            const buffer = Buffer.from(content, 'base64');
            const docId  = crypto.randomUUID();
            const s3Key  = `brain/${req.userId!}/${docId}-${name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

            await s3.send(new PutObjectCommand({
                Bucket:      S3_BUCKET,
                Key:         s3Key,
                Body:        buffer,
                ContentType: mimeType,
            }));

            const doc = await saveBrainDoc(req.userId!, {
                name,
                type,
                s3Key,
                size: buffer.length,
            });

            res.status(201).json(doc);
        } catch (error: any) {
            console.error('BharatBrain upload error:', error);
            res.status(500).json({ error: 'Upload failed', message: error.message });
        }
    }
);

// GET /api/brain
app.get('/api/brain',
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
        try {
            const docs = await getUserBrainDocs(req.userId!);
            res.json(docs);
        } catch (error: any) {
            res.status(500).json({ error: 'Failed to get documents', message: error.message });
        }
    }
);

// DELETE /api/brain/:id
app.delete('/api/brain/:id',
    authMiddleware,
    param('id').notEmpty(),
    handleValidationErrors,
    async (req: AuthRequest, res: Response) => {
        try {
            await deleteBrainDoc(req.userId!, req.params.id);
            res.json({ success: true });
        } catch (error: any) {
            res.status(500).json({ error: 'Failed to delete document', message: error.message });
        }
    }
);

// ─── V3 MARKET PULSE ROUTE (Demo stream — clearly labelled SIMULATED) ──────

const MARKET_SIGNALS = [
    { topic: 'Kannada food content', change: '+41%', trend: 'up', region: 'Bengaluru' },
    { topic: 'Weekend offer campaigns', change: '+27%', trend: 'up', region: 'Karnataka' },
    { topic: 'Combo meal searches', change: '+63%', trend: 'up', region: 'South India' },
    { topic: 'Regional language ads', change: '+18%', trend: 'up', region: 'Pan India' },
    { topic: 'Festival campaign spend', change: '+34%', trend: 'up', region: 'Maharashtra' },
    { topic: 'Video content engagement', change: '+52%', trend: 'up', region: 'Pan India' },
    { topic: 'Discount-only campaigns', change: '-12%', trend: 'down', region: 'Pan India' },
];

app.get('/api/market-pulse',
    optionalAuthMiddleware,   // ← changed: unauthenticated users can see demo signals
    async (_req: AuthRequest, res: Response) => {
        // ⚠️ SIMULATED — labels every item as demo data
        const signals = MARKET_SIGNALS.map(s => ({
            ...s,
            source: 'SIMULATED',
            note: 'Demo data — connect to a real social listening provider in production',
            timestamp: new Date().toISOString(),
        }));
        res.json({ signals, source: 'SIMULATED', disclaimer: 'These signals are demo data for hackathon demonstration. Not real-time social data.' });
    }
);

// ─── V3 CAMPAIGN SIMULATOR ROUTE ──────────────────────────────────────────

app.post('/api/campaign/simulate',
    authMiddleware,
    body('businessType').notEmpty(),
    body('region').isArray(),
    body('language').notEmpty(),
    body('platform').optional(),
    handleValidationErrors,
    async (req: AuthRequest, res: Response) => {
        try {
            const { businessType, region, language, platform = 'instagram' } = req.body;

            // Model-informed estimates based on region + business type
            const regionMultipliers: Record<string, number> = {
                Mumbai: 1.8, Delhi: 1.9, Bengaluru: 1.6, Hyderabad: 1.4,
                Chennai: 1.3, Kolkata: 1.2, Jaipur: 0.9, Varanasi: 0.7,
            };
            const regionKey = region[0] || '';
            const multiplier = regionMultipliers[regionKey] ?? 1.0;
            const baseReach  = Math.round(18000 * multiplier);

            res.json({
                source: 'MODEL_ESTIMATE',
                disclaimer: 'These are model-based estimates, not guarantees. Actual performance depends on many factors.',
                estimates: {
                    audienceSize:    Math.round(baseReach * 2.2),
                    estimatedReach:  { min: Math.round(baseReach * 0.9), max: Math.round(baseReach * 1.3) },
                    estimatedCtr:    { min: 1.8, max: 3.4 },
                    engagement:      { min: 3.2, max: 5.8 },
                    bestTime:        platform === 'instagram' ? '7:00 PM IST' : '12:00 PM IST',
                    languageBonus:   language !== 'en' ? '+18% predicted CTR for regional language' : null,
                },
                suggestions: [
                    'Add a time-bound offer (e.g., "valid this weekend") to improve CTR',
                    `${language !== 'en' ? 'Regional language caption' : 'Bilingual caption'} typically performs better in ${regionKey || 'your region'}`,
                    'Use video or Reel format for 2–3x engagement vs static image',
                ],
            });
        } catch (error: any) {
            res.status(500).json({ error: 'Simulation failed', message: error.message });
        }
    }
);

// ─── ABORT / EMERGENCY STOP (GatedCart-inspired) ──────────────────────────
// POST /api/campaign/:id/abort
// Sets campaign status to 'aborted' immediately — useful if Bedrock is slow
// during a demo or if the user wants to kill the run.
app.post('/api/campaign/:id/abort',
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
        try {
            const campaign = await getCampaign(req.params.id);
            if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
            if (campaign.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });
            await updateCampaign(req.params.id, { status: 'aborted' });
            broadcast(req.params.id, { type: 'abort', campaignId: req.params.id, timestamp: new Date().toISOString() });
            res.json({ campaignId: req.params.id, status: 'aborted', message: 'Campaign aborted' });
        } catch (error: any) {
            res.status(500).json({ error: 'Abort failed', message: error.message });
        }
    }
);

// ─── SSE STREAMING ENDPOINT (Veritas-inspired) ────────────────────────────
// GET /api/campaign/:id/stream
// Server-Sent Events alternative to WebSocket — more reliable on App Runner
// and through proxies that don't support WebSocket header upgrades.
// The frontend hooks into this automatically if WebSocket fails.
app.get('/api/campaign/:id/stream',
    async (req: Request, res: Response) => {
        const campaignId = req.params.id;
        res.setHeader('Content-Type',  'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection',    'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.flushHeaders();

        // Send existing campaign state immediately
        try {
            const campaign = await getCampaign(campaignId);
            if (campaign) {
                res.write(`data: ${JSON.stringify({ type: 'state', campaign })}\n\n`);
                if (campaign.status === 'done' || campaign.status === 'error' || campaign.status === 'aborted') {
                    res.end();
                    return;
                }
            }
        } catch { /* campaign not found yet, stay open */ }

        // Relay WebSocket broadcast events to this SSE client
        const relay = (event: object) => {
            const data = JSON.stringify(event);
            if (data.includes(`"campaignId":"${campaignId}"`) || data.includes(`"type":"broadcast"`)) {
                res.write(`data: ${data}\n\n`);
                const parsed = event as any;
                if (parsed.type === 'done' || parsed.type === 'error' || parsed.type === 'abort') {
                    res.end();
                }
            }
        };

        // Register relay — import sseClients map to forward broadcasts
        (res as any)._sseRelay = relay;
        if (!(app as any)._sseClients) (app as any)._sseClients = new Map();
        const clients: Map<string, typeof relay> = (app as any)._sseClients;
        clients.set(campaignId + ':' + Date.now(), relay);

        req.on('close', () => {
            clients.forEach((v, k) => { if (v === relay) clients.delete(k); });
        });

        // Keep-alive ping every 15s
        const ping = setInterval(() => { try { res.write(':ping\n\n'); } catch { clearInterval(ping); } }, 15000);
        req.on('close', () => clearInterval(ping));
    }
);

// ─── AUDIT LOG (Socmint-Shield-inspired) ──────────────────────────────────
// GET /api/audit
// Shows the 50 most recent agent trace steps across ALL campaigns.
// Gives judges evidence of real system activity without needing a campaign ID.
app.get('/api/audit',
    authMiddleware,
    async (_req: AuthRequest, res: Response) => {
        try {
            const { scanRecentTraces } = await import('./services/v3store');
            const traces = await scanRecentTraces(50);
            res.json({
                count: traces.length,
                traces,
                note: 'Most recent 50 agent trace steps across all campaigns — live from DynamoDB',
            });
        } catch (error: any) {
            res.status(500).json({ error: 'Audit log unavailable', message: error.message });
        }
    }
);

// Health check (App Runner pings this)
app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'BharatMedia API', version: '3.1.0', timestamp: new Date().toISOString() });
});

// ─── IMAGE GENERATION ENDPOINT ─────────────────────────────────────────────
// POST /api/generate-image
// Calls Titan Image Generator → uploads to S3 → returns public URL.
// Falls back to themed Unsplash/Picsum if Bedrock unavailable.
app.post('/api/generate-image',
    optionalAuthMiddleware,
    body('prompt').trim().notEmpty().withMessage('Prompt is required'),
    body('businessType').optional().trim(),
    body('region').optional().trim(),
    handleValidationErrors,
    async (req: AuthRequest, res: Response) => {
        const { prompt, businessType = 'business', region = 'India' } = req.body;
        const { generateTitanImage } = await import('./services/bedrock');

        // Build a richer, India-specific image prompt
        const enrichedPrompt = `${prompt}. Style: vibrant, modern Indian aesthetic, professional product photography, warm colours, ` +
            `cultural context of ${region}, suitable for ${businessType} marketing. High quality, no text overlays.`;

        try {
            const imageUrl = await generateTitanImage(enrichedPrompt, 1024, 1024);
            res.json({
                url: imageUrl,
                source: 'titan',
                prompt: enrichedPrompt,
                message: 'Generated by Amazon Titan Image Generator v1',
            });
        } catch (titanErr: any) {
            console.warn('Titan Image failed:', titanErr.message, '— using fallback');
            // Graceful fallback: keyword-seeded Picsum (deterministic, offline-friendly)
            const seed = encodeURIComponent(`${businessType}-${region}`).replace(/%/g, '');
            const fallbackUrl = `https://picsum.photos/seed/${seed}/1024/1024`;
            res.json({
                url: fallbackUrl,
                source: 'fallback',
                prompt: enrichedPrompt,
                message: 'Titan unavailable — using placeholder image',
                titanError: titanErr.message,
            });
        }
    }
);

// ─── AMAZON POLLY TTS ENDPOINT ─────────────────────────────────────────────
// POST /api/voice/synthesize
// Converts text to speech using Amazon Polly, stores in S3, returns presigned URL.
const POLLY_VOICES: Record<string, VoiceId> = {
    hi: 'Aditi',      // Hindi
    en: 'Kajal',      // Indian English
    ta: 'Aditi',      // Tamil — Polly doesn't have native Tamil; use Aditi
    te: 'Aditi',
    kn: 'Aditi',
    mr: 'Aditi',
    bn: 'Aditi',
    gu: 'Aditi',
    pa: 'Aditi',
    ml: 'Aditi',
};

app.post('/api/voice/synthesize',
    optionalAuthMiddleware,
    body('text').trim().notEmpty().isLength({ max: 1500 }),
    body('language').optional().isIn(['hi', 'en', 'ta', 'te', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa']),
    handleValidationErrors,
    async (req: AuthRequest, res: Response) => {
        const { text, language = 'hi' } = req.body;
        const voiceId = POLLY_VOICES[language] || 'Aditi';

        try {
            const pollyCmd = new SynthesizeSpeechCommand({
                Text: text.slice(0, 1500),
                TextType: TextType.TEXT,
                OutputFormat: OutputFormat.MP3,
                VoiceId: voiceId,
                Engine: Engine.STANDARD,
                LanguageCode: language === 'en' ? 'en-IN' : 'hi-IN',
            });

            const pollyRes = await pollyClient.send(pollyCmd);

            if (!pollyRes.AudioStream) throw new Error('Polly returned no audio stream');

            // Stream audio bytes to buffer
            const chunks: Uint8Array[] = [];
            for await (const chunk of pollyRes.AudioStream as any) {
                chunks.push(chunk);
            }
            const audioBuffer = Buffer.concat(chunks);

            // Upload to S3
            const s3Key = `voice/${Date.now()}-${voiceId}.mp3`;
            await s3.send(new PutObjectCommand({
                Bucket: S3_BUCKET,
                Key: s3Key,
                Body: audioBuffer,
                ContentType: 'audio/mpeg',
                CacheControl: 'max-age=86400',
            }));

            // Generate presigned URL (1 hour expiry)
            const signedUrl = await getSignedUrl(s3, new GetObjectCommand({ Bucket: S3_BUCKET, Key: s3Key }), { expiresIn: 3600 });

            res.json({
                audioUrl: signedUrl,
                voice: voiceId,
                language,
                source: 'amazon_polly',
                characters: text.length,
            });
        } catch (err: any) {
            console.error('Polly error:', err.message);
            res.status(500).json({
                error: 'Voice synthesis failed',
                message: err.message,
                suggestion: 'Ensure the IAM role has polly:SynthesizeSpeech permission',
            });
        }
    }
);

// ─── AMAZON TRANSLATE ENDPOINT ──────────────────────────────────────────────
// POST /api/translate
// Translates campaign copy into multiple Indian languages using Amazon Translate.
const TRANSLATE_LANGS = ['hi', 'ta', 'te', 'kn', 'ml', 'mr', 'bn', 'gu', 'pa'];

app.post('/api/translate',
    optionalAuthMiddleware,
    body('text').trim().notEmpty().isLength({ max: 5000 }),
    body('sourceLang').optional().isString(),
    body('targetLangs').optional().isArray(),
    handleValidationErrors,
    async (req: AuthRequest, res: Response) => {
        const { text, sourceLang = 'en', targetLangs = TRANSLATE_LANGS } = req.body;

        try {
            // Run all translations in parallel
            const results = await Promise.allSettled(
                targetLangs.map(async (lang: string) => {
                    const cmd = new TranslateTextCommand({
                        Text: text.slice(0, 5000),
                        SourceLanguageCode: sourceLang,
                        TargetLanguageCode: lang,
                    });
                    const r = await translateClient.send(cmd);
                    return { lang, text: r.TranslatedText };
                })
            );

            const translations: Record<string, string> = {};
            results.forEach((r) => {
                if (r.status === 'fulfilled') {
                    translations[r.value.lang] = r.value.text;
                }
            });

            res.json({
                source: text,
                sourceLang,
                translations,
                service: 'amazon_translate',
                languageCount: Object.keys(translations).length,
            });
        } catch (err: any) {
            console.error('Translate error:', err.message);
            res.status(500).json({ error: 'Translation failed', message: err.message });
        }
    }
);

// ─── AMAZON COMPREHEND ENDPOINT ─────────────────────────────────────────────
// POST /api/analyze
// Runs sentiment + key phrase detection on campaign copy.
app.post('/api/analyze',
    optionalAuthMiddleware,
    body('text').trim().notEmpty().isLength({ max: 5000 }),
    body('language').optional().isString(),
    handleValidationErrors,
    async (req: AuthRequest, res: Response) => {
        const { text, language = 'en' } = req.body;
        // Comprehend supports: en, es, fr, de, it, pt, ar, hi, ja, ko, zh, zh-TW
        const comprehendLang: LanguageCode = language === 'hi' ? LanguageCode.HI : LanguageCode.EN;

        try {
            const [sentimentRes, keyPhraseRes] = await Promise.all([
                comprehendClient.send(new DetectSentimentCommand({
                    Text: text.slice(0, 5000),
                    LanguageCode: comprehendLang,
                })),
                comprehendClient.send(new DetectKeyPhrasesCommand({
                    Text: text.slice(0, 5000),
                    LanguageCode: comprehendLang,
                })),
            ]);

            const topPhrases = (keyPhraseRes.KeyPhrases || [])
                .sort((a, b) => (b.Score || 0) - (a.Score || 0))
                .slice(0, 8)
                .map(p => ({ text: p.Text, score: Math.round((p.Score || 0) * 100) }));

            res.json({
                sentiment: {
                    label: sentimentRes.Sentiment,
                    scores: sentimentRes.SentimentScore,
                },
                keyPhrases: topPhrases,
                language: comprehendLang,
                service: 'amazon_comprehend',
                characterCount: text.length,
            });
        } catch (err: any) {
            console.error('Comprehend error:', err.message);
            res.status(500).json({ error: 'Text analysis failed', message: err.message });
        }
    }
);

// ─── AMAZON REKOGNITION — IMAGE CONTENT MODERATION ─────────────────────────
// POST /api/image/moderate
// Checks a base64-encoded image for unsafe content using Rekognition DetectModerationLabels.
// Returns a structured result with moderation categories and confidence scores.
// Used by: SensitivityMatrix "🖼️ Image Safety" row.
app.post('/api/image/moderate',
    optionalAuthMiddleware,
    body('imageBase64').notEmpty().withMessage('imageBase64 is required'),
    body('minConfidence').optional().isFloat({ min: 0, max: 100 }),
    handleValidationErrors,
    async (req: AuthRequest, res: Response) => {
        const { imageBase64, minConfidence = 60 } = req.body;

        try {
            const imageBuffer = Buffer.from(
                imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
                'base64'
            );

            const command = new DetectModerationLabelsCommand({
                Image: { Bytes: imageBuffer },
                MinConfidence: minConfidence,
            });

            const result = await rekognitionClient.send(command);
            const labels = result.ModerationLabels || [];

            // Bucket into categories for the UI
            const categories = [
                'Explicit Nudity',
                'Suggestive',
                'Violence',
                'Visually Disturbing',
                'Rude Gestures',
                'Drugs',
                'Tobacco',
                'Alcohol',
                'Gambling',
                'Hate Symbols',
            ];

            const flagged = labels.map(l => ({
                name: l.Name,
                parentName: l.ParentName,
                confidence: Math.round((l.Confidence || 0) * 10) / 10,
            }));

            const safe = flagged.length === 0;
            const maxConfidence = flagged.length > 0
                ? Math.max(...flagged.map(f => f.confidence))
                : 100;

            res.json({
                safe,
                score: safe ? 100 : Math.max(0, Math.round(100 - maxConfidence)),
                flaggedLabels: flagged,
                labelCount: flagged.length,
                checkedCategories: categories,
                service: 'amazon_rekognition',
                moderationModelVersion: result.ModerationModelVersion,
            });
        } catch (err: any) {
            console.error('Rekognition error:', err.message);
            // Graceful degradation: if Rekognition unavailable, return safe=true with warning
            res.status(500).json({
                error: 'Image moderation failed',
                message: err.message,
                suggestion: 'Ensure IAM role has rekognition:DetectModerationLabels permission',
            });
        }
    }
);

// ─── PERSONA SWARM ROUTES (aws-samples/sample-agentic-genai-agentcore pattern) ─

// POST /api/campaign/:id/persona-review
// Triggers the BharatPersonaSwarm — 20 Indian personas review the campaign in parallel.
// Returns 202 immediately; client polls GET for the result.
app.post('/api/campaign/:id/persona-review',
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
        try {
            const campaign = await getCampaign(req.params.id);
            if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
            if (campaign.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });
            if (campaign.status !== 'done') {
                return res.status(400).json({ error: 'Campaign must be complete before persona review' });
            }

            // Check if review already exists
            const existing = await getPersonaReview(req.params.id);
            if (existing) return res.json(existing);

            // Build campaign content string from stored content
            const content = campaign.content as any;
            const campaignContent = [
                content?.captions?.instagram || content?.captions?.summary || '',
                content?.videoScript || '',
                content?.hashtags?.join(' ') || '',
                campaign.input || '',
            ].filter(Boolean).join('\n\n').slice(0, 3000);

            // Run swarm async — respond 202 immediately
            const targetPersonaIds = req.body?.personaIds; // optional subset
            res.status(202).json({
                message: 'BharatPersonaSwarm started',
                campaignId: req.params.id,
                personaCount: 20,
                pollUrl: `/api/campaign/${req.params.id}/persona-review`,
                estimatedSeconds: 15,
            });

            // Fire and forget — saves result to DynamoDB
            runPersonaSwarm({ campaignId: req.params.id, campaignContent, targetPersonaIds })
                .catch(err => console.error('[PersonaSwarm] Error:', err.message));

        } catch (error: any) {
            res.status(500).json({ error: 'Persona review failed to start', message: error.message });
        }
    }
);

// GET /api/campaign/:id/persona-review
// Poll for persona review result. Returns 202 if still processing, 200 when done.
app.get('/api/campaign/:id/persona-review',
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
        try {
            const result = await getPersonaReview(req.params.id);
            if (!result) {
                return res.status(202).json({ status: 'processing', message: 'Persona review in progress — poll again in 5s' });
            }
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: 'Failed to fetch persona review', message: error.message });
        }
    }
);

const PORT = process.env.PORT || 4000;

// Bootstrap DynamoDB table + Indian personas on startup (both idempotent)
// ⚠️ If AWS credentials are missing/invalid, log a warning but still start the server
// so the frontend can connect and get meaningful error messages instead of ERR_CONNECTION_REFUSED.
createTableIfNotExists()
    .then(() => seedPersonas())   // seed 20 Indian personas after table is ready
    .catch((err) => {
        console.warn(`\n⚠️  DynamoDB init failed (${err.message})`);
        console.warn('   Running in DEGRADED mode — AWS features unavailable.');
        logger.warn('DynamoDB table not reachable — check AWS credentials', {});
    })
    .finally(() => {
        server.listen(PORT, () => {
            logger.info('BharatMedia API v3.0 started', {
                port: PORT,
                wsUrl: `ws://localhost:${PORT}/ws`,
                dynamoTable: process.env.DYNAMODB_TABLE || 'bharatmedia-dev',
                s3Bucket: process.env.S3_BUCKET_NAME || 'bharatmedia-images-dev',
            });
        });
    });


export { app, broadcast };
