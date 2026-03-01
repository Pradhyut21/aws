# BharatMedia v2.0 - App Testing Guide

**Date**: March 1, 2026  
**Status**: Ready for Testing

---

## 🚀 QUICK START (5 minutes)

### Step 1: Generate JWT Secret
```bash
openssl rand -base64 32
```
**Output Example**: `aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890abcd=`

### Step 2: Create .env File
Create `backend/.env`:
```
JWT_SECRET=aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890abcd=
JWT_EXPIRY=7d
NODE_ENV=development
PORT=4000
ALLOWED_ORIGINS=http://localhost:5174
```

### Step 3: Build Backend
```bash
npm run build --prefix backend
```

### Step 4: Build Frontend
```bash
npm run build --prefix frontend
```

### Step 5: Start Backend
```bash
npm run dev --prefix backend
```
**Expected**: `🚀 BharatMedia API v2.0 running on http://localhost:4000`

### Step 6: Start Frontend (New Terminal)
```bash
npm run dev --prefix frontend
```
**Expected**: `➜  Local:   http://localhost:5174/`

### Step 7: Open Browser
```
http://localhost:5174
```

---

## 🧪 TEST SCENARIOS (30 minutes)

### Test 1: Signup Flow (5 min)
1. Click "Sign Up" button
2. Fill form:
   - Email: `test@example.com`
   - Password: `SecurePass123`
   - Name: `Test User`
   - Language: `Hindi`
   - Business Type: `Retail`
   - Region: `UP`
3. Click "Create Account"
4. **Expected**: 
   - ✅ Toast: "Welcome to BharatMedia!"
   - ✅ Redirect to Dashboard
   - ✅ User profile displayed

### Test 2: Login Flow (5 min)
1. Logout (if logged in)
2. Click "Log In"
3. Enter:
   - Email: `test@example.com`
   - Password: `SecurePass123`
4. Click "Login"
5. **Expected**:
   - ✅ Redirect to Dashboard
   - ✅ User profile loaded
   - ✅ No errors

### Test 3: Create Campaign (10 min)
1. Click "New Campaign"
2. Fill form:
   - Input: `I want to promote my Diwali sale`
   - Input Type: `Text`
   - Language: `Hindi`
   - Business Type: `Retail`
   - Region: `UP, MP`
3. Click "Create Campaign"
4. **Expected**:
   - ✅ Campaign created
   - ✅ 5-stage pipeline animation:
     - Stage 1: Research Agent (running)
     - Stage 2: Creative Swarm (running)
     - Stage 3: Quality Guard (running)
     - Stage 4: Distribution (running)
     - Stage 5: Published! (done)
   - ✅ Confetti animation on completion
   - ✅ Campaign content displayed

### Test 4: Error Handling (5 min)
1. Try to create campaign with empty input
   - **Expected**: ✅ Toast error "Input is required"
2. Try to create campaign with invalid language
   - **Expected**: ✅ Toast error "Invalid language"
3. Try to login with wrong password
   - **Expected**: ✅ Toast error "Invalid credentials"

### Test 5: Rate Limiting (5 min)
1. Try to login 6 times with wrong password
2. On 6th attempt:
   - **Expected**: ✅ Toast error "Too many login attempts"

---

## 📱 RESPONSIVE DESIGN TEST (10 minutes)

### Mobile (375px)
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone 12 (390x844)
4. **Check**:
   - ✅ All text readable
   - ✅ Buttons clickable
   - ✅ Forms usable
   - ✅ No horizontal scroll

### Tablet (768px)
1. Select iPad (768x1024)
2. **Check**:
   - ✅ Layout optimized
   - ✅ Touch targets adequate
   - ✅ Images scaled correctly

### Desktop (1920px)
1. Select Desktop (1920x1080)
2. **Check**:
   - ✅ Layout centered
   - ✅ Whitespace balanced
   - ✅ Multi-column layouts work

---

## 🔌 API TESTING (15 minutes)

### Using Postman

#### 1. Import Collection
1. Open Postman
2. Import `postman_collection.json`
3. Set environment:
   - `BASE_URL`: `http://localhost:4000/api`

#### 2. Test Signup
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
**Expected**: 201 Created + token

#### 3. Test Login
```
POST /auth/login
{
  "email": "test@example.com",
  "password": "SecurePass123"
}
```
**Expected**: 200 OK + token

