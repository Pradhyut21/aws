# BharatMedia v2.0 - Architecture Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER (Browser)                          │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ React Frontend (Vite)                                            │  │
│  │ - Landing page with 3D India Globe                              │  │
│  │ - Dashboard with campaign list                                  │  │
│  │ - Campaign creation form                                        │  │
│  │ - Analytics dashboard                                           │  │
│  │ - Template library                                              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │
                    HTTP/WebSocket (Axios + WS)
                                 │
┌────────────────────────────────▼─────────────────────────────────────────┐
│                      API LAYER (Express.js)                              │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Authentication Middleware                                        │  │
│  │ - JWT verification                                               │  │
│  │ - User context injection                                         │  │
│  │ - Protected route enforcement                                    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Route Handlers                                                   │  │
│  │                                                                  │  │
│  │ Auth Routes:                                                     │  │
│  │ - POST   /api/auth/signup                                        │  │
│  │ - POST   /api/auth/login                                         │  │
│  │ - GET    /api/auth/me                                            │  │
│  │ - PUT    /api/auth/profile                                       │  │
│  │                                                                  │  │
│  │ Campaign Routes:                                                 │  │
│  │ - POST   /api/campaign/create                                    │  │
│  │ - GET    /api/campaigns                                          │  │
│  │ - GET    /api/campaign/:id                                       │  │
│  │ - POST   /api/campaign/:id/publish                               │  │
│  │ - DELETE /api/campaign/:id                                       │  │
│  │                                                                  │  │
│  │ Template Routes:                                                 │  │
│  │ - POST   /api/templates                                          │  │
│  │ - GET    /api/templates                                          │  │
│  │ - GET    /api/templates/public                                   │  │
│  │                                                                  │  │
│  │ Analytics Routes:                                                │  │
│  │ - GET    /api/analytics                                          │  │
│  │                                                                  │  │
│  │ Voice Routes:                                                    │  │
│  │ - POST   /api/voice/transcribe                                   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ WebSocket Server                                                 │  │
│  │ - Real-time pipeline updates                                     │  │
│  │ - Campaign-based channels                                        │  │
│  │ - Stage progress broadcasting                                    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
┌───────────────────▼──┐  ┌──────▼──────┐  ┌─▼──────────────────┐
│  SERVICE LAYER       │  │ DATA LAYER  │  │ AWS BEDROCK        │
│                      │  │             │  │                    │
│ ┌──────────────────┐ │  │ ┌─────────┐ │  │ ┌────────────────┐ │
│ │ Auth Service     │ │  │ │ Campaigns│ │  │ │ Nova Pro       │ │
│ │ - signup()       │ │  │ │ Map     │ │  │ │ - Research     │ │
│ │ - login()        │ │  │ │         │ │  │ │ - Analysis     │ │
│ │ - verify()       │ │  │ └─────────┘ │  │ │ - SEO          │ │
│ │ - hash()         │ │  │             │  │ └────────────────┘ │
│ └──────────────────┘ │  │ ┌─────────┐ │  │                    │
│                      │  │ │ Users   │ │  │ ┌────────────────┐ │
│ ┌──────────────────┐ │  │ │ Map     │ │  │ │ Nova Omni      │ │
│ │ Bedrock Service  │ │  │ │         │ │  │ │ - Multilingual │ │
│ │ - invokeNovaPro()│ │  │ └─────────┘ │  │ │ - Content Gen  │ │
│ │ - invokeNovaOmni│ │  │             │  │ └────────────────┘ │
│ │ - invokeNovaReel│ │  │ ┌─────────┐ │  │                    │
│ │ - invokeNovaSonic│ │  │ │Templates│ │  │ ┌────────────────┐ │
│ │ - generateImage()│ │  │ │ Map     │ │  │ │ Nova Reel      │ │
│ │ - checkSafety() │ │  │ │         │ │  │ │ - Video Scripts│ │
│ └──────────────────┘ │  │ └─────────┘ │  │ └────────────────┘ │
│                      │  │             │  │                    │
│ ┌──────────────────┐ │  │ ┌─────────┐ │  │ ┌────────────────┐ │
│ │ Store Service    │ │  │ │Analytics│ │  │ │ Nova Sonic     │ │
│ │ - createCampaign │ │  │ │ Map     │ │  │ │ - Transcription│ │
│ │ - getCampaign()  │ │  │ │         │ │  │ │ - Translation  │ │
│ │ - updateCampaign │ │  │ └─────────┘ │  │ └────────────────┘ │
│ │ - deleteCampaign │ │  │             │  │                    │
│ └──────────────────┘ │  │ (In-Memory) │  │ ┌────────────────┐ │
│                      │  │ (DynamoDB   │  │ │ Titan Image    │ │
│                      │  │  in prod)   │  │ │ - Image Gen    │ │
│                      │  │             │  │ └────────────────┘ │
│                      │  │             │  │                    │
│                      │  │             │  │ ┌────────────────┐ │
│                      │  │             │  │ │ Guardrails     │ │
│                      │  │             │  │ │ - Safety Check │ │
│                      │  │             │  │ └────────────────┘ │
└──────────────────────┘  └─────────────┘  └────────────────────┘
```

---

## Data Flow Diagram

### Campaign Creation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User Input (Frontend)                                        │
│    - Text or voice input                                        │
│    - Language selection                                         │
│    - Business type                                              │
│    - Region selection                                           │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. API Request (POST /api/campaign/create)                      │
│    - Authenticate with JWT                                      │
│    - Validate input                                             │
│    - Create campaign record                                     │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Pipeline Execution (Async)                                   │
│                                                                 │
│    Stage 1: Research Agent (Nova Pro)                           │
│    ├─ Analyze trends                                            │
│    ├─ Get demographics                                          │
│    └─ Find hashtags                                             │
│                                                                 │
│    Stage 2: Creative Swarm (Nova Omni + Reel)                   │
│    ├─ Generate captions                                         │
│    ├─ Create video script                                       │
│    └─ Generate SEO data                                         │
│                                                                 │
│    Stage 3: Quality Guard (Guardrails)                          │
│    ├─ Check cultural sensitivity                                │
│    ├─ Verify brand safety                                       │
│    └─ Calculate BharatScore                                     │
│                                                                 │
│    Stage 4: Distribution Agent (Nova Sonic)                     │
│    ├─ Calculate posting times                                   │
│    ├─ Match influencers                                         │
│    └─ Estimate reach                                            │
│                                                                 │
│    Stage 5: Published!                                          │
│    └─ Campaign ready for publishing                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. WebSocket Updates (Real-time)                                │
│    - Stage progress                                             │
│    - Status updates                                             │
│    - Final results                                              │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Campaign Ready                                               │
│    - Display results                                            │
│    - Show BharatScore                                           │
│    - Enable publishing                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema (Current & Production)

### Current (In-Memory)
```typescript
campaigns: Map<campaignId, Campaign>
users: Map<userId, User>
templates: Map<templateId, CampaignTemplate>
analytics: Map<userId, Analytics>
```

### Production (DynamoDB)

#### Campaigns Table
```
PK: userId#campaignId
SK: createdAt
Attributes:
  - input: string
  - inputType: 'voice' | 'text'
  - language: string
  - businessType: string
  - region: string[]
  - status: 'pending' | 'processing' | 'done' | 'error'
  - content: object
  - bharatScore: object
  - publishedPlatforms: string[]
  - scheduledFor: string (optional)
  - tags: string[] (optional)
  - templateId: string (optional)

