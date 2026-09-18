# 🎬 BharatMedia — Live Demo Guide

> **"Speak in your language. Publish to the world."**
> India's first Agentic Content Orchestrator | AI for Bharat Hackathon 2026

---

## 🚀 30-Second Demo (Judges — Start Here)

The fastest way to see the full pipeline in action:

1. **Open** → `http://localhost:5173` (or your deployed Amplify URL)
2. **Click** → "Try Demo" button on the landing page
3. **Watch** → 4 AI agents run in real time with live status updates
4. **Explore** → Campaign results: images, captions, BharatScore, WhatsApp preview

---

## 🎯 Full Pipeline Demo — Step by Step

### Step 1: Landing Page
```
URL: /
```
- 🌐 **3D India Globe** rotates with glowing state markers
- ✨ **Multilingual tagline** morphs through 6 Indian languages every 2.8s
- 📊 **Animated stats** count up: 22 languages, 15 platforms, 5 AI agents
- 🎭 **Rural entrepreneur stories** show real use cases (Ramkali, Murugesan, etc.)

---

### Step 2: Create a Campaign (Voice Input)
```
URL: /new-campaign
```

**Voice Input Flow (Real Amazon Transcribe):**
```
🎙️ User speaks in Hindi → WebM audio recorded
     ↓
POST /api/voice/transcribe (multipart)
     ↓
ffmpeg converts WebM → PCM 16kHz mono
     ↓
Amazon Transcribe Streaming (hi-IN)
     ↓
Transcript returned: "Mera naam Raju hai, main Varanasi mein..."
     ↓
Text auto-populates the campaign input field
```

**Text Input (works without mic):**
```
Input:  "Mujhe Diwali ke liye ek campaign chahiye — varanasi silk sarees"
Language: Hindi (हिंदी)
Business: Handicraft / Textiles
Regions: Uttar Pradesh, Delhi
```

---

### Step 3: AI Pipeline (Real-Time WebSocket)
```
URL: /new-campaign → Step 2
```

The pipeline runs via **real AWS Bedrock calls** with live WebSocket status:

```
Stage 1 — Research Agent (Nova Pro)          ~8-12s
┌─────────────────────────────────────────────────────┐
│ ✅ Market intelligence ready                        │
│    6 hashtags · 3 signals                          │
│    Cultural context: Banarasi silk heritage         │
│    Best time: Instagram 7:00 PM IST                 │
└─────────────────────────────────────────────────────┘

Stage 2 — Creative Swarm (Nova Lite) ∥ Quality Pre-Check
┌─────────────────────────────────────────────────────┐
│ ✅ 4 images generated (Titan → S3)                  │
│    6 captions: Instagram, Facebook, Twitter,        │
│    YouTube, WhatsApp, LinkedIn                      │
│    15-second video script generated                 │
└─────────────────────────────────────────────────────┘

Stage 3 — Quality Guard (Nova Pro)           ~5-8s
┌─────────────────────────────────────────────────────┐
│ ✅ BharatScore: 87/100                              │
│    Toxicity: PASS · Cultural: PASS · Brand: PASS    │
│    2 revision suggestions                           │
└─────────────────────────────────────────────────────┘

Stage 4 — Distribution Agent (Nova Lite)     ~4-6s
┌─────────────────────────────────────────────────────┐
│ ✅ Best time: 7:00 PM IST (Instagram)               │
│    Estimated reach: 42,000 users                    │
│    Regional influencer matches: 3                   │
└─────────────────────────────────────────────────────┘

Stage 5 — Persisted to DynamoDB              ~1s
┌─────────────────────────────────────────────────────┐
│ ✅ Campaign saved · A/B experiment created           │
│    Learning lesson extracted → next campaign smarter│
│    Content fingerprint: SHA-256 verified            │
└─────────────────────────────────────────────────────┘
```

**Total pipeline time: ~25-40 seconds** (real Bedrock calls)

---

### Step 4: Campaign Results
```
URL: /new-campaign → Step 3
```

| Tab | What You See |
|-----|-------------|
| 🖼️ **Images** | 4 platform-specific images (Titan → S3 real URLs) |
| ✍️ **Captions** | Native script captions for 6 platforms |
| 🔍 **SEO** | Title, meta description, 11 Hindi + English keywords |
| 💬 **WhatsApp** | Phone mockup with authentic WhatsApp UI |
| 🎬 **Storyboard** | 15-second video script with hook/story/CTA |
| 🔄 **Remixer** | Amazon Translate across 9 Indian languages live |

---

### Step 5: BharatScore Panel
```
Score: 87/100
├── Cultural Fit:          26/30  ████████░░
├── SEO Score:             22/25  ████████░░
├── Engagement Potential:  22/25  ████████░░
└── Platform Optimization: 17/20  ████████░░
```

---

### Step 6: Publish Campaign
```
Select platforms: [Instagram] [WhatsApp]
Click "Publish to 2 Platforms"
→ Confetti animation + success toast
→ Estimated reach: 42,000+ shown
```

---

### Step 7: Dashboard
```
URL: /dashboard
```
- 📊 24 campaigns · 2.4M reach · 5 languages
- 🗓️ Campaign cards with BharatScore badges
- 📈 Recharts line/pie analytics
- 🗺️ India state choropleth engagement map

---

### Step 8: V3 Features
```
URL: /agent-trace     → Real-time step-by-step agent decision log
URL: /experiment-lab  → A/B language variant experiment dashboard  
URL: /persona-review  → 20 Indian persona AI focus group reviews
URL: /market-pulse    → Real-time trending signals (simulated, labelled)
URL: /bharatbrain     → Upload brand documents to S3 for AI context
URL: /analytics       → India heatmap + engagement charts
```

