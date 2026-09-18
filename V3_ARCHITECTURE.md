# BharatMedia V3 — AWS Architecture

## System Overview

```
                         USER (Browser)
                              │
                    ┌─────────┴──────────┐
                    │   AWS Amplify       │
                    │  (React/Vite SPA)   │
                    │  CloudFront CDN     │
                    └─────────┬──────────┘
                              │ HTTPS / WSS
                    ┌─────────┴──────────┐
                    │  AWS App Runner     │
                    │  (Node/Express API) │
                    │  Port 4000          │
                    └────┬────────┬───────┘
                         │        │
           ┌─────────────┘        └──────────────┐
           ▼                                      ▼
  ┌────────────────┐                   ┌──────────────────┐
  │  Amazon Bedrock│                   │    Amazon S3     │
  │  ─────────────  │                  │  ────────────     │
  │  Nova Pro       │                  │  Titan images    │
  │  (Research,     │                  │  Brain docs      │
  │   Strategy,     │                  │  (per-user       │
  │   Quality)      │                  │   prefix)        │
  │  Nova Lite      │                  └──────────────────┘
  │  (Creative,     │
  │   Distribution) │
  │  Titan Image    │
  │  (Image Gen)    │
  └────────────────┘
           │
  ┌────────┴────────────────────────────────────────────┐
  │              Amazon DynamoDB                        │
  │         (Single-table: bharatmedia-dev)             │
  │                                                     │
  │  PK prefix    │ Entity                              │
  │  USER#        │ User accounts (hashed passwords)    │
  │  CAMP#        │ Campaigns (status, content, score)  │
  │  TRACE#       │ Agent trace steps per campaign      │
  │  EXP#         │ A/B experiments (variants, metrics) │
  │  LEARN#       │ Learning memory (lessons per user)  │
  │  TMPL#        │ Campaign templates                  │
  │  ANALYTICS#   │ User analytics aggregates           │
  │  BRAIN#       │ BharatBrain doc metadata            │
  └─────────────────────────────────────────────────────┘
```

## Agent Pipeline Architecture

```
POST /api/campaign/create
         │
         ▼
  createCampaign() → DynamoDB (status: processing)
         │
         ▼ (fire-and-forget)
  runPipeline()
         │
    ┌────┴────────────────────────────────────────────────┐
    │               Strands Agent Orchestrator            │
    │                                                     │
    │  Stage 1: Research Agent (Nova Pro)                 │
    │    ├── Reads LearningMemory from DynamoDB           │
    │    ├── Calls invokeNovaPro() via Bedrock            │
    │    └── Returns evidence[], hashtags[], timing       │
    │    └── → Trace saved to DynamoDB                    │
    │                                                     │
    │  Stage 2: Creative Swarm (Nova Lite + Titan)        │
    │    ├── Generates captions via invokeNovaOmni()      │
    │    ├── Generates image via Titan Image Generator    │
    │    ├── Uploads image to S3                          │
    │    └── Returns captions{}, images[] (S3 URLs)       │
    │    └── → Trace saved to DynamoDB                    │
    │                                                     │
    │  Stage 3: Quality Guard (Nova Pro)                  │
    │    ├── checkContentSafety() → Nova Pro judgment     │
    │    ├── Per-category breakdown                        │
    │    └── Returns BharatScore{}, flags[], suggestions  │
    │    └── → Trace saved to DynamoDB                    │
    │                                                     │
    │  Stage 4: Distribution Agent (Nova Lite)            │
    │    ├── invokeNovaSonic() → Nova Lite                │
    │    ├── Region-aware posting times                   │
    │    └── Model-generated estimatedReach               │
    │    └── → Trace saved to DynamoDB                    │
    │                                                     │
    │  Stage 5: Finalise                                  │
    │    ├── updateCampaign() → DynamoDB (status: done)  │
    │    ├── buildExperimentVariants() → 3 A/B variants  │
    │    ├── createExperiment() → DynamoDB               │
    │    └── extractAndSaveLesson() → DynamoDB           │
    └─────────────────────────────────────────────────────┘
         │
         ▼
  WebSocket broadcast → Browser UI (real-time updates)
```

## AWS Services Used

| Service | Purpose | Why This One |
|---|---|---|
| **Bedrock Nova Pro** | Research, quality guard | Best reasoning for complex analysis |
| **Bedrock Nova Lite** | Creative, distribution | Cost-efficient for simpler generation |
| **Bedrock Titan Image v1** | Image generation | Native AWS, no external API key |
| **DynamoDB** | All persistence | Single-table, pay-per-request, no ops |
| **S3** | Images + BharatBrain docs | Durable, cheap, presigned URLs |
| **App Runner** | Backend API hosting | Auto-scales, WebSocket support |
| **Amplify** | Frontend hosting | CI/CD from GitHub, CDN |
| **CloudFront** | CDN (via Amplify) | Edge caching, HTTPS |

## DynamoDB Single-Table Design

### Key Schema

| Entity | PK | SK | GSI |
|---|---|---|---|
| User | `USER#<id>` | `USER#<id>` | EmailIndex: `email` |
| Campaign | `CAMP#<id>` | `CAMP#<id>` | UserCampaignsIndex: `USER#<userId>` |
| AgentTrace step | `TRACE#<campaignId>` | `STEP#<ts>#<tool>` | — |
| Experiment | `EXP#<id>` | `EXP#<id>` | UserCampaignsIndex: `USER#<userId>` |
| Lesson | `LEARN#<userId>` | `LESSON#<ts>#<id>` | — |
| Template | `TMPL#<id>` | `TMPL#<id>` | PublicTemplatesIndex |
| Analytics | `ANALYTICS#<userId>` | `ANALYTICS#<userId>` | — |
| BrainDoc | `BRAIN#<userId>` | `DOC#<id>` | — |

### Why Single-Table?
- ✅ One IAM resource ARN in the App Runner policy
- ✅ Pay-per-request — free tier covers hackathon usage
- ✅ No cross-table JOINs — all related data in one request
- ⚠️ All query patterns must be designed upfront (no ad-hoc)

## Cost Estimate Per Campaign

| Step | Service | Cost |
|---|---|---|
| Research Agent | Nova Pro 1000 tokens | ~₹0.08 |
| Creative Swarm | Nova Lite 1500 tokens | ~₹0.04 |
| Image Generation | Titan Image 1024×1024 | ~₹0.12 |
| Quality Guard | Nova Pro 600 tokens | ~₹0.05 |
| Distribution Agent | Nova Lite 600 tokens | ~₹0.01 |
| DynamoDB reads/writes | ~15 operations | ~₹0.001 |
| S3 PUT (image) | 1 PUT + 1 MB storage | ~₹0.003 |
| **TOTAL** | | **~₹0.30 per campaign** |

*Estimate based on us-east-1 pricing at INR 83/USD. Actual costs depend on token counts.*
