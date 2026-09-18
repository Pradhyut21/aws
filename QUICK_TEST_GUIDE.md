# BharatMedia v2.0 - Quick Testing Guide

## 🚀 Quick Start (5 minutes)

### 1. Start Backend
```bash
cd backend
npm run dev
# Should see: 🚀 BharatMedia API v2.0 running on http://localhost:4000
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
# Should see: ➜  Local:   http://localhost:5173/
```

### 3. Open Browser
```
http://localhost:5173
```

---

## ✅ Quick Test Scenarios (10 minutes)

### Test 1: Signup & Login
1. Click "Sign Up" button
2. Fill form:
   - Email: `test@example.com`
   - Password: `SecurePass123`
   - Name: `Test User`
   - Language: `Hindi`
   - Business Type: `Retail`
   - Region: `UP`
3. Click "Create Account"
4. Should see: ✅ Toast notification "Welcome to BharatMedia!"
5. Should redirect to Dashboard
6. Logout and login again with same credentials
7. Should see: ✅ User profile loaded

### Test 2: Create Campaign
1. Click "New Campaign" button
2. Fill form:
   - Input: `I want to promote my Diwali sale`
   - Input Type: `Text`
   - Language: `Hindi`
   - Business Type: `Retail`
   - Region: `UP, MP`
3. Click "Create Campaign"
4. Should see: ✅ 5-stage pipeline animation
   - Stage 1: Research Agent (running)
   - Stage 2: Creative Swarm (running)
   - Stage 3: Quality Guard (running)
   - Stage 4: Distribution (running)
   - Stage 5: Published! (done)
5. Should see: ✅ Confetti animation on completion
6. Should see: ✅ Campaign content generated

### Test 3: Error Handling
1. Try to create campaign with empty input
2. Should see: ✅ Toast error "Input is required"
3. Try to create campaign with invalid language
4. Should see: ✅ Toast error "Invalid language"
5. Try to login with wrong password
6. Should see: ✅ Toast error "Invalid credentials"

### Test 4: Rate Limiting
1. Try to login 6 times with wrong password
2. On 6th attempt, should see: ✅ Toast error "Too many login attempts"
3. Wait 15 minutes or restart backend to reset

### Test 5: Responsive Design
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test on mobile sizes:
   - iPhone 12 (390x844)
   - iPad (768x1024)
   - Desktop (1920x1080)
4. Should see: ✅ All elements responsive and readable

### Test 6: WebSocket Connection
1. Open DevTools → Network → WS
2. Create a campaign
3. Should see: ✅ WebSocket connection to `/ws?campaignId=...`
4. Should see: ✅ Real-time stage updates flowing in

### Test 7: Error Boundary
1. Open DevTools Console
2. Type: `throw new Error('Test error')`
3. Should see: ✅ Error Boundary catches it
4. Should see: ⚠️ Error message displayed
5. Click "Reload Page" button
6. Should see: ✅ Page reloads successfully

---

## 🧪 API Testing with Postman

### Import Collection
1. Open Postman
2. Import `postman_collection.json`
3. Set environment variables:
   - `BASE_URL`: `http://localhost:4000/api`
   - `TOKEN`: (will be set after login)

### Test Endpoints

#### 1. Signup
```
POST /auth/signup
{
  "email": "test@example.com",
  "password": "SecurePass123",
  "name": "Test User",
  "language": "hi",
  "businessType": "retail",
  "region": ["UP"]
}
```
Expected: 201 Created + token

#### 2. Login
```
POST /auth/login
{
  "email": "test@example.com",
  "password": "SecurePass123"
}
```
Expected: 200 OK + token

#### 3. Get Current User
```
GET /auth/me
Headers: Authorization: Bearer <token>
```
Expected: 200 OK + user object

#### 4. Create Campaign
```
POST /campaign/create
Headers: Authorization: Bearer <token>
{
  "input": "I want to promote my Diwali sale",
  "inputType": "text",
  "language": "hi",
  "businessType": "retail",
  "region": ["UP", "MP"]
}
```
Expected: 200 OK + campaignId + wsChannel

