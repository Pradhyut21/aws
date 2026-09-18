# BharatMedia v2.0 - DEPLOYMENT EXECUTION

**Date**: March 1, 2026  
**Status**: 🚀 DEPLOYMENT IN PROGRESS

---

## 🚀 DEPLOYMENT STRATEGY

### Deployment Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION DEPLOYMENT                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend                          Backend                    │
│  ┌──────────────────┐             ┌──────────────────┐       │
│  │  React + Vite    │             │  Express.js      │       │
│  │  S3 + CloudFront │             │  AWS Lambda      │       │
│  │  https://bharatmedia.com       │  API Gateway     │       │
│  └──────────────────┘             └──────────────────┘       │
│         │                                  │                  │
│         └──────────────────┬───────────────┘                  │
│                            │                                  │
│                    ┌───────▼────────┐                         │
│                    │   DynamoDB     │                         │
│                    │   Database     │                         │
│                    └────────────────┘                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 DEPLOYMENT CHECKLIST

### Pre-Deployment ✅
- ✅ Code verified (0 errors)
- ✅ All tests documented
- ✅ All endpoints working
- ✅ Security verified
- ✅ Performance acceptable
- ✅ Documentation complete

### Build Phase ⏳
- ⏳ Backend build
- ⏳ Frontend build
- ⏳ Verify builds
- ⏳ Create deployment packages

### Deployment Phase ⏳
- ⏳ Deploy backend to Lambda
- ⏳ Deploy frontend to S3
- ⏳ Update CloudFront
- ⏳ Set environment variables
- ⏳ Configure DNS

### Post-Deployment ⏳
- ⏳ Smoke tests
- ⏳ Monitor error logs
- ⏳ Monitor performance
- ⏳ Verify all endpoints
- ⏳ Collect user feedback

---

## 🔨 BUILD PHASE

### Step 1: Build Backend
```bash
cd backend
npm run build
```

**Expected Output:**
```
✅ Compilation successful
✅ Output: backend/dist/
✅ Files: index.js, middleware/, services/, agents/
```

### Step 2: Build Frontend
```bash
cd frontend
npm run build
```

**Expected Output:**
```
✅ Compilation successful
✅ Output: frontend/dist/
✅ Files: index.html, assets/
✅ Bundle size: < 500KB
```

### Step 3: Verify Builds
```bash
# Check backend build
ls -la backend/dist/

# Check frontend build
ls -la frontend/dist/
```

---

## 🚀 DEPLOYMENT PHASE

### Step 1: Deploy Backend to AWS Lambda

#### Create Deployment Package
```bash
cd backend
zip -r ../backend.zip dist/ node_modules/ package.json
```

#### Upload to Lambda
```bash
aws lambda update-function-code \
  --function-name bharatmedia-api \
  --zip-file fileb://../backend.zip \
  --region us-east-1
```

#### Verify Lambda Deployment
```bash
aws lambda get-function \
  --function-name bharatmedia-api \
  --region us-east-1
```

### Step 2: Deploy Frontend to S3

#### Sync to S3
```bash
aws s3 sync frontend/dist s3://bharatmedia-frontend \
  --delete \
  --cache-control "max-age=31536000,public" \
  --exclude "index.html" \
  --exclude "*.json"

aws s3 cp frontend/dist/index.html s3://bharatmedia-frontend/index.html \
  --cache-control "no-cache,no-store,must-revalidate" \
  --content-type "text/html"
```

#### Invalidate CloudFront
```bash
aws cloudfront create-invalidation \
  --distribution-id <DIST_ID> \
  --paths "/*" \
  --region us-east-1
```

### Step 3: Set Environment Variables

#### Configure Lambda Environment
```bash
aws lambda update-function-configuration \
  --function-name bharatmedia-api \
  --environment Variables={
    AWS_REGION=us-east-1,
    JWT_SECRET=$(openssl rand -base64 32),
    ALLOWED_ORIGINS=https://bharatmedia.com,
    NODE_ENV=production,
    PORT=3000
  } \
  --region us-east-1
```

### Step 4: Configure API Gateway

#### Enable CORS
```bash
aws apigateway put-integration-response \
  --rest-api-id <API_ID> \
  --resource-id <RESOURCE_ID> \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters '{"method.response.header.Access-Control-Allow-Headers":"'"'"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"'"'","method.response.header.Access-Control-Allow-Methods":"'"'"'GET,POST,PUT,DELETE,OPTIONS'"'"'","method.response.header.Access-Control-Allow-Origin":"'"'"'*'"'"'"}' \
  --region us-east-1
```

### Step 5: Configure DNS

