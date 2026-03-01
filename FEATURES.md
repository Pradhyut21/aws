# BharatMedia v2.0 - Complete Feature Set

## 🎯 Phase 1: AWS Bedrock Integration ✅

### Bedrock Models Connected
- **Nova Pro** - Research, analysis, SEO optimization
- **Nova Omni** - Multilingual content generation (22 languages)
- **Nova Reel** - 15-second video script generation
- **Nova Sonic** - Voice transcription & translation
- **Titan Image Generator** - AI image generation
- **Bedrock Guardrails** - Content safety & cultural sensitivity

### Implementation
```typescript
// backend/src/services/bedrock.ts
- invokeNovaPro(prompt, maxTokens)
- invokeNovaOmni(prompt, maxTokens)
- invokeNovaReel(prompt, maxTokens)
- invokeNovaSonic(prompt, maxTokens)
- generateTitanImage(prompt, width, height)
- checkContentSafety(content, language)
```

### Environment Setup
```bash
# Set AWS credentials
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=your-key
export AWS_SECRET_ACCESS_KEY=your-secret

# Copy .env.example to .env and fill in values
cp backend/.env.example backend/.env
```

---

## 👤 Phase 2: Authentication & User Management ✅

### Auth Endpoints
```
POST   /api/auth/signup          - Register new user
POST   /api/auth/login           - Login with email/password
GET    /api/auth/me              - Get current user (protected)
PUT    /api/auth/profile         - Update user profile (protected)
```

### User Model
```typescript
interface User {
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
```

### Usage
```typescript
// Frontend
import { signup, login, getCurrentUser } from '@/lib/api';

// Signup
const { user, token } = await signup({
    email: 'user@example.com',
    password: 'secure-password',
    name: 'Raju Kumar',
    language: 'hi',
    businessType: 'retail',
    region: ['UP', 'MP']
});

// Login
const { user, token } = await login('user@example.com', 'password');

// Get current user
const user = await getCurrentUser();
```

### JWT Token
- Stored in localStorage as `authToken`
- Automatically added to all API requests
- Expires in 7 days
- Change `JWT_SECRET` in production

---

## 📊 Phase 3: Database Migration (Ready for DynamoDB)

### Current: In-Memory Store
- `campaigns` Map<string, Campaign>
- `users` Map<string, User>
- `templates` Map<string, CampaignTemplate>
- `analytics` Map<string, Analytics>

### Production: DynamoDB Tables
```
bharatmedia-campaigns
  - PK: userId#campaignId
  - SK: createdAt
  - GSI: status, language, businessType

bharatmedia-users
  - PK: userId
  - GSI: email

bharatmedia-templates
  - PK: userId#templateId
  - GSI: isPublic, businessType

bharatmedia-analytics
  - PK: userId
  - SK: date
```

### Migration Path
1. Install AWS SDK: `npm install @aws-sdk/client-dynamodb`
2. Create `backend/src/services/dynamodb.ts`
3. Replace Map operations with DynamoDB calls
4. Add S3 for media storage
5. Add CloudFront CDN

---

## 🎨 Phase 4: Advanced Features

### 4.1 Campaign Templates Library
```typescript
// Create template from campaign
POST /api/templates
{
    name: "Diwali Sale Campaign",
    description: "Ready-to-use Diwali promotion template",
    businessType: "retail",
    language: "hi",
    content: { /* full campaign content */ },
    isPublic: true
}

// Get user templates
GET /api/templates

// Get public templates
GET /api/templates/public

// Use template to create campaign
POST /api/campaign/create
{
    templateId: "template-123",
    input: "My custom message",
    ...
}
```

### 4.2 Campaign Scheduling
```typescript
// Schedule campaign for future posting
POST /api/campaign/create
{
    input: "Diwali offer",
    scheduledFor: "2026-11-01T18:00:00Z",
    ...
}

// Scheduled campaigns auto-publish at specified time
// Requires: AWS Lambda + EventBridge
```

### 4.3 A/B Testing
```typescript
// Create campaign variant
POST /api/campaign/:id/variant
{
    caption: "Alternative caption",
    image: "alternative-image-url"
}

// Track performance per variant
GET /api/campaign/:id/variants/performance
```

### 4.4 Content Library
```typescript
// Save successful content for reuse
POST /api/content/save
{
    campaignId: "campaign-123",
    tags: ["diwali", "retail", "hindi"]
}

// Search content library
GET /api/content/search?tag=diwali&language=hi
```

### 4.5 Marketplace for Creators
```typescript
// List available gigs
GET /api/marketplace/gigs

// Hire creator
POST /api/marketplace/hire
{
    gigId: "gig-123",
    budget: 5000,
    deadline: "2026-03-15"
}

// Creator dashboard
GET /api/marketplace/my-gigs
```

---

## 🔗 Phase 5: Integrations

