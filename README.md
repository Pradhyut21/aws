# BharatMedia — भारत का AI Content Studio

> **India's first Agentic Content Orchestrator** | AI for Bharat Hackathon 2026 | Team Haya

<!-- AWS Service Badges -->
![Amazon Bedrock](https://img.shields.io/badge/Amazon%20Bedrock-Nova%20Pro%20%7C%20Nova%20Lite%20%7C%20Titan-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Amazon DynamoDB](https://img.shields.io/badge/DynamoDB-Campaigns%20%7C%20Traces%20%7C%20Users-4053D6?style=for-the-badge&logo=amazon-dynamodb&logoColor=white)
![Amazon S3](https://img.shields.io/badge/Amazon%20S3-Images%20%7C%20Audio%20%7C%20Docs-569A31?style=for-the-badge&logo=amazon-s3&logoColor=white)
![Amazon Polly](https://img.shields.io/badge/Amazon%20Polly-10%20Indian%20Languages-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Amazon Transcribe](https://img.shields.io/badge/Amazon%20Transcribe-Speech%20to%20Text-FF4F8B?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Amazon Translate](https://img.shields.io/badge/Amazon%20Translate-9%20Languages-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Amazon Comprehend](https://img.shields.io/badge/Amazon%20Comprehend-Sentiment%20%7C%20NLP-8B5CF6?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Amazon Rekognition](https://img.shields.io/badge/Amazon%20Rekognition-Image%20Moderation-00D4FF?style=for-the-badge&logo=amazon-aws&logoColor=white)

<!-- Tech Stack -->
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-Real--time%20Pipeline-00FF88?style=for-the-badge&logo=socket.io&logoColor=white)

<!-- Hackathon + Stats -->
![Hackathon](https://img.shields.io/badge/AI%20for%20Bharat-Hackathon%202026-FF6B35?style=for-the-badge)
![Languages](https://img.shields.io/badge/Indian%20Languages-22%2B-F7C948?style=for-the-badge)
![AWS Services](https://img.shields.io/badge/AWS%20Services-9%20Real%20Calls-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<!-- Quick Links -->
**[🎬 Live Demo Guide](./LIVE_DEMO.md)** · **[✅ Capabilities (Real vs Demo)](./CAPABILITIES.md)** · **[🏗️ Architecture](./ARCHITECTURE.md)** · **[⚡ Quick Start](./QUICK_START.md)**

---

## 🏆 Overview

BharatMedia transforms any Indian small business owner's voice or text input (in any of 22 official Indian languages) into a fully published, culturally intelligent multi-platform content campaign.

**"Speak in your language. Publish to the world."**

### Key Numbers
- **22+** Indian languages supported
- **15+** social media platforms
- **5** AI agents coordinating in real-time
- **₹99/month** for unlimited campaigns
- **~10 minutes** from idea to published campaign

---

## 🤖 AI Architecture (AWS Bedrock)

```
User Voice/Text Input
        │
        ▼
┌────────────────────────────────────────────────────────────┐
│                  BharatMedia Agent Pipeline                  │
│                                                              │
│  [1] Research Agent (Nova Pro)                               │
│       └── Trends, demographics, hashtags, posting times      │
│                                                              │
│  [2] Creative Swarm (Nova Omni + Nova Reel)                  │
│       └── Instagram captions, YouTube script, WhatsApp msg   │
│       └── AI image prompts → S3, 15s Reel script             │
│                                                              │
│  [3] Quality Guard (Bedrock Guardrails)                      │
│       └── Cultural sensitivity check in 22 languages         │
│       └── Brand safety validation → BharatScore™             │
│                                                              │
│  [4] Distribution Agent (Nova Sonic)                         │
│       └── Optimal posting times, influencer matching          │
│       └── Regional SEO keywords in native script             │
│                                                              │
│  [5] Published! (API Gateway + SNS)                          │
│       └── Multi-platform publishing + analytics tracking     │
└────────────────────────────────────────────────────────────┘
        │
        ▼
Campaign Live on Instagram + WhatsApp + Facebook + YouTube
```

### AWS Services Used
| Service | Purpose |
|---------|---------|
| **Amazon Bedrock Nova Pro** | Research agent, SEO, distribution |
| **Amazon Bedrock Nova Lite** | Multilingual content generation |
| **Amazon Bedrock Nova Lite** | AI video **script** generation (15-second structured scripts) |
| **Bedrock Guardrails** | Cultural sensitivity + brand safety |
| **AWS Lambda** | Agent orchestration |
| **Amazon DynamoDB** | Campaign + analytics storage |
| **Amazon S3 + CloudFront** | Generated media storage + CDN |
| **API Gateway WebSocket** | Real-time pipeline status |
| **Amazon Polly** | Text-to-speech in 10 Indian languages |
| **Amazon Transcribe Streaming** | Voice-to-text in 10 Indian languages |
| **Amazon Translate** | Multilingual caption translation |
| **Amazon Comprehend** | Sentiment analysis + key phrases |
| **Amazon Rekognition** | Image content moderation |
| **AWS Cognito** | User authentication |

---

## ✅ Capabilities — Real vs Demo (Hackathon v1)

| Feature | Status | Notes |
|---------|--------|-------|
| Bedrock content generation (Nova Pro + Lite) | ✅ **Real** | Research, captions, quality check |
| Titan Image Generator → S3 | ✅ **Real** | Falls back to placeholder on quota |
| DynamoDB persistence | ✅ **Real** | Campaigns, users, experiments, traces |
| Amazon Polly TTS | ✅ **Real** | 10 Indian languages via POST /api/voice/synthesize |
| Amazon Translate | ✅ **Real** | 9 Indian language translations in parallel |
| Amazon Comprehend | ✅ **Real** | Sentiment + key phrase analysis |
| Amazon Rekognition | ✅ **Real** | Image content moderation |
| WebSocket real-time pipeline | ✅ **Real** | With keepalive + SSE fallback |
| Learning loop (DynamoDB) | ✅ **Real** | Lessons from past campaigns feed next run |
| A/B Experiment Engine | ✅ **Real** | 3 language variants per campaign |
| AI Video Script Generation | ✅ **Real** | Structured 15-sec script (Nova Lite) |
| Voice transcription (mic input) | ✅ **Real** | Amazon Transcribe Streaming, 10 Indian languages |
| Video file rendering | 🔶 **v2 roadmap** | Needs Nova Reel StartAsyncInvoke + S3 polling |
| Social media publishing | 🔶 **Demo** | Saves to DB — production: platform OAuth APIs |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/bharatmedia.git
cd bharatmedia

# Install all dependencies
npm install
cd frontend && npm install
cd ../backend && npm install
cd ..

# Start both servers concurrently
npm run dev
```

This starts:
- **Frontend** (Vite + React): http://localhost:5173
- **Backend** (Express + WS): http://localhost:4000

### Environment Variables (for real AWS integration)

```env
# backend/.env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
BEDROCK_MODEL_ID=amazon.nova-pro-v1:0
DYNAMODB_TABLE=bharatmedia-campaigns
S3_BUCKET=bharatmedia-media
```

---

## 📄 Demo Flow (for judges)

1. **Landing Page** → See 3D India Globe rotating, language text morphing through 6 languages
2. **Click "Try Demo"** → Auto-fills Raju's Varanasi Silk Sarees scenario in Hindi
3. **Pipeline animates** → 5 agents light up with live status updates (simulated ~8s)
4. **Results** → 4 images, 6 captions, SEO data, WhatsApp preview, BharatScore: 87/100
5. **Publish** → Click "Publish to 2 Platforms" → Success toast with reach estimate
6. **Dashboard** → View stats: 24 campaigns, 2.4M reach, 5 languages
7. **Analytics** → India state choropleth map + Recharts dashboards

---

## 🗂️ File Structure

```
d:\prototype aws\
├── package.json              # Root (concurrently script)
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # Router
│   │   ├── main.tsx          # Entry
│   │   ├── index.css         # Design system
│   │   ├── components/
│   │   │   ├── 3d/           # Three.js components
│   │   │   │   ├── IndiaGlobe.tsx
│   │   │   │   ├── AgentPipeline3D.tsx
│   │   │   │   ├── FloatingCards3D.tsx
│   │   │   │   └── WaveBackground.tsx
│   │   │   ├── ui/           # 13 UI components
│   │   │   └── layout/       # Navbar, Sidebar, Footer
│   │   ├── pages/            # Landing, Dashboard, NewCampaign, Analytics
│   │   ├── hooks/            # useVoiceRecorder, useCampaignPipeline, etc.
│   │   └── lib/              # types, constants (22 languages), mockData, api
│   ├── vite.config.ts
│   └── tailwind.config.ts
└── backend/
    └── src/
        ├── index.ts          # Express + WebSocket server
        ├── agents/           # researchAgent, creativeSwarm, qualityGuard, distributionAgent
        └── services/store.ts # In-memory campaign store
```

---

## 🎨 Design System

| Token | Value | Purpose |
|-------|-------|---------|
| `#0A0F1E` | Deep Space Navy | Primary background |
| `#FF6B35 → #F7C948` | Saffron → Gold | Primary gradient (India's colors) |
| `#00D4FF` | Electric Cyan | AI accent |
| `#00FF88` | Neon Green | Success states |
| **Poppins** | Headlines | Bold, modern |
| **Inter** | Body | Clean, readable |
| **JetBrains Mono** | Code/Badges | Technical labels |

---

## 👥 Team Haya

**K M Pradhyut** | AI for Media, Content & Digital Experiences  
AWS Hackathon 2026 — AI for Bharat Track

---

*Made with ❤️ for Digital Bharat 🇮🇳*