#### 5. Get Campaign
```
GET /campaign/:id
```
Expected: 200 OK + campaign object

#### 6. Get User Campaigns
```
GET /campaigns
Headers: Authorization: Bearer <token>
```
Expected: 200 OK + array of campaigns

#### 7. Publish Campaign
```
POST /campaign/:id/publish
Headers: Authorization: Bearer <token>
{
  "platforms": ["instagram", "whatsapp"]
}
```
Expected: 200 OK + success message

#### 8. Get Analytics
```
GET /analytics
Headers: Authorization: Bearer <token>
```
Expected: 200 OK + analytics object

#### 9. Get Pricing
```
GET /pricing
```
Expected: 200 OK + pricing tiers

#### 10. Health Check
```
GET /health
```
Expected: 200 OK + status

---

## 🔍 Debugging Tips

### Backend Issues
```bash
# Check logs
tail -f backend/error.log

# Check environment variables
cat backend/.env

# Restart backend
npm run dev

# Check port 4000 is available
lsof -i :4000
```

### Frontend Issues
```bash
# Check console errors
Open DevTools → Console

# Check network requests
Open DevTools → Network

# Check WebSocket connection
Open DevTools → Network → WS

# Clear cache and reload
Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
```

### Database Issues
```bash
# Check in-memory store
# Users: backend/src/services/auth.ts (users Map)
# Campaigns: backend/src/services/store.ts (campaigns Map)
# Note: Data is lost on server restart (use DynamoDB for persistence)
```

---

## 📊 Performance Checklist

- [ ] Page load time < 2 seconds
- [ ] Campaign creation < 10 seconds
- [ ] WebSocket updates < 100ms latency
- [ ] No memory leaks (check DevTools Memory tab)
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Lighthouse score > 80

---

## 🔐 Security Checklist

- [ ] Passwords are hashed with bcrypt
- [ ] JWT tokens expire after 7 days
- [ ] Rate limiting works (6 login attempts blocked)
- [ ] CORS only allows whitelisted origins
- [ ] Input validation rejects invalid data
- [ ] Error messages don't leak sensitive info
- [ ] No credentials in .env.example

---

## 📱 Mobile Testing

### iOS (Safari)
1. Open http://localhost:5173 on iPhone
2. Test touch interactions
3. Test voice recording (if available)
4. Test landscape orientation

### Android (Chrome)
1. Open http://localhost:5173 on Android device
2. Test touch interactions
3. Test voice recording
4. Test landscape orientation

### Responsive Breakpoints
- Mobile: 375px - 640px
- Tablet: 641px - 1024px
- Desktop: 1025px+

---

## 🎯 Success Criteria

✅ All tests pass if you see:
- No red errors in console
- All toasts appear correctly
- Pipeline completes successfully
- WebSocket updates in real-time
- Error boundary catches errors
- Rate limiting blocks after limit
- Responsive design works on all sizes
- No TypeScript errors

---

## 📞 Troubleshooting

### "Cannot find module" error
```bash
npm install
npm run build
```

### "Port 4000 already in use"
```bash
# Kill process on port 4000
lsof -i :4000
kill -9 <PID>
```

### "WebSocket connection failed"
```bash
# Check backend is running
curl http://localhost:4000/health

# Check CORS is configured
# See backend/src/index.ts line 42
```

### "Token expired"
```bash
# Login again to get new token
# JWT expires after 7 days
```

### "Rate limit exceeded"
```bash
# Wait 15 minutes or restart backend
# Rate limit resets every 15 minutes
```

---

## 🚀 Ready to Deploy?

Once all tests pass:
1. Run `npm run build` in both frontend and backend
2. Check for any build errors
3. Deploy to AWS Lambda (backend)
4. Deploy to S3 + CloudFront (frontend)
5. Update environment variables
6. Run smoke tests on production

---

Made with ❤️ for Digital Bharat 🇮🇳
