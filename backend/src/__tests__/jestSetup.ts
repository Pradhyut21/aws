/**
 * Jest global setup — runs before all test files.
 * Ensures tests never accidentally hit real AWS services.
 */

// Set NODE_ENV so logger suppresses output during tests
process.env.NODE_ENV = 'test';

// Provide dummy secrets so modules that check env vars at import time don't throw
process.env.JWT_SECRET = 'test-jwt-secret-for-jest-do-not-use-in-production';
process.env.AWS_REGION = 'us-east-1';
process.env.DYNAMODB_TABLE = 'bharatmedia-test';
process.env.S3_BUCKET_NAME = 'bharatmedia-test-bucket';

// Prevent any real AWS SDK calls from reaching the network
// (individual tests mock the SDK clients they need)
