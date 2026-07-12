/**
 * Environment Configuration
 * ============================================================================
 * Loads and validates environment variables.
 * Provides a centralized configuration object for the application.
 *
 * Usage:
 *   import config from './config/env.js';
 *   console.log(config.port);
 *   console.log(config.isDevelopment);
 */

// Ensure dotenv is loaded
import 'dotenv/config';

// ============================================================================
// Environment Variable Validation
// ============================================================================

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'LOG_LEVEL',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_BOT_USERNAME',
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(
    `Error: Missing required environment variables: ${missingEnvVars.join(', ')}`,
  );
  console.error('Please copy .env.example to .env and fill in the required values.');
  process.exit(1);
}

// ============================================================================
// Configuration Object
// ============================================================================

const config = {
  // Application
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  logFormat: process.env.LOG_FORMAT || 'json',
  logFilePath: process.env.LOG_FILE_PATH || './logs/app.log',
  logErrorFilePath: process.env.LOG_ERROR_FILE_PATH || './logs/error.log',

  // Telegram Bot
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    botUsername: process.env.TELEGRAM_BOT_USERNAME,
    webhookUrl: process.env.TELEGRAM_WEBHOOK_URL || '',
    webhookPath: process.env.TELEGRAM_WEBHOOK_PATH || '/api/webhook/telegram',
  },

  // Database - PostgreSQL
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    name: process.env.DATABASE_NAME || 'buildmate_db',
    user: process.env.DATABASE_USER || 'buildmate_user',
    password: process.env.DATABASE_PASSWORD || '',
    poolMin: parseInt(process.env.DATABASE_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DATABASE_POOL_MAX || '10', 10),
    timeout: parseInt(process.env.DATABASE_TIMEOUT || '5000', 10),
  },

  // Redis Cache
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB || '0', 10),
    timeout: parseInt(process.env.REDIS_TIMEOUT || '5000', 10),
  },

  // API Configuration
  api: {
    webhookSecret: process.env.API_WEBHOOK_SECRET || '',
    requestTimeout: parseInt(process.env.API_REQUEST_TIMEOUT || '30000', 10),
    rateLimitWindowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || '900000', 10),
    rateLimitMaxRequests: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Security
  security: {
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    sessionSecret: process.env.SESSION_SECRET || 'change-me',
    jwtSecret: process.env.JWT_SECRET || 'change-me',
    jwtExpiry: process.env.JWT_EXPIRY || '7d',
  },

  // Feature Flags
  features: {
    analytics: process.env.FEATURE_ANALYTICS === 'true',
    notifications: process.env.FEATURE_NOTIFICATIONS === 'true',
    webhook: process.env.FEATURE_WEBHOOK === 'true',
  },
};

// ============================================================================
// Validation for Production
// ============================================================================

if (config.isProduction) {
  if (config.security.sessionSecret === 'change-me' || config.security.jwtSecret === 'change-me') {
    console.error('Error: Production secrets are not configured');
    console.error('Please set SESSION_SECRET and JWT_SECRET environment variables');
    process.exit(1);
  }

  if (config.api.webhookSecret === '') {
    console.error('Error: Webhook secret is not configured in production');
    console.error('Please set API_WEBHOOK_SECRET environment variable');
    process.exit(1);
  }
}

// ============================================================================
// Export
// ============================================================================

export default config;
