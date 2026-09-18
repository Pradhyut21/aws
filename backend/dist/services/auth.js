"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = void 0;
exports.hashPassword = hashPassword;
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.createUser = createUser;
exports.getUserByEmail = getUserByEmail;
exports.getUserById = getUserById;
exports.updateUser = updateUser;
exports.verifyPassword = verifyPassword;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = require("crypto");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '7d';
const BCRYPT_ROUNDS = 12;
// In-memory user store (replace with DynamoDB in production)
exports.users = new Map();
// Hash password with bcrypt
async function hashPassword(password) {
    return bcrypt_1.default.hash(password, BCRYPT_ROUNDS);
}
// Generate JWT token
function generateToken(user) {
    return jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}
// Verify JWT token
function verifyToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        return null;
    }
}
// Create user
async function createUser(email, password, name, language = 'hi', businessType = 'other', region = []) {
    const userId = (0, crypto_1.randomUUID)();
    const hashedPassword = await hashPassword(password);
    const user = {
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
    exports.users.set(userId, user);
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
}
// Get user by email
function getUserByEmail(email) {
    for (const user of exports.users.values()) {
        if (user.email === email)
            return user;
    }
    return undefined;
}
// Get user by ID
function getUserById(userId) {
    const user = exports.users.get(userId);
    if (!user)
        return undefined;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
}
// Update user
function updateUser(userId, updates) {
    const user = exports.users.get(userId);
    if (!user)
        return null;
    const updated = { ...user, ...updates, updatedAt: new Date().toISOString() };
    exports.users.set(userId, updated);
    const { password, ...userWithoutPassword } = updated;
    return userWithoutPassword;
}
// Verify password with bcrypt
async function verifyPassword(password, hash) {
    return bcrypt_1.default.compare(password, hash);
}
