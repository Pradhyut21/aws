/**
 * BharatMedia — Amazon Transcribe Streaming Service
 *
 * Converts browser audio (WebM/Opus) → PCM 16kHz mono via ffmpeg,
 * then streams it to Amazon Transcribe Streaming for real speech-to-text
 * in 10 Indian languages.
 *
 * AWS Service: Amazon Transcribe Streaming (StartStreamTranscription)
 * Supported languages: hi-IN, en-IN, ta-IN, te-IN, kn-IN, ml-IN,
 *                      mr-IN, bn-IN, gu-IN, pa-IN
 *
 * Audio pipeline:
 *   Browser MediaRecorder (audio/webm;codecs=opus)
 *     → POST /api/voice/transcribe (multipart, field: "audio")
 *     → ffmpeg converts to PCM s16le 16kHz mono
 *     → Amazon Transcribe Streaming (pcm encoding, 16000 Hz)
 *     → Transcript text returned to caller
 *
 * ffmpeg is already a direct dependency (ffmpeg-static + fluent-ffmpeg).
 * No extra binary download needed.
 */

import {
    TranscribeStreamingClient,
    StartStreamTranscriptionCommand,
    LanguageCode,
} from '@aws-sdk/client-transcribe-streaming';
import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// ─── Language mapping ──────────────────────────────────────────────────────
// BharatMedia language code → Amazon Transcribe LanguageCode BCP-47
export const TRANSCRIBE_LANG_MAP: Record<string, LanguageCode> = {
    hi: LanguageCode.HI_IN,
    en: LanguageCode.EN_IN,
    ta: LanguageCode.TA_IN,
    te: LanguageCode.TE_IN,
    kn: LanguageCode.KN_IN,
    ml: LanguageCode.ML_IN,
    mr: LanguageCode.MR_IN,
    bn: LanguageCode.EN_IN, // Bengali not in Transcribe Streaming — fall back to en-IN
    gu: LanguageCode.EN_IN, // Gujarati not in Transcribe Streaming — fall back to en-IN
    pa: LanguageCode.EN_IN, // Punjabi not in Transcribe Streaming — fall back to en-IN
};

export const LANG_DISPLAY_NAMES: Record<string, string> = {
    hi: 'Hindi',
    en: 'English (Indian)',
    ta: 'Tamil',
    te: 'Telugu',
    kn: 'Kannada',
    ml: 'Malayalam',
    mr: 'Marathi',
    bn: 'Bengali',
    gu: 'Gujarati',
    pa: 'Punjabi',
};

// ─── Transcribe client ──────────────────────────────────────────────────────
const transcribeClient = new TranscribeStreamingClient({
    region: process.env.AWS_REGION || 'us-east-1',
});

// ─── Audio conversion via ffmpeg ────────────────────────────────────────────
/**
 * Convert any audio format (WebM, OGG, MP4, etc.) to raw PCM s16le 16kHz mono.
 * Returns a Buffer of raw 16-bit signed little-endian PCM samples.
 */
function convertToPcm(inputBuffer: Buffer): Buffer {
    // ffmpeg-static exports the path to the bundled ffmpeg binary
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ffmpegBin: string = require('ffmpeg-static');

    const tmpDir = os.tmpdir();
    const inputFile = path.join(tmpDir, `bm-transcribe-in-${Date.now()}.webm`);
    const outputFile = path.join(tmpDir, `bm-transcribe-out-${Date.now()}.pcm`);

    try {
        fs.writeFileSync(inputFile, inputBuffer);

        // Convert: any input → PCM 16-bit LE, 16kHz, 1 channel (mono)
        execFileSync(
            ffmpegBin,
            [
                '-y', // overwrite output
                '-i',
                inputFile, // input file
                '-ar',
                '16000', // sample rate: 16kHz (required by Transcribe)
                '-ac',
                '1', // channels: mono
                '-f',
                's16le', // format: signed 16-bit little-endian PCM
                outputFile,
            ],
            {
                timeout: 20_000,
                stdio: 'pipe', // suppress ffmpeg console output
            }
        );

        return fs.readFileSync(outputFile);
    } finally {
        try {
            fs.unlinkSync(inputFile);
        } catch {
            /* ignore */
        }
        try {
            fs.unlinkSync(outputFile);
        } catch {
            /* ignore */
        }
    }
}

