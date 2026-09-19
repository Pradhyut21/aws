/**
 * BharatMedia — BharatPersonaSwarm Agent
 *
 * Runs 20 diverse Indian demographic personas in PARALLEL against a campaign,
 * then synthesises scores via Validator + Finalizer agents.
 *
 * Inspired by: aws-samples/sample-agentic-genai-agentcore
 *   (Persona Reviewer → Validator → Finalizer pattern)
 *
 * Adapated for Indian market:
 *   - 20 Indian personas (vs 40 in AWS sample — Nova Lite cost stays ~$0.001)
 *   - Prompts localised: state, language, income, festival sensitivity
 *   - Uses existing Nova Lite (persona calls) + Nova Pro (validator + finalizer)
 *   - All results saved to DynamoDB via personaStore
 *
 * Cost estimate per full review (~22 Bedrock calls):
 *   - 20x Nova Lite: ~$0.0006  (persona reviews)
 *   - 1x Nova Pro:   ~$0.0008  (validator)
 *   - 1x Nova Pro:   ~$0.001   (finalizer)
 *   Total: ~$0.002 per campaign
 */

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import {
    getPersonas,
    savePersonaReview,
    BharatResonanceScore,
    PersonaReviewResult,
    IndianPersona,
} from '../services/personaStore';

const bedrockClient = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || 'us-east-1',
});

const NOVA_LITE = 'us.amazon.nova-lite-v1:0';
const NOVA_PRO = 'us.amazon.nova-pro-v1:0';

// ─── CORE BEDROCK HELPER ──────────────────────────────────────────────────────

async function callBedrock(modelId: string, prompt: string, maxTokens = 400): Promise<string> {
    try {
        const cmd = new InvokeModelCommand({
            modelId,
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify({
                schemaVersion: 'messages-v1',
                messages: [{ role: 'user', content: [{ text: prompt }] }],
                inferenceConfig: { maxTokens, temperature: 0.7 },
            }),
        });
        const res = await bedrockClient.send(cmd);
        const body = JSON.parse(new TextDecoder().decode(res.body));
        return body.output.message.content[0].text as string;
    } catch (err: any) {
        throw new Error(`Bedrock call failed for ${modelId}: ${err.message}`);
    }
}

// ─── PERSONA REVIEWER (runs in parallel for each persona) ────────────────────

async function reviewAsPersona(
    persona: IndianPersona,
    campaignContent: string
): Promise<PersonaReviewResult> {
    const prompt = `${persona.systemPrompt}

You are reviewing the following marketing campaign:
---
${campaignContent.slice(0, 1200)}
---

As ${persona.name} (${persona.age}yo, ${persona.state}, ${persona.language} speaker, ${persona.occupation}):

Respond ONLY with valid JSON in this exact format:
{
  "resonanceScore": <integer 0-100>,
  "verdict": "<PASS|FLAG|HIGH_RISK>",
  "feedback": "<one honest sentence about whether this campaign resonates with you>",
  "suggestedTweak": "<optional: one specific change that would help reach you better>"
}

Scoring guide:
- 75-100: This campaign speaks directly to me. PASS.
- 40-74: I notice it but something feels off or irrelevant. FLAG.
- 0-39: This campaign ignores or alienates people like me. HIGH_RISK.`;

    try {
        const raw = await callBedrock(NOVA_LITE, prompt, 250);
        // Extract JSON from the response
        let jsonStr = raw.trim();
        if (jsonStr.includes('```json'))
            jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
        else if (jsonStr.includes('```')) jsonStr = jsonStr.split('```')[1].split('```')[0].trim();

        const parsed = JSON.parse(jsonStr);
        return {
            personaId: persona.personaId,
            name: persona.name,
            resonanceScore: Math.min(100, Math.max(0, Number(parsed.resonanceScore) || 50)),
            verdict: ['PASS', 'FLAG', 'HIGH_RISK'].includes(parsed.verdict)
                ? parsed.verdict
                : 'FLAG',
            feedback: String(parsed.feedback || 'No feedback provided').slice(0, 300),
            suggestedTweak: parsed.suggestedTweak
                ? String(parsed.suggestedTweak).slice(0, 200)
                : undefined,
        };
    } catch {
        // Graceful fallback if parsing fails
        return {
            personaId: persona.personaId,
            name: persona.name,
            resonanceScore: 60,
            verdict: 'FLAG',
            feedback: 'Review could not be parsed. Treated as FLAG.',
        };
    }
}

// ─── VALIDATOR AGENT (Nova Pro) ───────────────────────────────────────────────

async function runValidatorAgent(
    personaResults: PersonaReviewResult[],
    campaignContent: string
): Promise<string[]> {
    const lowScores = personaResults.filter(r => r.resonanceScore < 50);
    const highRisks = personaResults.filter(r => r.verdict === 'HIGH_RISK');

    const prompt = `You are a cultural compliance validator for Indian marketing campaigns.

Campaign content:
---
${campaignContent.slice(0, 800)}
---

Persona review summary:
- ${personaResults.length} personas reviewed
- ${personaResults.filter(r => r.verdict === 'PASS').length} PASS, ${personaResults.filter(r => r.verdict === 'FLAG').length} FLAG, ${highRisks.length} HIGH_RISK
- Lowest scoring personas: ${lowScores
        .slice(0, 3)
        .map(r => `${r.name} (${r.resonanceScore}/100): "${r.feedback}"`)
        .join(' | ')}
${highRisks.length > 0 ? `- HIGH RISK flags: ${highRisks.map(r => r.feedback).join(' | ')}` : ''}

Identify any LEGAL, CULTURAL or BRAND SAFETY violations in this Indian campaign.
Focus on: religious sensitivity, caste allusions, gender stereotyping, misleading health claims, price deception.

Respond with a JSON array of flag strings (empty array if all clear):
["flag 1", "flag 2", ...]

Maximum 5 flags. Be specific and actionable.`;

    try {
        const raw = await callBedrock(NOVA_PRO, prompt, 300);
        let jsonStr = raw.trim();
        if (jsonStr.includes('```json'))
            jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
        else if (jsonStr.includes('```')) jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
        const parsed = JSON.parse(jsonStr);
        return Array.isArray(parsed) ? parsed.slice(0, 5).map(String) : [];
    } catch {
        return [];
    }
}