#### 4. Test Get User
```
GET /auth/me
Headers: Authorization: Bearer <token>
```
**Expected**: 200 OK + user object

#### 5. Test Create Campaign
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
**Expected**: 200 OK + campaignId

#### 6. Test Get Campaigns
```
GET /campaigns
Headers: Authorization: Bearer <token>
```
**Expected**: 200 OK + array of campaigns

#### 7. Test Health Check
```
GET /health
```
**Expected**: 200 OK + status

---

## 🔐 SECURITY TEST (10 minutes)

### Test 1: Rate Limiting
1. Try to login 6 times with wrong password
2. On 6th attempt:
   - **Expected**: ✅ 429 Too Many Requests

### Test 2: Input Validation
1. Try to create campaign with empty input
   - **Expected**: ✅ 400 Bad Request
2. Try to create campaign with invalid language
   - **Expected**: ✅ 400 Bad Request

### Test 3: Authentication
1. Try to access `/api/campaigns` without token
   - **Expected**: ✅ 401 Unauthorized
2. Try with invalid token
   - **Expected**: ✅ 401 Unauthorized

### Test 4: CORS
1. Make request from different origin
   - **Expected**: ✅ CORS error (if not whitelisted)

---

## 📊 PERFORMANCE TEST (10 minutes)

### Page Load Time
1. Open DevTools → Network
2. Reload page
3. **Check**: Page load time < 2 seconds

### API Response Time
1. Create campaign
2. **Check**: Response time < 200ms

### WebSocket Latency
1. Create campaign
2. Monitor WebSocket messages
3. **Check**: Latency < 100ms between stages

### Memory Usage
1. Open DevTools → Memory
2. Create multiple campaigns
3. **Check**: No significant memory increase

---

## ✅ TESTING CHECKLIST

### Functionality
- [ ] Signup works
- [ ] Login works
- [ ] Campaign creation works
- [ ] WebSocket updates work
- [ ] Error handling works
- [ ] Logout works
- [ ] Profile update works
- [ ] Campaign deletion works

### Security
- [ ] Rate limiting works
- [ ] Input validation works
- [ ] CORS configured
- [ ] Passwords hashed
- [ ] JWT tokens expire
- [ ] Unauthorized access blocked
- [ ] Error messages safe

### Performance
- [ ] Page load < 2s
- [ ] API response < 200ms
- [ ] WebSocket latency < 100ms
- [ ] No memory leaks
- [ ] No console errors

### Responsive
- [ ] Mobile (375px) works
- [ ] Tablet (768px) works
- [ ] Desktop (1920px) works
- [ ] Touch interactions work
- [ ] Landscape orientation works

---

## 🐛 DEBUGGING TIPS

### Backend Issues
```bash
# Check logs
tail -f backend/error.log

# Check environment variables
echo $JWT_SECRET

# Restart backend
npm run dev --prefix backend
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
Ctrl+Shift+Delete
```

### Common Issues

**Issue**: "Cannot find module"
```bash
npm install
npm run build
```

**Issue**: "Port 4000 already in use"
```bash
lsof -i :4000
kill -9 <PID>
```

**Issue**: "WebSocket connection failed"
```bash
# Check backend is running
curl http://localhost:4000/health
```

**Issue**: "Token expired"
```bash
# Login again to get new token
```

---

## 📈 SUCCESS CRITERIA

### All Tests Pass If:
- ✅ No red errors in console
- ✅ All toasts appear correctly
- ✅ Pipeline completes successfully
- ✅ WebSocket updates in real-time
- ✅ Error boundary catches errors
- ✅ Rate limiting blocks after limit
- ✅ Responsive design works on all sizes
- ✅ No TypeScript errors

---

## 🎯 NEXT STEPS AFTER TESTING

### If All Tests Pass
1. ✅ Build for production
2. ✅ Deploy to staging
3. ✅ Run smoke tests
4. ✅ Deploy to production

### If Tests Fail
1. Check error messages
2. Review console logs
3. Check network requests
4. Fix issues
5. Re-run tests

---

## 📞 SUPPORT

For testing help:
1. See QUICK_TEST_GUIDE.md
2. See TESTING_GUIDE.md
3. See postman_collection.json
4. See DOCUMENTATION_INDEX.md

---

Made with ❤️ for Digital Bharat 🇮🇳

**Status**: ✅ READY FOR TESTING