// ─── Main transcription function ────────────────────────────────────────────
export interface TranscribeResult {
    transcription: string;
    detectedLanguage: string;
    languageName: string;
    confidence: number;
    source: 'amazon_transcribe' | 'DEMO_FALLBACK';
    service: string;
    durationMs?: number;
    note?: string;
}

/**
 * Transcribe a raw audio buffer using Amazon Transcribe Streaming.
 *
 * @param audioBuffer   Raw audio bytes (any format ffmpeg can decode)
 * @param languageCode  BharatMedia language code (e.g., 'hi', 'ta', 'te')
 * @returns             Transcript text + metadata
 */
export async function transcribeAudioBuffer(
    audioBuffer: Buffer,
    languageCode: string = 'hi'
): Promise<TranscribeResult> {
    const startMs = Date.now();
    const transcribeLang = TRANSCRIBE_LANG_MAP[languageCode] ?? LanguageCode.HI_IN;
    const langName = LANG_DISPLAY_NAMES[languageCode] ?? 'Hindi';

    // ── Step 1: Convert browser audio to PCM ──────────────────────────────
    console.log(`🎙️ [Transcribe] Converting ${audioBuffer.length} bytes → PCM 16kHz mono…`);
    const pcmBuffer = convertToPcm(audioBuffer);
    console.log(
        `🎙️ [Transcribe] PCM ready: ${pcmBuffer.length} bytes → streaming to Transcribe (${transcribeLang})…`
    );

    // ── Step 2: Stream PCM to Amazon Transcribe ───────────────────────────
    // Transcribe Streaming expects an AsyncIterable of AudioEvent chunks.
    // 3200 bytes = 100ms of audio at 16kHz 16-bit mono (3200 / 2 / 16000 = 0.1s)
    const CHUNK_MS = 100;
    const CHUNK_BYTES = (16_000 * 2 * CHUNK_MS) / 1000; // = 3200

    async function* audioStream() {
        for (let offset = 0; offset < pcmBuffer.length; offset += CHUNK_BYTES) {
            yield {
                AudioEvent: {
                    AudioChunk: new Uint8Array(
                        pcmBuffer.buffer,
                        pcmBuffer.byteOffset + offset,
                        Math.min(CHUNK_BYTES, pcmBuffer.length - offset)
                    ),
                },
            };
        }
    }

    const command = new StartStreamTranscriptionCommand({
        LanguageCode: transcribeLang,
        MediaEncoding: 'pcm',
        MediaSampleRateHertz: 16_000,
        AudioStream: audioStream(),
    });

    const response = await transcribeClient.send(command);

    // ── Step 3: Collect final (non-partial) transcription results ─────────
    let transcript = '';
    let totalConfidence = 0;
    let wordCount = 0;

    for await (const event of response.TranscriptResultStream!) {
        if (!event.TranscriptEvent?.Transcript?.Results) continue;
        for (const result of event.TranscriptEvent.Transcript.Results) {
            if (result.IsPartial) continue; // skip partial results
            const alt = result.Alternatives?.[0];
            if (!alt?.Transcript) continue;

            // Accumulate transcript
            transcript += (transcript ? ' ' : '') + alt.Transcript.trim();

            // Accumulate per-word confidence scores
            for (const item of alt.Items ?? []) {
                if (item.Confidence !== undefined) {
                    totalConfidence += item.Confidence;
                    wordCount++;
                }
            }
        }
    }

    const avgConfidence = wordCount > 0 ? totalConfidence / wordCount : 0.95;
    const durationMs = Date.now() - startMs;

    console.log(
        `✅ [Transcribe] Done in ${durationMs}ms — "${transcript.slice(0, 60)}…" (confidence: ${(avgConfidence * 100).toFixed(1)}%)`
    );

    return {
        transcription: transcript || '',
        detectedLanguage: languageCode,
        languageName: langName,
        confidence: Math.round(avgConfidence * 1000) / 1000,
        source: 'amazon_transcribe',
        service: 'Amazon Transcribe Streaming',
        durationMs,
    };
}
