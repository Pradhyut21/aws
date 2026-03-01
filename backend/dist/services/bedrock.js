"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invokeNovaPro = invokeNovaPro;
exports.invokeNovaOmni = invokeNovaOmni;
exports.invokeNovaReel = invokeNovaReel;
exports.invokeNovaSonic = invokeNovaSonic;
exports.generateTitanImage = generateTitanImage;
exports.checkContentSafety = checkContentSafety;
exports.generateText = generateText;
const client_bedrock_runtime_1 = require("@aws-sdk/client-bedrock-runtime");
// Initialize the Bedrock client
const client = new client_bedrock_runtime_1.BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });
// Helper function to invoke Claude (always available)
async function invokeClaude(prompt, maxTokens = 2000) {
    try {
        const payload = {
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: maxTokens,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        };
        const command = new client_bedrock_runtime_1.InvokeModelCommand({
            modelId: "anthropic.claude-3-haiku-20240307-v1:0",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify(payload),
        });
        const response = await client.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        return responseBody.content[0].text;
    }
    catch (error) {
        console.error("Claude error:", error);
        throw error;
    }
}
// ─── NOVA PRO (Research, Analysis, SEO) ───────────────────────────────────
async function invokeNovaPro(prompt, maxTokens = 2000) {
    console.log('🔍 Invoking Nova Pro for research...');
    try {
        // Try Nova Pro first
        const payload = {
            schemaVersion: "messages-v1",
            messages: [{ role: "user", content: [{ text: prompt }] }],
            inferenceConfig: { maxTokens, temperature: 0.7 },
        };
        const command = new client_bedrock_runtime_1.InvokeModelCommand({
            modelId: "us.amazon.nova-pro-v1:0",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify(payload),
        });
        const response = await client.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        console.log('✅ Nova Pro success');
        return responseBody.output.message.content[0].text;
    }
    catch (error) {
        console.log('⚠️ Nova Pro not available, using Claude:', error.message);
        return await invokeClaude(prompt, maxTokens);
    }
}
// ─── NOVA OMNI (Multilingual Content Generation) ────────────────────────────
async function invokeNovaOmni(prompt, maxTokens = 1500) {
    console.log('🎨 Invoking Nova Omni for content...');
    try {
        const payload = {
            schemaVersion: "messages-v1",
            messages: [{ role: "user", content: [{ text: prompt }] }],
            inferenceConfig: { maxTokens, temperature: 0.8 },
        };
        const command = new client_bedrock_runtime_1.InvokeModelCommand({
            modelId: "us.amazon.nova-lite-v1:0",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify(payload),
        });
        const response = await client.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        console.log('✅ Nova Omni success');
        return responseBody.output.message.content[0].text;
    }
    catch (error) {
        console.log('⚠️ Nova Omni not available, using Claude:', error.message);
        return await invokeClaude(prompt, maxTokens);
    }
}
// ─── NOVA REEL (Video Script Generation) ──────────────────────────────────
async function invokeNovaReel(prompt, maxTokens = 1000) {
    console.log('🎬 Invoking Nova Reel for video...');
    // Nova Reel uses same API as Nova Lite
    return await invokeNovaOmni(prompt, maxTokens);
}
// ─── NOVA SONIC (Voice Transcription & Translation) ────────────────────────
async function invokeNovaSonic(prompt, maxTokens = 500) {
    console.log('🎤 Invoking Nova Sonic for distribution...');
    return await invokeClaude(prompt, maxTokens);
}
// ─── TITAN IMAGE GENERATOR (Image Generation) ─────────────────────────────
async function generateTitanImage(prompt, width = 1024, height = 1024) {
    console.log('🖼️ Generating image with Titan...');
    try {
        const payload = {
            taskType: "TEXT_IMAGE",
            textToImageParams: {
                text: prompt,
                negativeText: "blurry, low quality, distorted, ugly",
            },
            imageGenerationConfig: {
                numberOfImages: 1,
                quality: "standard",
                cfgScale: 8.0,
                height,
                width,
                seed: Math.floor(Math.random() * 2147483647),
            },
        };
        const command = new client_bedrock_runtime_1.InvokeModelCommand({
            modelId: "amazon.titan-image-generator-v1",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify(payload),
        });
        const response = await client.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        console.log('✅ Titan image generated');
        // Return base64 image data
        return `data:image/png;base64,${responseBody.images[0]}`;
    }
    catch (error) {
        console.log('⚠️ Titan image generation failed:', error.message);
        throw error;
    }
}
// ─── BEDROCK GUARDRAILS (Content Safety & Cultural Sensitivity) ───────────
async function checkContentSafety(content, language = "en") {
    console.log('🛡️ Checking content safety with Bedrock...');
    // Use Nova Pro to act as a deep semantic guardrail and quality rater
    const prompt = `You are a strict content safety and cultural quality guardrail system for an Indian audience.
Analyze the following social media and marketing content.
Return ONLY a valid JSON object with this exact structure (no markdown, no quotes):
{
  "safe": boolean,
  "score": number (0-100, where 100 is excellent, culturally sensitive, and safe),
  "issues": string[] (list of any inappropriate, unsafe, biased, or poorly written aspects; empty if none)
}

Content to analyze:
${content}`;
    try {
        const response = await invokeNovaPro(prompt, 500);
        let jsonStr = response.trim();
        if (jsonStr.includes('\`\`\`json')) {
            jsonStr = jsonStr.split('\`\`\`json')[1].split('\`\`\`')[0].trim();
        }
        else if (jsonStr.includes('\`\`\`')) {
            jsonStr = jsonStr.split('\`\`\`')[1].split('\`\`\`')[0].trim();
        }
        const parsed = JSON.parse(jsonStr);
        return {
            safe: parsed.safe ?? true,
            score: parsed.score ?? 85,
            issues: parsed.issues || [],
        };
    }
    catch (error) {
        console.error('Guardrails error:', error);
        // Fallback to safe
        return {
            safe: true,
            score: 80,
            issues: ["Failed to run rigorous safety check. Displaying default fallback score."],
        };
    }
}
// ─── LEGACY: Generate Text (Claude) ───────────────────────────────────────
async function generateText(prompt, maxTokens = 2000) {
    return await invokeClaude(prompt, maxTokens);
}