---

## 🔌 Real API Endpoints (Live Demo)

### Start a Campaign
```bash
curl -X POST http://localhost:4000/api/campaign/create \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Mujhe Diwali ke liye silk sarees campaign chahiye",
    "inputType": "text",
    "language": "hi",
    "businessType": "handicraft",
    "region": ["Uttar Pradesh", "Delhi"]
  }'
# Response: { "campaignId": "abc-123", "wsChannel": "/ws?campaignId=abc-123" }
```

### Voice Transcription (Real Amazon Transcribe)
```bash
curl -X POST http://localhost:4000/api/voice/transcribe \
  -H "Authorization: Bearer <token>" \
  -F "audio=@recording.webm;type=audio/webm" \
  -F "language=hi"
# Response:
# {
#   "transcription": "मुझे दिवाली के लिए एक सिल्क साड़ी कैम्पेन चाहिए",
#   "detectedLanguage": "hi",
#   "languageName": "Hindi",
#   "confidence": 0.94,
#   "source": "amazon_transcribe",
#   "service": "Amazon Transcribe Streaming",
#   "durationMs": 2341
# }
```

### Translate Captions (Real Amazon Translate)
```bash
curl -X POST http://localhost:4000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Special Diwali offer — 30% off silk sarees!", "sourceLang": "en"}'
# Returns translations in: hi, ta, te, kn, ml, mr, bn, gu, pa
```

### Text-to-Speech (Real Amazon Polly)
```bash
curl -X POST http://localhost:4000/api/voice/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text": "नमस्ते! दिवाली की शुभकामनाएं!", "language": "hi"}'
# Returns presigned S3 URL for MP3 audio (Aditi voice, Hindi)
```

### System Health
```bash
curl http://localhost:4000/health
# { "status": "ok", "service": "BharatMedia API", "version": "3.1.0" }
```

---

## 🏗️ Architecture Diagram

```
                        User (any Indian language)
                               │
                    ┌──────────┴──────────┐
                    │                     │
               Voice Input           Text Input
                    │                     │
          Amazon Transcribe          (direct)
           Streaming (hi-IN)              │
                    │                     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Orchestrator Agent  │
                    │  (custom Strands SDK)│
                    │  Circuit Breaker ✓   │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
    ┌─────────▼──┐    ┌────────▼────────┐  ┌───▼──────────┐
    │ Research   │    │ Creative Swarm  │  │ Quality Guard│
    │ (Nova Pro) │    │ (Nova Lite)     │  │ (Nova Pro)   │
    │            │    │ + Titan Image   │  │              │
    │ ✓ Hashtags │    │ ✓ 6 Captions   │  │ ✓ BharatScore│
    │ ✓ Demographics  │ ✓ S3 images    │  │ ✓ Safety     │
    │ ✓ History  │    │ ✓ Video script │  │   check      │
    └─────────┬──┘    └────────┬────────┘  └───┬──────────┘
              │                │               │
              └────────────────┼───────────────┘
                               │
                    ┌──────────▼──────────┐
                    │ Distribution Agent  │
                    │ (Nova Lite)         │
                    │ ✓ Posting times     │
                    │ ✓ Estimated reach   │
                    │ ✓ Influencer match  │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
    ┌─────────▼──┐    ┌────────▼────────┐  ┌───▼──────────┐
    │  DynamoDB  │    │  A/B Experiment │  │ Learning     │
    │  Campaign  │    │  (3 variants)   │  │ Loop         │
    │  + Trace   │    │  per campaign   │  │ (DynamoDB)   │
    └────────────┘    └─────────────────┘  └──────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  WebSocket Broadcast │
                    │  (real-time status)  │
                    └─────────────────────┘
```

---

## 📹 Recording Your Own Demo

To record the live pipeline for submission:

1. Start both servers: `npm run dev` (from repo root)
2. Open: `http://localhost:5173`
3. Sign up with any email/password
4. Click **"New Campaign"** → enter Hindi text → click **"Generate Campaign"**
5. Watch the 5-stage pipeline animate in real time
6. Record with OBS, Loom, or your screen recorder

**Key moments to capture:**
- ⏱️ 0:00 — Landing page globe + morphing text
- ⏱️ 0:15 — New Campaign form with voice mic button
- ⏱️ 0:30 — Pipeline stages lighting up sequentially
- ⏱️ 1:00 — Campaign results: images + captions + BharatScore
- ⏱️ 1:30 — WhatsApp preview on phone mockup
- ⏱️ 1:50 — Publish → confetti → Dashboard stats

---

## 🛠️ Running Locally

```bash
# Prerequisites: Node.js 18+, AWS credentials configured

# 1. Clone
git clone https://github.com/your-username/bharatmedia.git
cd bharatmedia

# 2. Install all dependencies
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# 3. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your AWS credentials + JWT_SECRET

# 4. Start both servers
npm run dev
# Frontend: http://localhost:5173
# Backend:  http://localhost:4000
```

**Required IAM permissions:**
```json
{
  "Effect": "Allow",
  "Action": [
    "bedrock:InvokeModel",
    "dynamodb:*",
    "s3:PutObject", "s3:GetObject",
    "polly:SynthesizeSpeech",
    "translate:TranslateText",
    "comprehend:DetectSentiment", "comprehend:DetectKeyPhrases",
    "rekognition:DetectModerationLabels",
    "transcribe:StartStreamTranscription"
  ],
  "Resource": "*"
}
```

---

*BharatMedia v3.1.0 | AI for Bharat Hackathon 2026 | Team Haya*
