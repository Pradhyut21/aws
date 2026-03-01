# JWT Secret Key - Quick Reference

---

## 🔐 What is JWT Secret Key?

A **secret key** used to sign and verify JWT tokens. Only your server knows it.

---

## 🔑 Generate Secret Key

### Quick Command
```bash
openssl rand -base64 32
```

### Output Example
```
aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890abcd=
```

---

## 📋 Setup Steps

### Step 1: Generate Key
```bash
openssl rand -base64 32
```

### Step 2: Create `.env` File
```
JWT_SECRET=aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890abcd=
JWT_EXPIRY=7d
NODE_ENV=production
```

### Step 3: Start Server
```bash
npm run dev
```

### Step 4: Test
```bash
curl -X POST http://localhost:4000/api/auth/signup \
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

## 🚀 For AWS Lambda Deployment

```bash
aws lambda update-function-configuration \
  --function-name bharatmedia-api \
  --environment Variables={
    JWT_SECRET=aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890abcd=,
    JWT_EXPIRY=7d,
    NODE_ENV=production
  }
```

---

## 🛡️ Security Rules

✅ **DO:**
- Generate strong random key (32+ bytes)
- Store in environment variables
- Use HTTPS in production
- Rotate every 90 days
- Keep in AWS Secrets Manager

❌ **DON'T:**
- Commit to Git
- Hardcode in source code
- Share publicly
- Use weak passwords
- Log tokens

---

## 📊 How It Works

```
User Login
    ↓
Server creates JWT with userId
    ↓
Server signs with JWT_SECRET
    ↓
Client receives token
    ↓
Client sends token in Authorization header
    ↓
Server verifies signature with JWT_SECRET
    ↓
If valid: Process request
If invalid: Return 401 Unauthorized
```

---

## 🔄 Token Lifecycle

1. **Generate**: `openssl rand -base64 32`
2. **Store**: In `.env` as `JWT_SECRET`
3. **Sign**: Server signs tokens with this key
4. **Verify**: Server verifies tokens with this key
5. **Expire**: After 7 days (configurable)

---

## 🎯 Key Points

- **What**: Cryptographic key for JWT signing
- **Why**: Prevents token tampering
- **How**: `openssl rand -base64 32`
- **Where**: Environment variables
- **When**: Every deployment

---

Made with ❤️ for Digital Bharat 🇮🇳