### 5.1 Shopify Integration
```typescript
// Connect Shopify store
POST /api/integrations/shopify/connect
{
    shopName: "mystore.myshopify.com",
    accessToken: "shpat_..."
}

// Auto-link products to campaigns
POST /api/campaign/:id/link-products
{
    productIds: ["prod-123", "prod-456"]
}

// Track sales from campaigns
GET /api/campaign/:id/sales
```

### 5.2 CRM Integration (Salesforce, HubSpot)
```typescript
// Connect CRM
POST /api/integrations/crm/connect
{
    provider: "salesforce",
    clientId: "...",
    clientSecret: "..."
}

// Sync leads from campaigns
POST /api/campaign/:id/sync-leads
```

### 5.3 Email Marketing (Mailchimp, SendGrid)
```typescript
// Connect email service
POST /api/integrations/email/connect
{
    provider: "mailchimp",
    apiKey: "..."
}

// Add campaign subscribers to list
POST /api/campaign/:id/add-to-email-list
{
    listId: "list-123"
}
```

### 5.4 Payment Gateway (Razorpay)
```typescript
// Create subscription
POST /api/payments/subscribe
{
    tier: "pro",
    planId: "plan-pro-monthly"
}

// Webhook for payment updates
POST /api/webhooks/razorpay
```

### 5.5 Inventory Management
```typescript
// Sync inventory
POST /api/integrations/inventory/sync
{
    provider: "shopify",
    syncInterval: 3600
}

// Get inventory status
GET /api/inventory/status
```

---

## 📱 Phase 6: Mobile App (React Native)

### Features
- Voice recording on mobile
- Offline draft creation
- Push notifications for campaign milestones
- Real-time analytics dashboard
- One-tap publishing

### Setup
```bash
npx create-expo-app bharatmedia-mobile
cd bharatmedia-mobile
npm install react-native-voice react-native-push-notification
```

---

## 🏪 Phase 7: Community & Social

### 7.1 Marketplace
- Freelance content creators
- Influencer matching
- Bulk campaign creation
- Revenue sharing model

### 7.2 Community Forum
- Tips & best practices
- Language-specific channels
- Success stories
- Q&A section

### 7.3 Referral Program
```typescript
// Generate referral link
GET /api/referral/link

// Track referrals
GET /api/referral/stats

// Claim rewards
POST /api/referral/claim
```

### 7.4 Leaderboard
```typescript
// Top campaigns by region
GET /api/leaderboard/campaigns?region=UP

// Top creators
GET /api/leaderboard/creators

// Top languages
GET /api/leaderboard/languages
```

---

## 🔒 Phase 8: Compliance & Trust

### 8.1 Data Privacy
```typescript
// GDPR compliance
GET /api/privacy/export-data
DELETE /api/privacy/delete-account

// Privacy policy
GET /api/legal/privacy-policy
GET /api/legal/terms-of-service
```

### 8.2 Content Moderation
```typescript
// Moderation logs
GET /api/moderation/logs

// Appeal decision
POST /api/moderation/appeal
{
    contentId: "content-123",
    reason: "This is culturally appropriate"
}
```

### 8.3 Audit Trail
```typescript
// All changes logged
GET /api/audit/logs?userId=user-123

// Export audit report
GET /api/audit/report?startDate=2026-01-01&endDate=2026-02-28
```

---

## 🚀 Deployment

### Local Development
```bash
# Install dependencies
npm run install:all

# Start dev servers
npm run dev

# Frontend: http://localhost:5173
# Backend: http://localhost:4000
```

### Production (AWS)
```bash
# Build
npm run build

# Deploy frontend to S3 + CloudFront
aws s3 sync frontend/dist s3://bharatmedia-frontend

# Deploy backend to Lambda
npm run build --prefix backend
zip -r backend.zip backend/dist
aws lambda update-function-code --function-name bharatmedia-api --zip-file fileb://backend.zip

# Set environment variables
aws lambda update-function-configuration \
  --function-name bharatmedia-api \
  --environment Variables={AWS_REGION=us-east-1,JWT_SECRET=...}
```

---

## 📚 API Documentation

### Base URL
- Development: `http://localhost:4000/api`
- Production: `https://api.bharatmedia.com/api`

### Authentication
All protected endpoints require:
```
Authorization: Bearer <jwt-token>
```

### Response Format
```json
{
    "data": { /* response data */ },
    "error": null,
    "timestamp": "2026-02-28T10:30:00Z"
}
```

### Error Handling
```json
{
    "error": "Campaign not found",
    "code": "CAMPAIGN_NOT_FOUND",
    "status": 404
}
```

---

## 🧪 Testing

### Unit Tests
```bash
npm run test --prefix backend
npm run test --prefix frontend
```

### Integration Tests
```bash
npm run test:integration --prefix backend
```

### E2E Tests
```bash
npm run test:e2e
```

---

## 📞 Support

- Email: support@bharatmedia.com
- Discord: https://discord.gg/bharatmedia
- GitHub Issues: https://github.com/bharatmedia/issues

---

## 📄 License

MIT License - See LICENSE file for details

---

**Made with ❤️ for Digital Bharat 🇮🇳**
