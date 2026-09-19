/**
 * Unit tests — Auth Service (backend/src/services/auth.ts)
 *
 * Strategy:
 *   - Mock DynamoDB so no real table is needed
 *   - Test all cryptographic helpers in isolation
 *   - Verify token round-trips with valid / invalid / expired payloads
 *   - Test user CRUD logic against mocked DynamoDB responses
 */

import jwt from 'jsonwebtoken';

// ─── Mock AWS DynamoDB BEFORE importing auth so module-level clients get mocked ─
jest.mock('@aws-sdk/client-dynamodb', () => ({
    DynamoDBClient: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('@aws-sdk/lib-dynamodb', () => ({
    DynamoDBDocumentClient: {
        from: jest.fn().mockReturnValue({
            send: jest.fn(),
        }),
    },
    PutCommand: jest.fn(),
    GetCommand: jest.fn(),
    QueryCommand: jest.fn(),
}));

import { hashPassword, verifyPassword, generateToken, verifyToken } from '../auth';
import type { User } from '../auth';

// ─── Sample user fixture ──────────────────────────────────────────────────────
const sampleUser: User = {
    id: 'user-abc-123',
    email: 'test@bharatmedia.in',
    name: 'Test User',
    language: 'hi',
    businessType: 'restaurant',
    region: ['Mumbai'],
    tier: 'free',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
};

// ─── Password helpers ─────────────────────────────────────────────────────────
describe('Auth Service — password helpers', () => {
    it('hashPassword produces a bcrypt hash that verifyPassword validates', async () => {
        const password = 'StrongP@ssw0rd!';
        const hash = await hashPassword(password);

        expect(hash).not.toBe(password);
        expect(hash).toMatch(/^\$2[aby]\$/); // bcrypt prefix

        const isValid = await verifyPassword(password, hash);
        expect(isValid).toBe(true);
    });

    it('verifyPassword returns false for wrong password', async () => {
        const hash = await hashPassword('correct-password');
        const isValid = await verifyPassword('wrong-password', hash);
        expect(isValid).toBe(false);
    });

    it('hashPassword produces different hashes for the same password (salting)', async () => {
        const hash1 = await hashPassword('same-password');
        const hash2 = await hashPassword('same-password');
        expect(hash1).not.toBe(hash2);
    });
});

// ─── JWT helpers ──────────────────────────────────────────────────────────────
describe('Auth Service — JWT helpers', () => {
    it('generateToken returns a valid JWT with correct payload', () => {
        const token = generateToken(sampleUser);
        expect(typeof token).toBe('string');
        expect(token.split('.')).toHaveLength(3); // header.payload.signature

        const decoded = jwt.decode(token) as Record<string, unknown>;
        expect(decoded.userId).toBe(sampleUser.id);
        expect(decoded.email).toBe(sampleUser.email);
    });

    it('verifyToken successfully verifies a freshly generated token', () => {
        const token = generateToken(sampleUser);
        const payload = verifyToken(token);

        expect(payload).not.toBeNull();
        expect(payload?.userId).toBe(sampleUser.id);
        expect(payload?.email).toBe(sampleUser.email);
    });

    it('verifyToken returns null for a tampered token', () => {
        const token = generateToken(sampleUser);
        const [header, payload] = token.split('.');
        const tamperedToken = `${header}.${payload}.invalidsignature`;

        const result = verifyToken(tamperedToken);
        expect(result).toBeNull();
    });

    it('verifyToken returns null for an expired token', () => {
        // Sign a token that expired 1 second ago
        const expiredToken = jwt.sign(
            { userId: sampleUser.id, email: sampleUser.email },
            process.env.JWT_SECRET!,
            { expiresIn: -1 } // already expired
        );

        const result = verifyToken(expiredToken);
        expect(result).toBeNull();
    });

    it('verifyToken returns null for a completely invalid string', () => {
        expect(verifyToken('not.a.jwt')).toBeNull();
        expect(verifyToken('')).toBeNull();
        expect(verifyToken('garbage')).toBeNull();
    });
});
