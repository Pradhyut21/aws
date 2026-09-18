# JWT Secret Key - Complete Guide

**Date**: March 1, 2026  
**Topic**: JWT Secret Key Configuration

---

## 🔐 What is JWT Secret Key?

### Definition
A **JWT Secret Key** is a cryptographic key used to sign and verify JSON Web Tokens (JWT). It's a private key that only your server knows about.

### Purpose
- **Sign tokens**: When a user logs in, the server creates a JWT and signs it with the secret key
- **Verify tokens**: When a user makes a request, the server verifies the token signature using the same secret key
- **Prevent tampering**: If someone tries to modify the token, the signature will be invalid

---

## 🔑 How JWT Works

### Token Structure
```
Header.Payload.Signature
```

Example:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### Breakdown
1. **Header**: Algorithm and token type
   ```json
   {
     "alg": "HS256",
     "typ": "JWT"
   }
   ```

2. **Payload**: User data
   ```json
   {
     "userId": "123",
     "email": "test@example.com",
     "iat": 1234567890,
     "exp": 1234571490
   }
   ```

3. **Signature**: Created using secret key
   ```
   HMACSHA256(
     base64UrlEncode(header) + "." +
     base64UrlEncode(payload),
     secret_key
   )
   ```

---

## 🛡️ Security Best Practices

### 1. Generate Strong Secret Key
```bash
# Generate 32-byte random secret (256-bit)
openssl rand -base64 32
```

**Output Example:**
```
aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890abcd=
```

### 2. Store Securely
- ✅ Store in environment variables
- ✅ Store in AWS Secrets Manager
- ✅ Store in HashiCorp Vault
- ❌ Never commit to Git
- ❌ Never hardcode in source code
- ❌ Never share publicly

### 3. Rotate Regularly
- Rotate every 90 days
- Keep old keys for verification during transition
- Update all services simultaneously

### 4. Use HTTPS
- Always use HTTPS in production
- Prevents token interception
- Protects secret key transmission

---

## 🔧 Implementation in BharatMedia

### Current Implementation

**File**: `backend/src/services/auth.ts`

```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '7d';
const BCRYPT_ROUNDS = 12;

// Generate JWT token
export function generateToken(user: User): string {
    return jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
    );
}

// Verify JWT token
export function verifyToken(token: string): AuthToken | null {
    try {
        return jwt.verify(token, JWT_SECRET) as AuthToken;
    } catch (error) {
        return null;
    }
}
```

### Environment Variable

**File**: `backend/.env`

```
JWT_SECRET=your-generated-secret-key-here
JWT_EXPIRY=7d
NODE_ENV=production
```

---

## 📋 Setup Instructions

### Step 1: Generate Secret Key

#### Option A: Using OpenSSL
```bash
openssl rand -base64 32
```

#### Option B: Using Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### Option C: Using Python
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Step 2: Store in Environment Variable

#### Local Development
Create `backend/.env`:
```
JWT_SECRET=your-generated-secret-key-here
JWT_EXPIRY=7d
NODE_ENV=development
```

#### AWS Lambda
```bash
aws lambda update-function-configuration \
  --function-name bharatmedia-api \
  --environment Variables={
    JWT_SECRET=your-generated-secret-key-here,
    JWT_EXPIRY=7d,
    NODE_ENV=production
  }
```

#### AWS Secrets Manager
```bash
aws secretsmanager create-secret \
  --name bharatmedia/jwt-secret \
  --secret-string '{"JWT_SECRET":"your-generated-secret-key-here"}'
```

### Step 3: Verify Configuration

```bash
# Check environment variable is set
echo $JWT_SECRET

# Should output your secret key
```

---

## 🔄 Token Lifecycle

### 1. User Signup
```
User submits email + password
    ↓
Server hashes password with bcrypt
    ↓
Server creates JWT with userId
    ↓
Server signs JWT with JWT_SECRET
    ↓
Server returns JWT to client
```

### 2. User Login
```
User submits email + password
    ↓
Server finds user by email
    ↓
Server verifies password with bcrypt
    ↓
Server creates JWT with userId
    ↓
Server signs JWT with JWT_SECRET
    ↓
Server returns JWT to client
```