GSI:
  - status-createdAt
  - language-createdAt
  - businessType-createdAt
```

#### Users Table
```
PK: userId
Attributes:
  - email: string (unique)
  - password: string (hashed)
  - name: string
  - language: string
  - businessType: string
  - region: string[]
  - tier: 'free' | 'pro' | 'enterprise'
  - createdAt: string
  - updatedAt: string

GSI:
  - email-index
```

#### Templates Table
```
PK: userId#templateId
SK: createdAt
Attributes:
  - name: string
  - description: string
  - businessType: string
  - language: string
  - content: object
  - isPublic: boolean
  - usageCount: number

GSI:
  - isPublic-createdAt
  - businessType-language
```

#### Analytics Table
```
PK: userId
SK: date
Attributes:
  - campaignsCreated: number
  - languagesUsed: string[]
  - platformsPublished: string[]
  - estimatedReach: number
  - totalEngagement: number
  - lastUpdated: string
```

---

## API Request/Response Flow

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ Client                                                          │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ POST /api/auth/signup
                     │ { email, password, name, ... }
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Server                                                          │
│ 1. Validate input                                               │
│ 2. Check email not exists                                       │
│ 3. Hash password                                                │
│ 4. Create user record                                           │
│ 5. Generate JWT token                                           │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Response: { user, token }
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Client                                                          │
│ 1. Store token in localStorage                                  │
│ 2. Set Authorization header                                     │
│ 3. Redirect to dashboard                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Protected Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ Client                                                          │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ GET /api/campaigns
                     │ Authorization: Bearer <token>
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Server                                                          │
│ 1. Extract token from header                                    │
│ 2. Verify JWT signature                                         │
│ 3. Check token expiry                                           │
│ 4. Extract userId from token                                    │
│ 5. Get user campaigns                                           │
│ 6. Return campaigns                                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Response: Campaign[]
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Client                                                          │
│ 1. Display campaigns                                            │
│ 2. Handle errors if any                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture (Production)

```
┌─────────────────────────────────────────────────────────────────┐
│ CloudFront CDN                                                  │
│ - Caches frontend assets                                        │
│ - Distributes globally                                          │
│ - SSL/TLS termination                                           │
└────────────────────┬────────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
    ┌────────┐  ┌────────┐  ┌────────┐
    │ S3     │  │ API    │  │ Media  │
    │Frontend│  │Gateway │  │ S3     │
    └────────┘  └────┬───┘  └────────┘
                     │
                     ▼
            ┌────────────────┐
            │ Lambda         │
            │ (Backend API)  │
            └────────┬───────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
    ┌────────┐  ┌────────┐  ┌────────┐
    │DynamoDB│  │Bedrock │  │Secrets │
    │Tables  │  │Models  │  │Manager │
    └────────┘  └────────┘  └────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ Client (Browser)                                                │
