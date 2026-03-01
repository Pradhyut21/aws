import 'dotenv/config';
import { runResearchAgent } from './src/agents/researchAgent';
import { runCreativeSwarm } from './src/agents/creativeSwarm';
import { runQualityGuard } from './src/agents/qualityGuard';
import { runDistributionAgent } from './src/agents/distributionAgent';

const dummyCampaign = {
    id: "test-campaign-123",
    businessType: "Handloom Sarees",
    region: ["Tamil Nadu", "Karnataka"],
    language: "ta",
    theme: "Festival",
    input: "New collection of Kanjeevaram sarees for upcoming festive season. 15% discount.",
    platforms: ["instagram", "whatsapp", "facebook", "youtube"],
    status: "draft" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

async function testPipeline() {
    console.log("=== BHARATMEDIA PIPELINE INTEGRATION TEST ===\\n");
    console.log("Campaign Input:", dummyCampaign.input);

    try {
        console.log("\\n[1/4] Running Research Agent (Nova Pro)...");
        const research = await runResearchAgent(dummyCampaign);
        console.log("Research Result:", JSON.stringify(research, null, 2));

        console.log("\\n[2/4] Running Creative Swarm (Nova Omni, Reel, Titan)...");
        const creative = await runCreativeSwarm(dummyCampaign, research);
        console.log("Creative Titles/Captions:", JSON.stringify(creative.captions, null, 2));

        console.log("\\n[3/4] Running Quality Guard (Nova Pro Guardrails)...");
        const quality = await runQualityGuard(creative);
        console.log("Quality Result:", JSON.stringify(quality, null, 2));

        if (!quality.passed) {
            console.log("❌ Pipeline halted: Quality check failed.");
            return;
        }

        console.log("\\n[4/4] Running Distribution Agent (Nova Sonic)...");
        const distribution = await runDistributionAgent(dummyCampaign, creative);
        console.log("Distribution Result:", JSON.stringify(distribution, null, 2));

        console.log("\\n✅ PIPELINE COMPLETED SUCCESSFULLY!");
    } catch (e) {
        console.error("\\n❌ Pipeline failed:", e);
    }
}

testPipeline();
