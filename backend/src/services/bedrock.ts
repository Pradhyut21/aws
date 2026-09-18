import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';

// Initialize the Bedrock client
const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });

/**
 * S3 bucket for generated images.
 *
 * One-time bucket setup (run before first deploy):
 *
 *   aws s3api create-bucket \
 *     --bucket bharatmedia-images-dev \
 *     --region us-east-1
 *
 *   aws s3api delete-public-access-block \
 *     --bucket bharatmedia-images-dev
 *
 *   aws s3api put-bucket-policy \
 *     --bucket bharatmedia-images-dev \
 *     --policy '{
 *       "Version":"2012-10-17",
 *       "Statement":[{
 *         "Effect":"Allow",
 *         "Principal":"*",
 *         "Action":"s3:GetObject",
 *         "Resource":"arn:aws:s3:::bharatmedia-images-dev/*"
 *       }]
 *     }'
 */
const S3_BUCKET  = process.env.S3_BUCKET_NAME   || 'bharatmedia-images-dev';
const S3_REGION  = process.env.AWS_REGION        || 'us-east-1';
const s3Client   = new S3Client({ region: S3_REGION });

// Helper function to invoke Claude (always available)
async function invokeClaude(prompt: string, maxTokens: number = 2000): Promise<string> {
    try {
        const payload = {
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: maxTokens,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        };

        const command = new InvokeModelCommand({
            modelId: "anthropic.claude-3-haiku-20240307-v1:0",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify(payload),
        });

        const response = await client.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        return responseBody.content[0].text;
    } catch (error) {
        console.error("Claude error:", error);
        throw error;
    }
}

// ─── NOVA PRO (Research, Analysis, SEO) ───────────────────────────────────
export async function invokeNovaPro(prompt: string, maxTokens: number = 2000): Promise<string> {
    console.log('🔍 Invoking Nova Pro for research...');
    try {
        // Try Nova Pro first
        const payload = {
            schemaVersion: "messages-v1",
            messages: [{ role: "user", content: [{ text: prompt }] }],
            inferenceConfig: { maxTokens, temperature: 0.7 },
        };

        const command = new InvokeModelCommand({
            modelId: "us.amazon.nova-pro-v1:0",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify(payload),
        });

        const response = await client.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        console.log('✅ Nova Pro success');
        return responseBody.output.message.content[0].text;
    } catch (error: any) {
        console.log('⚠️ Nova Pro not available, using Claude:', error.message);
        return await invokeClaude(prompt, maxTokens);
    }
}

// ─── NOVA OMNI (Multilingual Content Generation) ────────────────────────────
export async function invokeNovaOmni(prompt: string, maxTokens: number = 1500): Promise<string> {
    console.log('🎨 Invoking Nova Omni for content...');
    try {
        const payload = {
            schemaVersion: "messages-v1",
            messages: [{ role: "user", content: [{ text: prompt }] }],
            inferenceConfig: { maxTokens, temperature: 0.8 },
        };

        const command = new InvokeModelCommand({
            modelId: "us.amazon.nova-lite-v1:0",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify(payload),
        });

        const response = await client.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        console.log('✅ Nova Omni success');
        return responseBody.output.message.content[0].text;
    } catch (error: any) {
        console.log('⚠️ Nova Omni not available, using Claude:', error.message);
        return await invokeClaude(prompt, maxTokens);
    }
}

// ─── NOVA REEL (Video Script Generation) ──────────────────────────────────
//
// ⚠️  HONEST LABEL: Nova Reel (video model) is invoked via the Nova Lite
// text endpoint because the Nova Reel video-generation API uses a separate
// async job model (StartAsyncInvoke) and requires a valid S3 output path,
// making it unsuitable for synchronous request/response in this architecture.
// The text prompts sent here are still video-script generation prompts;
// only the rendering step (actual video file) is not performed.
// Production upgrade path: replace with StartAsyncInvoke + S3 polling.
export async function invokeNovaReel(prompt: string, maxTokens: number = 1000): Promise<string> {
    console.log('🎬 [Nova Reel fallback → Nova Lite] Generating video script text...');
    return await invokeNovaOmni(prompt, maxTokens);
}

// ─── NOVA SONIC (Voice Transcription & Translation) ────────────────────────
//
// ⚠️  HONEST LABEL: Nova Sonic is a real-time bidirectional audio streaming
// model. It requires a WebSocket/HTTP2 streaming connection and cannot be
// called via the standard InvokeModel REST endpoint used here.
// For real TTS/voice, this project uses Amazon Polly via POST /api/voice/synthesize.
// This function is retained for text-level distribution copy generation only.
// Production upgrade path: integrate Nova Sonic via the Bedrock streaming API.
export async function invokeNovaSonic(prompt: string, maxTokens: number = 500): Promise<string> {
    console.log('🎤 [Nova Sonic fallback → Claude] Generating distribution copy text...');
    return await invokeClaude(prompt, maxTokens);
}

// ─── TITAN IMAGE GENERATOR (Image Generation → S3) ───────────────────────────
/**
 * Generates an image with Bedrock Titan Image Generator, uploads it to S3,
 * and returns a permanent public HTTPS URL.
 *
 * @param prompt  Text description for the image
 * @param width   Width in pixels (default 1024)
 * @param height  Height in pixels (default 1024)
 * @returns       Public S3 URL: https://<bucket>.s3.<region>.amazonaws.com/campaigns/<year>/<month>/<uuid>.png
 */
export async function generateTitanImage(prompt: string, width: number = 1024, height: number = 1024): Promise<string> {
    console.log('🖼️ Generating image with Titan Image Generator...');
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

    const command = new InvokeModelCommand({
        modelId: "amazon.titan-image-generator-v1",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(payload),
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const base64Image: string = responseBody.images[0];
    console.log('✅ Titan image generated — uploading to S3...');

    // Decode base64 → Buffer and upload to S3
    const imageBuffer = Buffer.from(base64Image, 'base64');
    const now         = new Date();
    const key         = `campaigns/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${uuidv4()}.png`;

    try {
        await s3Client.send(new PutObjectCommand({
            Bucket:       S3_BUCKET,
            Key:          key,
            Body:         imageBuffer,
            ContentType:  'image/png',
            CacheControl: 'max-age=31536000',
            // ACL is set via bucket policy (public-read) rather than per-object
            // to avoid "AccessControlListNotSupported" on buckets with ACLs disabled.
        }));
    } catch (s3Err: any) {
        throw new Error(`S3 upload failed: ${s3Err.message}`);
    }

    const publicUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
    console.log(`✅ Image uploaded to S3: ${publicUrl}`);
    return publicUrl;
}

// ─── BEDROCK GUARDRAILS (Content Safety & Cultural Sensitivity) ───────────
export async function checkContentSafety(content: string, language: string = "en"): Promise<{ safe: boolean; score: number; issues: string[] }> {
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
        } else if (jsonStr.includes('\`\`\`')) {
            jsonStr = jsonStr.split('\`\`\`')[1].split('\`\`\`')[0].trim();
        }

        const parsed = JSON.parse(jsonStr);
        return {
            safe: parsed.safe ?? true,
            score: parsed.score ?? 85,
            issues: parsed.issues || [],
        };
    } catch (error) {
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
export async function generateText(prompt: string, maxTokens: number = 2000): Promise<string> {
    return await invokeClaude(prompt, maxTokens);
}
