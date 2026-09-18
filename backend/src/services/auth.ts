/**
 * BharatMedia — Auth Service (DynamoDB-backed)
 *
 * User records in the single DynamoDB table:
 *   PK = "USER#<id>",   SK = "USER#<id>"   → full user record (password hashed)
 *
 * Email lookup uses a separate GSI on the same table:
 *   GSI 3 — "EmailIndex":
 *     Attribute: email (String)
 *     Purpose: getUserByEmail(email) → Query instead of Scan
 *
 * AWS CLI to add EmailIndex (run after table creation):
 *   aws dynamodb update-table \
 *     --table-name bharatmedia-dev \
 *     --attribute-definitions AttributeName=email,AttributeType=S \
 *     --global-secondary-index-updates \
 *       "[{\"Create\":{\"IndexName\":\"EmailIndex\",\"KeySchema\":[{\"AttributeName\":\"email\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}}]" \
 *     --region us-east-1
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const JWT_SECRET   = process.env.JWT_SECRET   || 'your-secret-key-change-in-production';
const JWT_EXPIRY   = '7d';
const BCRYPT_ROUNDS = 12;
const TABLE_NAME   = process.env.DYNAMODB_TABLE || 'bharatmedia-dev';
const REGION       = process.env.AWS_REGION     || 'us-east-1';

const rawClient = new DynamoDBClient({ region: REGION });
const ddb = DynamoDBDocumentClient.from(rawClient, {
    marshallOptions:   { removeUndefinedValues: true },
    unmarshallOptions: { wrapNumbers: false },
});

// ─── INTERFACES (unchanged) ──────────────────────────────────────────────────

export interface User {
    id: string;
    email: string;
    phone?: string;
    name: string;
    language: string;
    businessType: string;
    region: string[];
    tier: 'free' | 'pro' | 'enterprise';
    createdAt: string;
    updatedAt: string;
}

export interface AuthToken {
    userId: string;
    email: string;
    iat: number;
    exp: number;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function stripMeta(item: Record<string, any>): any {
    const { PK, SK, _type, ...rest } = item;
    return rest;
}

// ─── PASSWORD & TOKEN ────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function generateToken(user: User): string {
    return jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
    );
}

export function verifyToken(token: string): AuthToken | null {
    try {
        return jwt.verify(token, JWT_SECRET) as AuthToken;
    } catch {
        return null;
    }
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// ─── USER CRUD ───────────────────────────────────────────────────────────────

export async function createUser(
    email: string,
    password: string,
    name: string,
    language: string = 'hi',
    businessType: string = 'other',
    region: string[] = []
): Promise<User> {
    const userId       = randomUUID();
    const hashedPassword = await hashPassword(password);
    const now          = new Date().toISOString();

    const userRecord = {
        id:           userId,
        email,
        password:     hashedPassword,
        name,
        language:     language || 'hi',
        businessType,
        region,
        tier:         'free' as const,
        createdAt:    now,
        updatedAt:    now,
    };

    await ddb.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
            PK:    `USER#${userId}`,
            SK:    `USER#${userId}`,
            _type: 'user',
            ...userRecord,
        },
        ConditionExpression: 'attribute_not_exists(PK)',
    }));

    const { password: _, ...userWithoutPassword } = userRecord;
    return userWithoutPassword;
}

/** Returns the full user record including hashed password (for login verification) */
export async function getUserByEmail(email: string): Promise<(User & { password: string }) | undefined> {
    const result = await ddb.send(new QueryCommand({
        TableName:              TABLE_NAME,
        IndexName:              'EmailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: { ':email': email },
        Limit: 1,
    }));
    if (!result.Items || result.Items.length === 0) return undefined;
    return stripMeta(result.Items[0]) as User & { password: string };
}

export async function getUserById(userId: string): Promise<User | undefined> {
    const result = await ddb.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${userId}`, SK: `USER#${userId}` },
    }));
    if (!result.Item) return undefined;
    const item = stripMeta(result.Item);
    const { password, ...userWithoutPassword } = item;
    return userWithoutPassword as User;
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    // Fetch including password so we can re-write the full item safely
    const result = await ddb.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${userId}`, SK: `USER#${userId}` },
    }));
    if (!result.Item) return null;
    const existing = stripMeta(result.Item);

    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };

    await ddb.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
            PK:    `USER#${userId}`,
            SK:    `USER#${userId}`,
            _type: 'user',
            ...updated,
        },
    }));

    const { password, ...userWithoutPassword } = updated;
    return userWithoutPassword as User;
}
