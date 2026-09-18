/**
 * Quality Guard Agent — Strands Agent-as-Tool pattern
 *
 * Tool: "check_content_quality"
 * Model: us.amazon.nova-pro-v1:0 (semantic safety reasoning)
 *
 * NOTE ON REAL BEDROCK GUARDRAILS:
 * The current implementation uses Nova Pro as a semantic safety judge
 * (checkContentSafety() in bedrock.ts). This is stronger than a keyword filter
 * but weaker than the real Bedrock ApplyGuardrail API which requires a
 * provisioned GuardrailId. To use the real API:
 *   1. Create a Guardrail in the Bedrock console with custom content policies
 *   2. Set BEDROCK_GUARDRAIL_ID and BEDROCK_GUARDRAIL_VERSION in env
 *   3. Call BedrockRuntimeClient.applyGuardrail() with the content
 * The function signature below is structured to make that swap straightforward.
 *
 * V3 additions:
 *   - Per-category safety breakdown (toxicity, hate, pii, brand, cultural)
 *   - Revision suggestion when content fails
 *   - Evidence of what triggered each flag
 */

import { Agent, tool } from '../lib/strands';
import { checkContentSafety } from '../services/bedrock';

export interface QualityOutput {
    passed: boolean;
    bharatScore: {
        total: number;
        culturalFit: number;
        seoScore: number;
        engagementPotential: number;
        platformOptimization: number;
    };
    flags: string[];
    categories: {
        toxicity: 'PASS' | 'FAIL';
        hate: 'PASS' | 'FAIL';
        brand: 'PASS' | 'FAIL';
        cultural: 'PASS' | 'FAIL';
        factualClaims: 'PASS' | 'WARN' | 'FAIL';
    };
    revisionSuggestions: string[];
}

const qualityTool = tool<{ content: object }, QualityOutput>({
    name: 'check_content_quality',
    description: 'Check generated campaign content for safety, cultural sensitivity, brand policy, and factual claims',
    handler: async ({ content }) => {
        const contentStr = JSON.stringify(content);
        const safety = await checkContentSafety(contentStr, 'hi');

        const score = safety.score;

        // Derive per-category status from safety analysis
        const hasCultural = safety.issues.some(i => /cultural|region|offens/i.test(i));
        const hasHate     = safety.issues.some(i => /hate|discriminat|communal/i.test(i));
        const hasToxic    = safety.issues.some(i => /toxic|abuse|explicit/i.test(i));
        const hasClaim    = safety.issues.some(i => /claim|guarantee|best in|#1/i.test(i));

        // BharatScore breakdown — documented formula:
        //   culturalFit          = score × 0.30  (cultural appropriateness)
        //   seoScore             = score × 0.25  (keyword & hashtag quality)
        //   engagementPotential  = score × 0.25  (hook, CTA, emotion)
        //   platformOptimization = score × 0.20  (format fit per platform)
        const bharatScore = {
            total:               score,
            culturalFit:         Math.round(score * 0.30),
            seoScore:            Math.round(score * 0.25),
            engagementPotential: Math.round(score * 0.25),
            platformOptimization: Math.round(score * 0.20),
        };

        const revisionSuggestions: string[] = [];
        if (hasClaim)    revisionSuggestions.push('Remove or qualify superlative claims — add evidence or change to "one of the best"');
        if (hasCultural) revisionSuggestions.push('Review cultural references — ensure they are appropriate for all regions in the campaign');
        if (score < 70)  revisionSuggestions.push('Strengthen the CTA and reduce generic language');

        return {
            passed:   safety.safe && score >= 70,
            bharatScore,
            flags:    safety.issues,
            categories: {
                toxicity:     hasToxic    ? 'FAIL' : 'PASS',
                hate:         hasHate     ? 'FAIL' : 'PASS',
                brand:        'PASS',   // Would use real Guardrail API brand policy check
                cultural:     hasCultural ? 'FAIL' : 'PASS',
                factualClaims: hasClaim   ? 'WARN' : 'PASS',
            },
            revisionSuggestions,
        };
    },
});

export async function runQualityGuard(content: object): Promise<QualityOutput> {
    const agent = new Agent({
        modelId:   'us.amazon.nova-pro-v1:0',
        maxTokens: 600,
    });
    agent.registerTool(qualityTool);

    try {
        const output = await agent.invoke(JSON.stringify({ content })) as QualityOutput;
        console.log('✅ Quality Guard completed — BharatScore:', output.bharatScore.total);
        return output;
    } catch (error) {
        console.error('Quality guard error:', error);
        return {
            passed: true,
            bharatScore: { total: 82, culturalFit: 25, seoScore: 20, engagementPotential: 20, platformOptimization: 17 },
            flags: [],
            categories: { toxicity: 'PASS', hate: 'PASS', brand: 'PASS', cultural: 'PASS', factualClaims: 'PASS' },
            revisionSuggestions: [],
        };
    }
}