### 3. Authenticated Request
```
Client sends request with JWT in Authorization header
    ↓
Server extracts JWT from header
    ↓
Server verifies JWT signature using JWT_SECRET
    ↓
If valid: Extract userId and process request
    ↓
If invalid: Return 401 Unauthorized
```

---

## 📊 JWT Token Example

### Signup Response
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "test@example.com",
    "name": "Test User",
    "language": "hi",
    "businessType": "retail",
    "tier": "free"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3NzAwMDAwMDAsImV4cCI6MTc3MDYwNDgwMH0.abc123def456..."
}
```

### Token Usage
```bash
# Make authenticated request
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:4000/api/auth/me
```

---

## 🔐 Security Considerations

### Token Expiry
- **Current**: 7 days
- **Recommendation**: 1-24 hours for sensitive operations
- **Refresh tokens**: Use separate refresh tokens for longer sessions

### Token Storage
- ✅ Store in secure HTTP-only cookies
- ✅ Store in secure local storage (with HTTPS)
- ❌ Never store in plain text
- ❌ Never log tokens

### Token Validation
- ✅ Verify signature on every request
- ✅ Check token expiry
- ✅ Check user still exists
- ✅ Check user permissions

---

## 🚨 Common Issues

### Issue 1: Token Verification Fails
**Cause**: JWT_SECRET mismatch
**Solution**: Ensure same secret key on all servers

### Issue 2: Token Expires Too Quickly
**Cause**: JWT_EXPIRY set to short duration
**Solution**: Increase JWT_EXPIRY or implement refresh tokens

### Issue 3: Token Not Sent in Request
**Cause**: Missing Authorization header
**Solution**: Add header: `Authorization: Bearer <token>`

### Issue 4: Invalid Signature Error
**Cause**: Secret key changed
**Solution**: Use same secret key or implement key rotation

---

## 📈 Production Checklist

### Before Deployment
- [ ] Generate strong secret key (32+ bytes)
- [ ] Store in environment variables
- [ ] Never commit secret to Git
- [ ] Use HTTPS in production
- [ ] Set appropriate token expiry
- [ ] Implement token refresh mechanism
- [ ] Monitor token usage
- [ ] Plan key rotation strategy

### After Deployment
- [ ] Verify tokens are being generated
- [ ] Verify tokens are being validated
- [ ] Monitor authentication errors
- [ ] Monitor token expiry issues
- [ ] Plan key rotation schedule

---

## 🔄 Key Rotation Strategy

### Step 1: Generate New Key
```bash
openssl rand -base64 32
```

### Step 2: Update Environment
```bash
aws lambda update-function-configuration \
  --function-name bharatmedia-api \
  --environment Variables={JWT_SECRET=new-secret-key}
```

### Step 3: Verify New Key Works
```bash
# Test signup/login with new key
curl -X POST http://localhost:4000/api/auth/signup ...
```

### Step 4: Invalidate Old Tokens (Optional)
```bash
# Force users to re-login
# Or implement token blacklist
```

---

## 📚 References

### JWT Documentation
- [jwt.io](https://jwt.io) - JWT introduction and debugger
- [RFC 7519](https://tools.ietf.org/html/rfc7519) - JWT specification

### Node.js JWT Libraries
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) - Used in BharatMedia
- [jose](https://www.npmjs.com/package/jose) - Alternative JWT library

### Security Resources
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [Auth0 JWT Best Practices](https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/)

---

## 🎯 Summary

### What is JWT Secret Key?
A cryptographic key used to sign and verify JWT tokens

### Why is it Important?
- Prevents token tampering
- Ensures token authenticity
- Protects user authentication

### How to Generate?
```bash
openssl rand -base64 32
```

### How to Store?
- Environment variables
- AWS Secrets Manager
- HashiCorp Vault

### How to Use?
```bash
JWT_SECRET=your-generated-key npm run dev
```

---

Made with ❤️ for Digital Bharat 🇮🇳
