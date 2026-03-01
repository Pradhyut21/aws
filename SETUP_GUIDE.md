# BharatMedia v2.0 - Setup Guide

## Prerequisites
- Node.js 18+
- npm 9+
- AWS Account with Bedrock access
- Git

## Step 1: Clone & Install

```bash
# Clone repository
git clone https://github.com/bharatmedia/bharatmedia.git
cd bharatmedia

# Install all dependencies
npm run install:all
```

## Step 2: AWS Bedrock Setup

### Enable Bedrock Models
1. Go to AWS Console → Bedrock
2. Click "Model access" in left sidebar
3. Enable these models:
   - Amazon Nova Pro
   - Amazon Nova Omni
   - Amazon Nova Reel
   - Amazon Nova Sonic
   - Amazon Titan Image Generator
   - Bedrock Guardrails

### Get AWS Credentials
```bash
# Option 1: AWS CLI
aws configure

# Option 2: Manual setup
export AWS_ACCESS_KEY_ID=your-key
export AWS_SECRET_ACCESS_KEY=your-secret
export AWS_REGION=us-east-1
```

## Step 3: Environment Configuration

### Backend Setup
```bash
cd backend

# Copy example env
cp .env.example .env

# Edit .env with your values
nano .env
```

**Required fields:**
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
JWT_SECRET=your-super-secret-key-change-this
PORT=4000
```

### Frontend Setup
```bash
cd frontend

# Create .env.local
cat > .env.local << EOF
VITE_API_URL=http://localhost:4000/api
VITE_WS_URL=ws://localhost:4000/ws
EOF
```

## Step 4: Start Development Servers

```bash
# From root directory
npm run dev

# This starts:
# - Frontend: http://localhost:5173
# - Backend: http://localhost:4000
```

## Step 5: Test the Setup

### Test Backend
```bash
# Health check
curl http://localhost:4000/health

# Should return:
# {"status":"ok","service":"BharatMedia API v2.0","version":"2.0.0"}
```

### Test Frontend
Open http://localhost:5173 in browser

### Test Bedrock Integration
```bash
# Create a test campaign
curl -X POST http://localhost:4000/api/campaign/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "input": "Diwali sale campaign",
    "inputType": "text",
    "language": "hi",
    "businessType": "retail",
    "region": ["UP", "MP"]
  }'
```

## Step 6: Authentication Setup

### Create Test User
```bash
# Signup
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123",
    "name": "Test User",
    "language": "hi",
    "businessType": "retail",
    "region": ["UP"]
  }'

# Response includes token - save it
# {"user": {...}, "token": "eyJhbGc..."}
```

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

## Step 7: Database Migration (Optional)

### For Production: Setup DynamoDB

```bash
# Create tables
aws dynamodb create-table \
  --table-name bharatmedia-campaigns \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
    AttributeName=campaignId,AttributeType=S \
  --key-schema \
    AttributeName=userId,KeyType=HASH \
    AttributeName=campaignId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST

# Similar for other tables...
```

### For Production: Setup S3

```bash
# Create bucket
aws s3 mb s3://bharatmedia-media

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket bharatmedia-media \
  --versioning-configuration Status=Enabled

# Setup CORS
aws s3api put-bucket-cors \
  --bucket bharatmedia-media \
  --cors-configuration file://cors.json
```

## Step 8: Integrations Setup (Optional)

### Shopify Integration
1. Create Shopify app at https://shopify.dev
2. Get API credentials
3. Add to .env:
```
SHOPIFY_API_KEY=your-key
SHOPIFY_API_SECRET=your-secret
```

### Stripe Setup (Payments)
1. Create Stripe account at https://stripe.com
2. Get API keys
3. Add to .env:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Razorpay Setup (Indian Payments)
1. Create Razorpay account at https://razorpay.com
2. Get API keys
3. Add to .env:
```
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret
```

## Step 9: Deployment

### Deploy to AWS

#### Frontend (S3 + CloudFront)
```bash
# Build
npm run build --prefix frontend

# Deploy to S3
aws s3 sync frontend/dist s3://bharatmedia-frontend

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id E123ABC \
  --paths "/*"
```

#### Backend (Lambda + API Gateway)
```bash
# Build
npm run build --prefix backend

# Create deployment package
zip -r backend.zip backend/dist node_modules

# Deploy to Lambda
aws lambda update-function-code \
  --function-name bharatmedia-api \
  --zip-file fileb://backend.zip
```

### Deploy to Vercel (Easier)

#### Frontend
```bash
npm install -g vercel
cd frontend
vercel
```

#### Backend
```bash
cd backend
vercel
```

## Troubleshooting

### Issue: "Bedrock model not found"
**Solution:** Make sure model is enabled in AWS Bedrock console

### Issue: "JWT token invalid"
**Solution:** Check JWT_SECRET matches between signup and login

### Issue: "CORS error"
**Solution:** Update CORS origin in backend/src/index.ts

### Issue: "WebSocket connection failed"
**Solution:** Check WebSocket URL matches backend port (4000)

### Issue: "Database connection error"
**Solution:** For production, ensure DynamoDB tables exist and IAM permissions are set

## Next Steps

1. ✅ Test all endpoints with Postman
2. ✅ Create sample campaigns
3. ✅ Test Bedrock integration
4. ✅ Setup authentication flow
5. ✅ Configure integrations
6. ✅ Deploy to production

## Support

- Documentation: https://docs.bharatmedia.com
- GitHub: https://github.com/bharatmedia
- Discord: https://discord.gg/bharatmedia
- Email: support@bharatmedia.com

---

**Happy building! 🚀**
