/**
 * BharatMedia — Global Express Error Handler
 *
 * Wire this as the LAST middleware in index.ts:
 *   app.use(errorHandler);
 *
 * Behaviour:
 *   - Operational errors (AppError subclasses) → structured JSON + correct HTTP status
 *   - Unknown / programmer errors → 500 with a safe generic message (no stack leak)
 *   - Every error is logged with logger.error including the requestId header
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';

interface ErrorResponse {
    error: string;
    code: string;
    requestId?: string;
    fields?: Record<string, string>;
}

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
): void {
    const requestId = (req.headers['x-request-id'] as string) || 'unknown';

    if (err instanceof AppError) {
        // Operational error — safe to surface details to the client
        logger.error(err.message, {
            code: err.code,
            statusCode: err.statusCode,
            requestId,
            path: req.path,
            method: req.method,
        });

        const body: ErrorResponse = {
            error: err.message,
            code: err.code,
            requestId,
        };

        // Attach field-level details for validation errors
        if ('fields' in err && err.fields) {
            body.fields = err.fields as Record<string, string>;
        }

        res.status(err.statusCode).json(body);
        return;
    }

    // Programmer / unknown error — log full stack, return safe 500
    logger.error('Unhandled server error', {
        message: err.message,
        stack: err.stack,
        requestId,
        path: req.path,
        method: req.method,
    });

    res.status(500).json({
        error: 'An unexpected error occurred. Please try again.',
        code: 'INTERNAL_ERROR',
        requestId,
    });
}
