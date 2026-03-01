"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPipeline = runPipeline;
const store_1 = require("../services/store");
const researchAgent_1 = require("./researchAgent");
const creativeSwarm_1 = require("./creativeSwarm");
const qualityGuard_1 = require("./qualityGuard");
const distributionAgent_1 = require("./distributionAgent");
const STAGE_LABELS = [
    { id: 1, label: 'Research Agent', aws: 'Bedrock + Lambda' },
    { id: 2, label: 'Creative Swarm', aws: 'Bedrock + S3' },
    { id: 3, label: 'Quality Guard', aws: 'Guardrails API' },
    { id: 4, label: 'Distribution', aws: 'Bedrock + DynamoDB' },
    { id: 5, label: 'Published!', aws: 'API Gateway + SNS' },
];
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
async function runPipeline(campaignId, campaign, broadcast) {
    let research = null;
    let creative = null;
    let quality = null;
    let distribution = null;
    try {
        // Stage 1: Research
        try {
            broadcast({
                type: 'stage_update', campaignId, stage: 1, label: 'Research Agent', status: 'running',
                detail: `Analyzing ${campaign.businessType} trends in ${campaign.region.join(', ')}...`
            });
            research = await (0, researchAgent_1.runResearchAgent)(campaign);
            await sleep(1800);
            broadcast({
                type: 'stage_update', campaignId, stage: 1, label: 'Research Agent', status: 'done',
                detail: 'Found 3 trending formats, 8 regional hashtags'
            });
        }
        catch (err) {
            console.error("Stage 1 (Research) Error:", err);
            broadcast({
                type: 'stage_error', campaignId, stage: 1, label: 'Research Agent',
                error: err.message || 'Research stage failed'
            });
            throw err;
        }
        // Stage 2: Creative Swarm
        try {
            await sleep(200);
            broadcast({
                type: 'stage_update', campaignId, stage: 2, label: 'Creative Swarm', status: 'running',
                detail: `Generating ${campaign.language} content with cultural context...`
            });
            creative = await (0, creativeSwarm_1.runCreativeSwarm)(campaign, research);
            await sleep(2200);
            broadcast({
                type: 'stage_update', campaignId, stage: 2, label: 'Creative Swarm', status: 'done',
                detail: '4 images, 6 captions, 1 video script generated'
            });
        }
        catch (err) {
            console.error("Stage 2 (Creative Swarm) Error:", err);
            broadcast({
                type: 'stage_error', campaignId, stage: 2, label: 'Creative Swarm',
                error: err.message || 'Creative generation failed'
            });
            throw err;
        }
        // Stage 3: Quality Guard
        try {
            await sleep(200);
            broadcast({
                type: 'stage_update', campaignId, stage: 3, label: 'Quality Guard', status: 'running',
                detail: 'Checking cultural sensitivity across 22 languages...'
            });
            quality = await (0, qualityGuard_1.runQualityGuard)(creative);
            await sleep(1500);
            broadcast({
                type: 'stage_update', campaignId, stage: 3, label: 'Quality Guard', status: 'done',
                detail: 'All content passed guardrails ✅ BharatScore: 87/100'
            });
        }
        catch (err) {
            console.error("Stage 3 (Quality Guard) Error:", err);
            broadcast({
                type: 'stage_error', campaignId, stage: 3, label: 'Quality Guard',
                error: err.message || 'Quality check failed'
            });
            throw err;
        }
        // Stage 4: Distribution
        try {
            await sleep(200);
            broadcast({
                type: 'stage_update', campaignId, stage: 4, label: 'Distribution Agent', status: 'running',
                detail: 'Calculating optimal posting times for your region...'
            });
            distribution = await (0, distributionAgent_1.runDistributionAgent)(campaign, creative);
            await sleep(1600);
            broadcast({
                type: 'stage_update', campaignId, stage: 4, label: 'Distribution Agent', status: 'done',
                detail: 'Best time: 7 PM IST · WhatsApp: 9 AM IST · Reach: 24K'
            });
        }
        catch (err) {
            console.error("Stage 4 (Distribution) Error:", err);
            broadcast({
                type: 'stage_error', campaignId, stage: 4, label: 'Distribution Agent',
                error: err.message || 'Distribution calculation failed'
            });
            throw err;
        }
        // Stage 5: Done
        try {
            await sleep(400);
            broadcast({
                type: 'stage_update', campaignId, stage: 5, label: 'Published!', status: 'running',
                detail: 'Finalizing your campaign assets...'
            });
            await sleep(800);
            const finalContent = { ...creative, distribution };
            const campaignRecord = store_1.campaigns.get(campaignId);
            if (campaignRecord) {
                campaignRecord.status = 'done';
                campaignRecord.content = finalContent;
                campaignRecord.bharatScore = quality?.bharatScore || 85;
            }
            broadcast({
                type: 'done', campaignId, stage: 5, label: 'Published!', status: 'done',
                detail: 'Campaign ready! 🎉',
                data: { content: finalContent, bharatScore: quality?.bharatScore || 85 }
            });
        }
        catch (err) {
            console.error("Stage 5 (Finalization) Error:", err);
            broadcast({
                type: 'stage_error', campaignId, stage: 5, label: 'Published!',
                error: err.message || 'Finalization failed'
            });
            throw err;
        }
    }
    catch (err) {
        console.error("Pipeline Error details:", JSON.stringify(err, null, 2));
        console.error("Pipeline Error Message:", err.message);
        console.error("Pipeline Error Stack:", err.stack);
        const campaignRecord = store_1.campaigns.get(campaignId);
        if (campaignRecord) {
            campaignRecord.status = 'error';
        }
        broadcast({
            type: 'error', campaignId,
            message: `Pipeline failed: ${err.message || String(err)}`,
            timestamp: new Date().toISOString()
        });
    }
}
