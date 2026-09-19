/**
 * BharatMedia — Structured Logger
 *
 * Outputs human-readable logs in development and JSON (CloudWatch-friendly)
 * in production. Replace all console.log / console.error / console.warn calls
 * with this logger so every event is queryable in CloudWatch Logs Insights.
 *
 * Usage:
 *   import { logger } from '../lib/logger';
 *   logger.info('Pipeline stage complete', { stage: 1, latencyMs: 320 });
 *   logger.error('Bedrock call failed', { error: err.message, modelId });
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogMeta = Record<string, unknown>;

const IS_PROD = process.env.NODE_ENV === 'production';
const IS_TEST = process.env.NODE_ENV === 'test';

function formatDev(level: LogLevel, message: string, meta?: LogMeta): string {
    const emoji: Record<LogLevel, string> = {
        debug: '🔍',
        info: '✅',
        warn: '⚠️ ',
        error: '❌',
    };
    const ts = new Date().toISOString();
    const metaStr = meta && Object.keys(meta).length > 0 ? ' ' + JSON.stringify(meta) : '';
    return `${emoji[level]} [${ts}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

function formatProd(level: LogLevel, message: string, meta?: LogMeta): string {
    return JSON.stringify({
        level,
        message,
        timestamp: new Date().toISOString(),
        service: 'bharatmedia-backend',
        ...meta,
    });
}

function log(level: LogLevel, message: string, meta?: LogMeta): void {
    // Suppress all output during tests unless LOG_IN_TEST=true
    if (IS_TEST && process.env.LOG_IN_TEST !== 'true') return;

    const output = IS_PROD ? formatProd(level, message, meta) : formatDev(level, message, meta);

    if (level === 'error') {
        // eslint-disable-next-line no-console
        console.error(output);
    } else if (level === 'warn') {
        // eslint-disable-next-line no-console
        console.warn(output);
    } else {
        // eslint-disable-next-line no-console
        console.log(output);
    }
}

export const logger = {
    debug: (message: string, meta?: LogMeta) => log('debug', message, meta),
    info: (message: string, meta?: LogMeta) => log('info', message, meta),
    warn: (message: string, meta?: LogMeta) => log('warn', message, meta),
    error: (message: string, meta?: LogMeta) => log('error', message, meta),
};