│ - HTTPS only                                                    │
│ - JWT stored in localStorage                                    │
│ - CORS validation                                               │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ API Gateway                                                     │
│ - SSL/TLS termination                                           │
│ - Rate limiting                                                 │
│ - WAF rules                                                     │
│ - Request validation                                            │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Lambda Function                                                 │
│ - JWT verification                                              │
│ - User isolation                                                │
│ - Input validation                                              │
│ - Error handling                                                │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ DynamoDB                                                        │
│ - Encryption at rest                                            │
│ - IAM role-based access                                         │
│ - VPC endpoint                                                  │
│ - Backup & recovery                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Scaling Strategy

### Horizontal Scaling
```
Load Balancer
    │
    ├─ Lambda Instance 1
    ├─ Lambda Instance 2
    ├─ Lambda Instance 3
    └─ Lambda Instance N
    
    All connected to:
    - DynamoDB (auto-scaling)
    - S3 (unlimited)
    - Bedrock (managed service)
```

### Vertical Scaling
```
Lambda Memory: 128MB → 3008MB
Lambda Timeout: 15s → 900s
DynamoDB: On-demand or provisioned
Bedrock: Managed by AWS
```

---

## Monitoring & Logging

```
┌─────────────────────────────────────────────────────────────────┐
│ CloudWatch                                                      │
│ - API response times                                            │
│ - Error rates                                                   │
│ - Lambda duration                                               │
│ - DynamoDB metrics                                              │
│ - Bedrock API calls                                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Alarms & Notifications                                          │
│ - High error rate                                               │
│ - Slow response time                                            │
│ - DynamoDB throttling                                           │
│ - Lambda failures                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- React 18.2.0
- TypeScript 5.2.2
- Vite 5.1.4
- Tailwind CSS 3.4.1
- Framer Motion 11.0.6
- Three.js 0.162.0
- Axios 1.6.7

### Backend
- Node.js 18+
- Express.js 4.18.3
- TypeScript 5.3.3
- WebSocket (ws 8.16.0)
- JWT (jsonwebtoken 9.1.2)
- AWS SDK (@aws-sdk/client-bedrock-runtime)

### AWS Services
- Bedrock (Nova Pro/Omni/Reel/Sonic + Titan)
- Lambda
- DynamoDB
- S3
- CloudFront
- API Gateway
- Cognito
- CloudWatch
- Secrets Manager

---

**Made with ❤️ for Digital Bharat 🇮🇳**
