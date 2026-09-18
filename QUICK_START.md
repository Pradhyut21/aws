# BharatMedia v2.0 - Quick Start (5 Minutes)

## What's New? 🎉

✅ **AWS Bedrock Integration** - All 5 Nova models + Titan Image Generator  
✅ **User Authentication** - JWT-based login/signup  
✅ **Campaign Management** - Full CRUD with scheduling  
✅ **Template Library** - Reusable campaign templates  
✅ **Analytics** - Track performance metrics  
✅ **15+ New API Endpoints** - Production-ready  

---

## Installation (2 minutes)

```bash
# 1. Install dependencies
npm run install:all

# 2. Setup AWS credentials
export AWS_ACCESS_KEY_ID=your-key
export AWS_SECRET_ACCESS_KEY=your-secret
export AWS_REGION=us-east-1

# 3. Configure backend
cd backend
cp .env.example .env
# Edit .env and add your JWT_SECRET

# 4. Start servers
cd ..
npm run dev
```

**Result:**
- Frontend: http://localhost:5173
- Backend: http://localhost:4000

---

## Test It (2 minutes)

### 1. Signup
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123",
    "name": "Test User",
    "language": "hi",
    "businessType": "retail"
  }'
```

**Response:**
```json
{
  "user": {
    "id": "user-123",
    "email": "test@example.com",
    "name": "Test User",
    "tier": "free"
  },
  "token": "eyJhbGc..."
}
```

### 2. Create Campaign
```bash
TOKEN="eyJhbGc..."  # From signup response

curl -X POST http://localhost:4000/api/campaign/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Diwali sale campaign",
    "inputType": "text",
    "language": "hi",
    "businessType": "retail",
    "region": ["UP", "MP"]
  }'
```

**Response:**
```json
{
  "campaignId": "campaign-123",
  "wsChannel": "/ws?campaignId=campaign-123"
}
```

### 3. Get Campaign
```bash
curl -X GET http://localhost:4000/api/campaign/campaign-123 \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Publish Campaign
```bash
curl -X POST http://localhost:4000/api/campaign/campaign-123/publish \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "platforms": ["instagram", "whatsapp", "facebook"]
  }'
```

---

## Key Features

### Authentication
```typescript
// Signup
POST /api/auth/signup
{ email, password, name, language, businessType, region }

// Login
POST /api/auth/login
{ email, password }

// Get current user
GET /api/auth/me
```

### Campaigns
```typescript
// Create
POST /api/campaign/create
{ input, inputType, language, businessType, region, scheduledFor?, templateId? }

// Get all
GET /api/campaigns

// Get one
GET /api/campaign/:id

// Publish
POST /api/campaign/:id/publish
{ platforms: string[] }

// Delete
DELETE /api/campaign/:id
```

### Templates
```typescript
// Create
POST /api/templates
{ name, description, businessType, language, content, isPublic }

// Get user templates
GET /api/templates

// Get public templates
GET /api/templates/public
```

### Analytics
```typescript
// Get analytics
GET /api/analytics
```

---

## AWS Bedrock Models

All models are now integrated and ready to use:

| Model | Purpose | Status |
|-------|---------|--------|
| Nova Pro | Research & analysis | ✅ Ready |
| Nova Omni | Multilingual content | ✅ Ready |
| Nova Reel | Video scripts | ✅ Ready |
| Nova Sonic | Voice transcription | ✅ Ready |
| Titan Image | Image generation | ✅ Ready |
| Guardrails | Content safety | ✅ Ready |

---

## File Structure

```
backend/
├── src/
│   ├── index.ts                 # Main server + routes
│   ├── services/
│   │   ├── bedrock.ts          # Bedrock integration ✨ NEW
│   │   ├── auth.ts             # Authentication ✨ NEW
│   │   └── store.ts            # Database layer (enhanced)
│   └── middleware/
│       └── auth.ts             # Auth middleware ✨ NEW
├── .env.example                # Environment template ✨ NEW
└── package.json                # Updated dependencies

frontend/
├── src/
│   └── lib/
│       ├── api.ts              # API client (enhanced)
│       └── types.ts            # Types (extended)
└── package.json

Documentation/
├── FEATURES.md                 # Complete features ✨ NEW
├── SETUP_GUIDE.md             # Setup instructions ✨ NEW
├── QUICK_START.md             # This file ✨ NEW
├── IMPLEMENTATION_SUMMARY.md  # What's added ✨ NEW
└── postman_collection.json    # API testing ✨ NEW
```

---

## Environment Variables

**Required:**
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
JWT_SECRET=your-super-secret-key
PORT=4000
```

**Optional:**
```
STRIPE_SECRET_KEY=sk_test_...
RAZORPAY_KEY_ID=...
SHOPIFY_API_KEY=...
```

See `backend/.env.example` for all options.

---

## Common Issues

### "Bedrock model not found"
→ Enable models in AWS Bedrock console

### "JWT token invalid"
→ Check JWT_SECRET in .env matches

### "CORS error"
→ Frontend URL must match CORS config

### "WebSocket connection failed"
→ Check backend is running on port 4000

### "Module not found"
→ Run `npm run install:all`

---

## Next Steps

1. ✅ Test all endpoints with Postman (import `postman_collection.json`)
2. ✅ Create sample campaigns
3. ✅ Test Bedrock integration
4. ✅ Build frontend UI for auth
5. ✅ Deploy to production

---

## Documentation

- **Full Features**: See `FEATURES.md`
- **Setup Guide**: See `SETUP_GUIDE.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`
- **API Testing**: Import `postman_collection.json` to Postman

---

## Support

- 📧 Email: support@bharatmedia.com
- 💬 Discord: https://discord.gg/bharatmedia
- 🐛 Issues: https://github.com/bharatmedia/issues
- 📚 Docs: https://docs.bharatmedia.com

---

## What's Coming Next?

- 🔄 DynamoDB migration
- 🔄 S3 media storage
- 🔄 Campaign scheduling
- 🔄 A/B testing
- 🔄 Marketplace
- 🔄 Mobile app
- 🔄 Integrations (Shopify, CRM, etc.)

---

**Ready to build? Let's go! 🚀**

```bash
npm run dev
```

---

**Made with ❤️ for Digital Bharat 🇮🇳**
