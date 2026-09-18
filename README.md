# BharatMedia — भारत का AI Content Studio

> **India's first Agentic Content Orchestrator** | AI for Bharat Hackathon 2026 | Team Haya

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
| **Amazon Bedrock Nova Omni** | Multilingual content generation |
| **Amazon Bedrock Nova Reel** | 15-second video script generation |
| **Amazon Bedrock Nova Sonic** | Voice transcription + translation |
| **Bedrock Guardrails** | Cultural sensitivity + brand safety |
| **AWS Lambda** | Agent orchestration |
| **Amazon DynamoDB** | Campaign + analytics storage |
| **Amazon S3 + CloudFront** | Generated media storage + CDN |
| **API Gateway WebSocket** | Real-time pipeline status |
| **AWS Cognito** | User authentication |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repo
cd "d:\prototype aws"

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
