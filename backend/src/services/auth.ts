import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '7d';
const BCRYPT_ROUNDS = 12;

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

// In-memory user store (replace with DynamoDB in production)
export const users = new Map<string, User & { password: string }>();

// Hash password with bcrypt
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
}

// Generate JWT token
export function generateToken(user: User): string {
    return jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
    );
}

// Verify JWT token
export function verifyToken(token: string): AuthToken | null {
    try {
        return jwt.verify(token, JWT_SECRET) as AuthToken;
    } catch (error) {
        return null;
    }
}

// Create user
export async function createUser(email: string, password: string, name: string, language: string = 'hi', businessType: string = 'other', region: string[] = []): Promise<User> {
    const userId = randomUUID();
    const hashedPassword = await hashPassword(password);
    const user: User & { password: string } = {
        id: userId,
        email,
        password: hashedPassword,
        name,
        language: language || 'hi', // Default to Hindi
        businessType,
        region,
        tier: 'free',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    users.set(userId, user);
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

// Get user by email
export function getUserByEmail(email: string): (User & { password: string }) | undefined {
    for (const user of users.values()) {
        if (user.email === email) return user;
    }
    return undefined;
}

// Get user by ID
export function getUserById(userId: string): User | undefined {
    const user = users.get(userId);
    if (!user) return undefined;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

// Update user
export function updateUser(userId: string, updates: Partial<User>): User | null {
    const user = users.get(userId);
    if (!user) return null;
    const updated = { ...user, ...updates, updatedAt: new Date().toISOString() };
    users.set(userId, updated);
    const { password, ...userWithoutPassword } = updated;
    return userWithoutPassword;
}

// Verify password with bcrypt
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}
