# BharatMedia — Capabilities Reference

> **Transparency document for judges and contributors.**
> This file maps every claimed feature to its actual implementation status.

---

## ✅ Fully Functional (Real AWS Calls)

| Feature | AWS Service | Endpoint |
|---------|-------------|----------|
| AI Research Agent | Amazon Bedrock Nova Pro | `POST /api/campaign/create` |
| Multilingual Caption Generation | Amazon Bedrock Nova Lite | `POST /api/campaign/create` |
| AI Video **Script** Generation | Amazon Bedrock Nova Lite | `POST /api/campaign/create` |
| Voice transcription (mic input) | Amazon Transcribe Streaming, 10 Indian languages | `POST /api/campaign/create` |
| Quality Guard + BharatScore | Amazon Bedrock Nova Pro | `POST /api/campaign/create` |
| Titan Image Generation → S3 | Amazon Titan Image Generator v1 | `POST /api/generate-image` |
| Text-to-Speech (10 languages) | Amazon Polly | `POST /api/voice/synthesize` |
| Caption Translation (9 languages) | Amazon Translate | `POST /api/translate` |
| Sentiment + Key Phrase Analysis | Amazon Comprehend | `POST /api/analyze` |
| Image Content Moderation | Amazon Rekognition | `POST /api/image/moderate` |
| Campaign + User Persistence | Amazon DynamoDB | All campaign routes |
| Agent Trace (per-step logging) | Amazon DynamoDB | `GET /api/campaign/:id/trace` |
| A/B Language Experiment Engine | Amazon Bedrock + DynamoDB | Auto-created per campaign |
| Learning Loop Memory | Amazon DynamoDB | Seeds next campaign's research |
| Persona Swarm (20 Indian personas) | Amazon Bedrock Nova Lite | `POST /api/campaign/:id/persona-review` |
| Real-time Pipeline Status | WebSocket + SSE fallback | `ws://…/ws?campaignId=…` |
| JWT Auth + Rate Limiting | Express + bcrypt | `POST /api/auth/*` |

---

## 🔶 Demo Mode (Clearly Labelled)

| Feature | Status | What's Real | What's Demo | Production Path |
|---------|--------|-------------|-------------|-----------------|
| Video File Rendering | v2 Roadmap | 15-sec video script ✅ | No `.mp4` file generated | Nova Reel `StartAsyncInvoke` + S3 polling |
| Social Media Publishing | Demo | Saves publish record to DynamoDB | No platform OAuth call | Facebook/Instagram Graph API, WhatsApp Business API |
| Market Pulse Signals | Demo (labelled) | API returns `source: "SIMULATED"` | Static trend data | Social listening provider (Brandwatch, Talkwalker) |

---

## 🏗️ Architecture Patterns

| Pattern | Implementation | File |
|---------|---------------|------|
| Agent-as-Tool (Strands SDK structure) | Custom Strands-compatible wrapper | `backend/src/lib/strands.ts` |
| Circuit Breaker (Luna-Lupa inspired) | Opens after 3 Bedrock failures, resets after 30s | `backend/src/lib/strands.ts` |
| Retry-Failed-Only (CaseGraph inspired) | Only Creative retries on failure — Research preserved | `backend/src/agents/pipeline.ts` |
| Parallel Stage Execution | `Promise.all(creative, quality-precheck)` | `backend/src/agents/pipeline.ts` |
| Timeout Resilience | `withTimeout()` wraps every Bedrock call | `backend/src/agents/pipeline.ts` |
| Content Integrity | SHA-256 fingerprint stored with campaign | `backend/src/services/v3store.ts` |
| Audit Log | Last 50 agent trace steps across all campaigns | `GET /api/audit` |
| Emergency Stop | Sets campaign to `aborted` + broadcasts | `POST /api/campaign/:id/abort` |

---

## 📊 AWS Services Count

| # | Service | Used For |
|---|---------|----------|
| 1 | Amazon Bedrock (Nova Pro) | Research, quality guard, distribution copy |
| 2 | Amazon Bedrock (Nova Lite) | Creative captions, video scripts, bilingual variants |
| 3 | Amazon Titan Image Generator | Campaign image generation |
| 4 | Amazon DynamoDB | All persistent storage |
| 5 | Amazon S3 | Generated images, Polly audio, brain documents |
| 6 | Amazon Polly | Text-to-speech (10 Indian languages) |
| 7 | Amazon Translate | Caption translation (9 Indian languages) |
| 8 | Amazon Comprehend | Sentiment + key phrase analysis |
| 9 | Amazon Rekognition | Image content moderation |

**Total: 9 AWS services with real API calls.**

---

## 🚀 v2 Upgrade Roadmap

1. **Amazon Transcribe Streaming** — replace demo voice transcription
2. **Nova Reel `StartAsyncInvoke`** — actual 15-second video file generation
3. **Instagram Graph API + WhatsApp Business API** — real cross-platform publishing
4. **Amazon Bedrock Guardrails** (provisioned) — replace Nova Pro semantic check
5. **Nova Sonic streaming** — real-time voice interaction mode

---

*Last updated: September 2026 | BharatMedia v3.1.0 | AI for Bharat Hackathon 2026*
