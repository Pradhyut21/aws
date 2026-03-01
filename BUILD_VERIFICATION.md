# Build Verification & Deployment Preparation

**Date**: March 1, 2026  
**Status**: Ready for Build

---

## 🔨 Build Commands

### Backend Build
```bash
cd backend
npm run build
```

Expected Output:
```
✅ Compilation successful
✅ Output: backend/dist/
✅ Files: index.js, middleware/, services/, agents/
```

### Frontend Build
```bash
cd frontend
npm run build
```

Expected Output:
```
✅ Compilation successful
✅ Output: frontend/dist/
✅ Files: index.html, assets/
✅ Bundle size: < 500KB
```

---

## 📦 Build Artifacts

### Backend Build Output
```
backend/dist/
├── index.js
├── middleware/
│   └── auth.js
├── services/
│   ├── auth.js
│   ├── bedrock.js
│   └── store.js
└── agents/
    ├── pipeline.js
    ├── researchAgent.js
    ├── creativeSwarm.js
    ├── qualityGuard.js
    └── distributionAgent.js
```

### Frontend Build Output
```
frontend/dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── vendor-[hash].js
└── manifest.json
```

---

## ✅ Pre-Deployment Checklist

### Code Quality
- [ ] TypeScript compilation: 0 errors
- [ ] No console warnings
- [ ] No deprecated APIs
- [ ] All imports resolved

### Security
- [ ] No hardcoded secrets
- [ ] Environment variables configured
- [ ] CORS whitelist set
- [ ] Rate limiting enabled
- [ ] Input validation enabled

### Performance
- [ ] Bundle size < 500KB
- [ ] Code splitting enabled
- [ ] Lazy loading configured
- [ ] Caching headers set

### Testing
- [ ] All endpoints tested
- [ ] Error handling verified
- [ ] Security verified
- [ ] Performance acceptable

### Documentation
- [ ] API documentation complete
- [ ] Deployment guide ready
- [ ] Runbook prepared
- [ ] Troubleshooting guide ready

---

## 🚀 Deployment Steps

### Step 1: Build Backend
```bash
cd backend
npm run build
```

### Step 2: Build Frontend
```bash
cd frontend
npm run build
```

### Step 3: Verify Builds
```bash
# Check backend build
ls -la backend/dist/

# Check frontend build
ls -la frontend/dist/
```

### Step 4: Deploy Backend to AWS Lambda
```bash
# Create deployment package
cd backend
zip -r ../backend.zip dist/ node_modules/ package.json

# Upload to Lambda
aws lambda update-function-code \
  --function-name bharatmedia-api \
  --zip-file fileb://../backend.zip
```

### Step 5: Deploy Frontend to S3
```bash
# Sync to S3
aws s3 sync frontend/dist s3://bharatmedia-frontend

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id <DIST_ID> \
  --paths "/*"
```

### Step 6: Set Environment Variables
```bash
aws lambda update-function-configuration \
  --function-name bharatmedia-api \
  --environment Variables={
    AWS_REGION=us-east-1,
    JWT_SECRET=<your-secret>,
    ALLOWED_ORIGINS=https://bharatmedia.com,
    NODE_ENV=production
  }
```

### Step 7: Verify Deployment
```bash
# Test health endpoint
curl https://api.bharatmedia.com/health

# Test signup endpoint
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

---

## 📊 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Environment variables set
- [ ] Database ready (if applicable)
- [ ] Backups created

### Build & Deploy
- [ ] Backend builds successfully
- [ ] Frontend builds successfully
- [ ] Deploy backend to Lambda
- [ ] Deploy frontend to S3
- [ ] Update CloudFront
- [ ] Update DNS (if needed)

### Post-Deployment
- [ ] All endpoints accessible
- [ ] WebSocket connections work
- [ ] Error handling works
- [ ] Rate limiting works
- [ ] CORS configured correctly
- [ ] SSL certificates valid

### Smoke Tests
- [ ] Signup works
- [ ] Login works
- [ ] Create campaign works
- [ ] View campaign works
- [ ] Publish campaign works
- [ ] Error handling works

### Monitoring
- [ ] Error logs monitored
- [ ] Performance metrics monitored
- [ ] Uptime monitored
- [ ] User feedback collected

---

## 🔄 Rollback Plan

If deployment fails:

1. **Immediate Rollback**
   ```bash
   # Revert Lambda to previous version
   aws lambda update-function-code \
     --function-name bharatmedia-api \
     --zip-file fileb://backend-previous.zip
   
   # Revert CloudFront to previous version
   aws cloudfront create-invalidation \
     --distribution-id <DIST_ID> \
     --paths "/*"
   ```

2. **DNS Rollback**
   ```bash
   # Point DNS back to previous server
   aws route53 change-resource-record-sets \
     --hosted-zone-id <ZONE_ID> \
     --change-batch file://rollback.json
   ```

3. **Database Rollback**
   ```bash
   # Restore from backup
   aws dynamodb restore-table-from-backup \
     --target-table-name bharatmedia-campaigns \
     --backup-arn <BACKUP_ARN>
   ```

---

## 📈 Post-Deployment Monitoring

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

## 🎯 Success Criteria

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

Made with ❤️ for Digital Bharat 🇮🇳
