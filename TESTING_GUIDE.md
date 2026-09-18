# BharatMedia v2.0 - Testing Guide

## 🚀 Quick Start

### 1. Start Backend
```bash
npm run dev --prefix backend
```
Expected output:
```
🚀 BharatMedia API v2.0 running on http://localhost:4000
📡 WebSocket server on ws://localhost:4000/ws
🤖 Powered by Amazon Bedrock (Nova Pro + Omni + Reel + Sonic)
```

### 2. Start Frontend
```bash
npm run dev --prefix frontend
```
Expected output:
```
VITE v5.1.4  ready in 234 ms

➜  Local:   http://localhost:5173/
```

---

## 🧪 TEST SCENARIOS

### Test 1: Authentication - Signup
**Steps:**
1. Go to http://localhost:5173/signup
2. Enter email: `test@example.com`
3. Enter password: `SecurePass123!`
4. Enter name: `Test User`
5. Select language: Hindi
6. Click "Sign Up"

**Expected:**
- ✅ Success toast notification
- ✅ Redirected to dashboard
- ✅ User data stored with bcrypt hashed password
- ✅ JWT token generated

**Check:**
- Open DevTools → Network → Look for `/api/auth/signup` request
- Response should have `user` and `token`
- Password should NOT be visible in response

---

### Test 2: Authentication - Rate Limiting
**Steps:**
1. Go to http://localhost:5173/login
2. Try to login 6 times with wrong password
3. On 6th attempt, should see rate limit error

**Expected:**
- ✅ First 5 attempts show "Invalid credentials"
- ✅ 6th attempt shows "Too many login attempts"
- ✅ Error toast notification appears

**Check:**
- Open DevTools → Network → Look for 429 status code on 6th request

---

### Test 3: Campaign Creation - Input Validation
**Steps:**
1. Login with valid credentials
2. Go to "New Campaign"
3. Try to create campaign with empty input
4. Click "Create Campaign"

**Expected:**
- ✅ Error toast: "Input must be 5-1000 characters"
- ✅ Form not submitted
- ✅ No API call made

**Check:**
- Open DevTools → Network → No POST to `/api/campaign/create`

---

### Test 4: Campaign Creation - Success
**Steps:**
1. Login with valid credentials
2. Go to "New Campaign"
3. Enter input: "I want to promote my silk sarees for Diwali"
4. Select language: Hindi
5. Select business type: Retail
6. Select region: Maharashtra
7. Click "Create Campaign"

**Expected:**
- ✅ Skeleton loaders appear
- ✅ Pipeline stages update in real-time
- ✅ Each stage shows: Research → Creative → Quality → Distribution → Done
- ✅ Final campaign shows with generated content
- ✅ Success toast: "Campaign created successfully!"

**Check:**
- Open DevTools → Network → WebSocket connection to `/ws?campaignId=...`
- Messages should show stage updates
- No errors in console

---

### Test 5: Error Boundary
**Steps:**
1. Open DevTools → Console
2. Paste: `throw new Error('Test error')`
3. Press Enter

**Expected:**
- ✅ Error boundary catches error
- ✅ Shows error page with "Something went wrong"
- ✅ Shows error message
- ✅ "Reload Page" button works

**Check:**
- Error page should be styled with glass-card
- Reload button should refresh page

---

### Test 6: CORS Configuration
**Steps:**
1. Open DevTools → Console
2. Try to make request from different origin:
```javascript
fetch('http://localhost:4000/api/auth/me', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
```

**Expected:**
- ✅ Request succeeds if origin is whitelisted
- ✅ Request fails with CORS error if origin not whitelisted

**Check:**
- Response headers should include `Access-Control-Allow-Origin`

---

### Test 7: Password Hashing
**Steps:**
1. Signup with email: `hash-test@example.com`
2. Open DevTools → Application → Local Storage
3. Check if password is stored

**Expected:**
- ✅ Password NOT stored in localStorage
- ✅ Only JWT token stored
- ✅ Backend stores bcrypt hash (not plaintext)

**Check:**
- Backend logs should show bcrypt hash starting with `$2b$`

---

### Test 8: Toast Notifications
**Steps:**
1. Create a campaign successfully
2. Watch for toast notifications

**Expected:**
- ✅ Success toast appears (green)
- ✅ Auto-dismisses after 3 seconds
- ✅ Smooth animation in/out
- ✅ Multiple toasts stack

**Check:**
- Toast should have icon (✅), message, and color
- Should disappear automatically

---

### Test 9: Skeleton Loaders
**Steps:**
1. Create a campaign
2. Watch the loading state

**Expected:**
- ✅ Skeleton cards appear while loading
- ✅ Pulsing animation
- ✅ Replaced with actual content when done

**Check:**
- Skeleton should be gray/slate color
- Should animate smoothly

---

### Test 10: Mobile Responsiveness
**Steps:**
1. Open DevTools → Toggle device toolbar
2. Select iPhone 12
3. Test all pages

**Expected:**
- ✅ All buttons are touch-friendly (min 44px)
- ✅ Text is readable
- ✅ No horizontal scroll
- ✅ Forms are easy to fill

**Check:**
- Buttons should be large enough to tap
- Text should not be too small

---

## 🔍 DEBUGGING TIPS

### Check Backend Logs
```bash
# Look for errors in terminal where backend is running
# Should see: "🚀 BharatMedia API v2.0 running..."
```

### Check Frontend Logs
```bash
# Open DevTools → Console
# Should see no red errors
# May see React Router warnings (normal)
```

### Check Network Requests
```bash
# DevTools → Network tab
# Filter by XHR/Fetch
# Check request/response for each API call
```

### Check WebSocket Connection
```bash
# DevTools → Network tab
# Look for WS connection
# Should show messages being sent/received
```

### Check Local Storage
```bash
# DevTools → Application → Local Storage
# Should have: token, user data
# Should NOT have: password, credentials
```

---

## ✅ FINAL CHECKLIST

Before deployment, verify:

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Signup works with validation
- [ ] Login works with rate limiting
- [ ] Campaign creation works
- [ ] WebSocket updates work
- [ ] Error boundary catches errors
- [ ] Toast notifications appear
- [ ] Skeleton loaders show
- [ ] CORS allows frontend origin
- [ ] Passwords are bcrypt hashed
- [ ] No console errors
- [ ] Mobile responsive
- [ ] All buttons clickable

---

## 🚀 DEPLOYMENT

Once all tests pass:

```bash
# Build backend
npm run build --prefix backend

# Build frontend
npm run build --prefix frontend

# Deploy to AWS
# (See SETUP_GUIDE.md for details)
```

---

**Happy Testing! 🎉**