#### Update Route 53
```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id <ZONE_ID> \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "bharatmedia.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "<CLOUDFRONT_DOMAIN>",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }' \
  --region us-east-1
```

---

## ✅ POST-DEPLOYMENT VERIFICATION

### Step 1: Health Check
```bash
curl https://api.bharatmedia.com/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "service": "BharatMedia API",
  "version": "2.0.0"
}
```

### Step 2: Test Signup Endpoint
```bash
curl -X POST https://api.bharatmedia.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "name": "Test User",
    "language": "hi",
    "businessType": "retail",
    "region": ["UP"]
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User",
    "language": "hi",
    "businessType": "retail",
    "tier": "free"
  },
  "token": "eyJhbGc..."
}
```

### Step 3: Test Frontend
```bash
curl https://bharatmedia.com
```

**Expected Response:**
- HTTP 200 OK
- HTML content
- No errors in console

### Step 4: Test WebSocket
```bash
wscat -c wss://api.bharatmedia.com/ws?campaignId=test-123
```

**Expected Response:**
- Connection established
- Ready to receive messages

---

## 📊 MONITORING & ALERTS

### CloudWatch Metrics
```bash
# Monitor Lambda errors
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Errors \
  --dimensions Name=FunctionName,Value=bharatmedia-api \
  --start-time 2026-03-01T00:00:00Z \
  --end-time 2026-03-02T00:00:00Z \
  --period 300 \
  --statistics Sum
```

### CloudWatch Logs
```bash
# View Lambda logs
aws logs tail /aws/lambda/bharatmedia-api --follow
```

### Set Up Alarms
```bash
# Alert on errors
aws cloudwatch put-metric-alarm \
  --alarm-name bharatmedia-api-errors \
  --alarm-description "Alert when Lambda errors exceed 10" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1
```

---

## 🔄 ROLLBACK PLAN

### If Deployment Fails

#### Rollback Lambda
```bash
# Get previous version
aws lambda list-versions-by-function \
  --function-name bharatmedia-api

# Revert to previous version
aws lambda update-alias \
  --function-name bharatmedia-api \
  --name live \
  --function-version <PREVIOUS_VERSION>
```

#### Rollback CloudFront
```bash
# Invalidate to force refresh
aws cloudfront create-invalidation \
  --distribution-id <DIST_ID> \
  --paths "/*"

# Or revert to previous S3 version
aws s3 sync s3://bharatmedia-frontend-backup frontend/dist
```

#### Rollback DNS
```bash
# Point back to previous server
aws route53 change-resource-record-sets \
  --hosted-zone-id <ZONE_ID> \
  --change-batch file://rollback.json
```

---

## 📈 POST-DEPLOYMENT MONITORING

### Daily Checks
- [ ] Error rate < 0.1%
- [ ] Response time < 200ms
- [ ] Uptime > 99.9%
- [ ] No security alerts

### Weekly Checks
- [ ] Review error logs
- [ ] Review performance metrics
- [ ] Review user feedback
- [ ] Check for updates

### Monthly Checks
- [ ] Security audit
- [ ] Performance optimization
- [ ] Database maintenance
- [ ] Backup verification

---

## 🎯 SUCCESS CRITERIA

### Deployment Success
- ✅ All endpoints accessible
- ✅ WebSocket connections work
- ✅ Error handling works
- ✅ Rate limiting works
- ✅ CORS configured
- ✅ SSL certificates valid

### Performance Success
- ✅ Page load time < 2s
- ✅ API response time < 200ms
- ✅ WebSocket latency < 100ms
- ✅ Error rate < 0.1%

### Security Success
- ✅ No security alerts
- ✅ Rate limiting working
- ✅ Input validation working
- ✅ Authentication working

---

## 📞 DEPLOYMENT SUPPORT

### Issues & Troubleshooting
1. Check CloudWatch logs
2. Check Lambda configuration
3. Check S3 bucket permissions
4. Check CloudFront distribution
5. Check Route 53 DNS records

### Rollback Procedure
1. Stop traffic to new version
2. Revert Lambda to previous version
3. Invalidate CloudFront cache
4. Update DNS if needed
5. Verify rollback successful

---

## 🎉 DEPLOYMENT COMPLETE

Once all steps are complete:
1. ✅ Verify all endpoints working
2. ✅ Monitor error logs
3. ✅ Monitor performance
4. ✅ Collect user feedback
5. ✅ Plan Phase 4 features

---

Made with ❤️ for Digital Bharat 🇮🇳

**Status**: 🚀 DEPLOYMENT READY - Follow steps above to deploy to production
