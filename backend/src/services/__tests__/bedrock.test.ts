/**
 * Unit tests — Bedrock Service (backend/src/services/bedrock.ts)
 *
 * Strategy:
 *   - Mock the AWS Bedrock SDK so no real API calls are made
 *   - Verify invokeNovaPro falls back to Claude when Nova Pro throws
 *   - Verify checkContentSafety parses JSON correctly and handles errors gracefully
 *   - Verify JSON fence stripping logic works for ```json and ``` variants
 */

// ─── Mock AWS SDK before importing bedrock ────────────────────────────────────
const mockSend = jest.fn();
jest.mock('@aws-sdk/client-bedrock-runtime', () => ({
    BedrockRuntimeClient: jest.fn().mockImplementation(() => ({ send: mockSend })),
    InvokeModelCommand: jest.fn().mockImplementation((params) => ({ params })),
}));

jest.mock('@aws-sdk/client-s3', () => ({
    S3Client: jest.fn().mockImplementation(() => ({ send: jest.fn() })),
    PutObjectCommand: jest.fn(),
}));

// Helper to encode a model response body into Uint8Array as Bedrock does
function encodeBody(obj: unknown): { body: Uint8Array } {
    return { body: new TextEncoder().encode(JSON.stringify(obj)) };
}

import { invokeNovaPro, invokeNovaOmni, checkContentSafety } from '../bedrock';

// ─── invokeNovaPro ────────────────────────────────────────────────────────────
describe('invokeNovaPro', () => {
    beforeEach(() => mockSend.mockReset());

    it('returns text from Nova Pro when the model responds successfully', async () => {
        mockSend.mockResolvedValueOnce(
            encodeBody({ output: { message: { content: [{ text: 'Nova Pro response' }] } } })
        );

        const result = await invokeNovaPro('test prompt');
        expect(result).toBe('Nova Pro response');
        expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('falls back to Claude when Nova Pro throws', async () => {
        // First call (Nova Pro) → throws
        mockSend.mockRejectedValueOnce(new Error('Model not available'));
        // Second call (Claude fallback) → succeeds
        mockSend.mockResolvedValueOnce(
            encodeBody({ content: [{ text: 'Claude fallback response' }] })
        );

        const result = await invokeNovaPro('test prompt');
        expect(result).toBe('Claude fallback response');
        expect(mockSend).toHaveBeenCalledTimes(2);
    });
});

// ─── invokeNovaOmni ───────────────────────────────────────────────────────────
describe('invokeNovaOmni', () => {
    beforeEach(() => mockSend.mockReset());

    it('returns text from Nova Lite on success', async () => {
        mockSend.mockResolvedValueOnce(
            encodeBody({ output: { message: { content: [{ text: 'Nova Omni result' }] } } })
        );
        const result = await invokeNovaOmni('prompt');
        expect(result).toBe('Nova Omni result');
    });

    it('falls back to Claude on failure', async () => {
        mockSend
            .mockRejectedValueOnce(new Error('Nova Omni unavailable'))
            .mockResolvedValueOnce(encodeBody({ content: [{ text: 'Claude backup' }] }));
        const result = await invokeNovaOmni('prompt');
        expect(result).toBe('Claude backup');
    });
});

// ─── checkContentSafety ──────────────────────────────────────────────────────
describe('checkContentSafety', () => {
    beforeEach(() => mockSend.mockReset());

    it('parses a valid safety JSON response correctly', async () => {
        const safetyJson = { safe: true, score: 92, issues: [] };
        mockSend.mockResolvedValueOnce(
            encodeBody({ output: { message: { content: [{ text: JSON.stringify(safetyJson) }] } } })
        );

        const result = await checkContentSafety('Good content about Diwali');
        expect(result.safe).toBe(true);
        expect(result.score).toBe(92);
        expect(result.issues).toHaveLength(0);
    });

    it('strips ```json fences before parsing', async () => {
        const wrapped = '```json\n{"safe":true,"score":88,"issues":[]}\n```';
        mockSend.mockResolvedValueOnce(
            encodeBody({ output: { message: { content: [{ text: wrapped }] } } })
        );

        const result = await checkContentSafety('content');
        expect(result.score).toBe(88);
    });

    it('strips plain ``` fences before parsing', async () => {
        const wrapped = '```\n{"safe":false,"score":45,"issues":["Inappropriate language"]}\n```';
        mockSend.mockResolvedValueOnce(
            encodeBody({ output: { message: { content: [{ text: wrapped }] } } })
        );

        const result = await checkContentSafety('bad content');
        expect(result.safe).toBe(false);
        expect(result.issues).toContain('Inappropriate language');
    });

    it('returns safe fallback object when model throws', async () => {
        mockSend.mockRejectedValue(new Error('Bedrock error'));

        const result = await checkContentSafety('any content');
        expect(result.safe).toBe(true);
        expect(result.score).toBe(80);
        expect(result.issues.length).toBeGreaterThan(0); // fallback message present
    });
});