// ─── FINALIZER AGENT (Nova Pro) ───────────────────────────────────────────────

async function runFinalizerAgent(
    personaResults: PersonaReviewResult[],
    validatorFlags: string[],
    campaignContent: string
): Promise<string> {
    const avgScore = Math.round(
        personaResults.reduce((s, r) => s + r.resonanceScore, 0) / personaResults.length
    );
    const topPersonas = [...personaResults]
        .sort((a, b) => b.resonanceScore - a.resonanceScore)
        .slice(0, 3);
    const lowPersonas = [...personaResults]
        .sort((a, b) => a.resonanceScore - b.resonanceScore)
        .slice(0, 3);

    const prompt = `You are the BharatMedia campaign strategy finalizer.

Campaign snippet: "${campaignContent.slice(0, 400)}"

Overall resonance: ${avgScore}/100 across ${personaResults.length} Indian personas

STRONGEST resonance:
${topPersonas.map(r => `• ${r.name} (${r.resonanceScore}/100): "${r.feedback}"`).join('\n')}

WEAKEST resonance:
${lowPersonas.map(r => `• ${r.name} (${r.resonanceScore}/100): "${r.feedback}"`).join('\n')}

Compliance flags: ${validatorFlags.length > 0 ? validatorFlags.join('; ') : 'None'}

Write a 2-3 sentence strategic recommendation for the brand:
1. Which audience segments this campaign serves well
2. Which segments need a separate variant
3. One highest-impact fix to improve overall score

Be specific — name the states/languages/demographics. Respond in 3 sentences max.`;

    try {
        return await callBedrock(NOVA_PRO, prompt, 200);
    } catch {
        return `Campaign scores ${avgScore}/100 across Indian personas. Consider adapting for lower-scoring regional segments. Review cultural flags before publishing.`;
    }
}

// ─── MAIN ORCHESTRATOR ────────────────────────────────────────────────────────

export interface PersonaSwarmInput {
    campaignId: string;
    campaignContent: string; // the campaign text to review
    targetPersonaIds?: string[]; // optional: run only specific personas (default: all 20)
}

/**
 * runPersonaSwarm
 *
 * Main entry point. Runs all persona reviews in parallel (Promise.all),
 * then sequentially runs Validator + Finalizer agents.
 *
 * aws-samples/sample-agentic-genai-agentcore pattern:
 *   PersonaReviewer (parallel) → Validator → Finalizer
 */
export async function runPersonaSwarm(input: PersonaSwarmInput): Promise<BharatResonanceScore> {
    const { campaignId, campaignContent, targetPersonaIds } = input;
    const startTime = Date.now();

    console.log(`[PersonaSwarm] Starting review for campaign ${campaignId}`);

    // 1. Load personas from DynamoDB (or in-memory fallback)
    let personas = await getPersonas();
    if (targetPersonaIds && targetPersonaIds.length > 0) {
        personas = personas.filter(p => targetPersonaIds.includes(p.personaId));
    }
    console.log(`[PersonaSwarm] Running ${personas.length} personas in parallel via Nova Lite`);

    // 2. PARALLEL persona reviews (CaseGraph + aws-samples pattern: Promise.all)
    const personaResults = await Promise.all(
        personas.map(persona => reviewAsPersona(persona, campaignContent))
    );
    console.log(`[PersonaSwarm] ${personaResults.length} persona reviews complete`);

    // 3. Validator Agent (Nova Pro — sequential, depends on all persona results)
    const validatorFlags = await runValidatorAgent(personaResults, campaignContent);

    // 4. Finalizer Agent (Nova Pro — sequential, depends on validator)
    const recommendation = await runFinalizerAgent(personaResults, validatorFlags, campaignContent);

    // 5. Aggregate BharatResonanceScore
    const overallResonance = Math.round(
        personaResults.reduce((s, r) => s + r.resonanceScore, 0) / personaResults.length
    );
    const passCount = personaResults.filter(r => r.verdict === 'PASS').length;
    const flagCount = personaResults.filter(r => r.verdict === 'FLAG').length;
    const highRiskCount = personaResults.filter(r => r.verdict === 'HIGH_RISK').length;

    const result: BharatResonanceScore = {
        campaignId,
        overallResonance,
        passCount,
        flagCount,
        highRiskCount,
        personaResults,
        validatorFlags,
        recommendation,
        createdAt: new Date().toISOString(),
        latencyMs: Date.now() - startTime,
    };

    // 6. Persist to DynamoDB
    await savePersonaReview(result);
    console.log(`[PersonaSwarm] Done — ${overallResonance}/100 in ${result.latencyMs}ms`);

    return result;
}
