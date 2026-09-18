"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.optionalAuthMiddleware = optionalAuthMiddleware;
const auth_1 = require("../services/auth");
function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = (0, auth_1.verifyToken)(token);
    if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
    req.userId = decoded.userId;
    req.email = decoded.email;
    next();
}
function optionalAuthMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        const decoded = (0, auth_1.verifyToken)(token);
        if (decoded) {
            req.userId = decoded.userId;
            req.email = decoded.email;
        }
    }
    next();
}
