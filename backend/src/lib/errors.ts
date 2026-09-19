/**
 * BharatMedia — Typed Error Hierarchy
 *
 * All application errors extend AppError which carries:
 *   - statusCode  → HTTP response code
 *   - code        → machine-readable string for client-side handling
 *
 * The global Express error handler (errorHandler.ts) catches these and
 * formats a consistent { error, code, requestId } JSON response.
 */

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR') {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true; // Distinguish from programmer errors
        Error.captureStackTrace(this, this.constructor);
    }
}

/** Input validation failure — HTTP 400 */
export class ValidationError extends AppError {
    public readonly fields?: Record<string, string>;

    constructor(message: string, fields?: Record<string, string>) {
        super(message, 400, 'VALIDATION_ERROR');
        this.fields = fields;
    }
}

/** Authentication / authorisation failure — HTTP 401 */
export class AuthError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, 401, 'AUTH_ERROR');
    }
}

/** Resource not found — HTTP 404 */
export class NotFoundError extends AppError {
    constructor(resource: string) {
        super(`${resource} not found`, 404, 'NOT_FOUND');
    }
}

/** AWS Bedrock model invocation failure */
export class BedrockError extends AppError {
    public readonly modelId: string;

    constructor(message: string, modelId: string) {
        super(`Bedrock [${modelId}]: ${message}`, 502, 'BEDROCK_ERROR');
        this.modelId = modelId;
    }
}

/** DynamoDB / storage failure */
export class StorageError extends AppError {
    constructor(message: string) {
        super(message, 502, 'STORAGE_ERROR');
    }
}

/** Rate limit exceeded — HTTP 429 */
export class RateLimitError extends AppError {
    constructor(message = 'Too many requests — please try again later') {
        super(message, 429, 'RATE_LIMIT_EXCEEDED');
    }
}
