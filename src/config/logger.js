/**
 * Winston Logger Configuration
 * ============================================================================
 * Configures Winston logger with multiple transports and formats.
 * Supports both console and file output based on environment.
 *
 * Usage:
 *   import logger from './config/logger.js';
 *   logger.info('Message');
 *   logger.error('Error');
 */

import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDevelopment = process.env.NODE_ENV === 'development';
const LOG_LEVEL = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');
const LOG_FORMAT = process.env.LOG_FORMAT || (isDevelopment ? 'simple' : 'json');
const LOG_FILE_PATH = process.env.LOG_FILE_PATH || path.join(__dirname, '../../logs/app.log');
const LOG_ERROR_FILE_PATH = path.join(
  __dirname,
  '../../logs/error.log',
);

// ============================================================================
// Log Format Configuration
// ============================================================================

/**
 * Pretty print format for development
 * Shows timestamp, level, and message in a readable format
 */
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0 && meta.stack) {
      metaStr = `\n${meta.stack}`;
    } else if (Object.keys(meta).length > 0) {
      metaStr = `\n${JSON.stringify(meta, null, 2)}`;
    }
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  }),
);

/**
 * JSON format for production
 * Structured logging for easy parsing and searching
 */
const productionFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const logFormat = LOG_FORMAT === 'json' ? productionFormat : developmentFormat;

// ============================================================================
// Transports
// ============================================================================

const transports = [
  // Console transport - always enabled
  new winston.transports.Console({
    format: logFormat,
    level: LOG_LEVEL,
  }),
];

// File transport for all logs
if (!isDevelopment || process.env.LOG_TO_FILE === 'true') {
  transports.push(
    new winston.transports.File({
      filename: LOG_FILE_PATH,
      format: productionFormat,
      level: LOG_LEVEL,
      maxsize: 10485760, // 10MB
      maxFiles: 14, // Keep 14 days of logs
    }),
  );

  // Separate file transport for errors
  transports.push(
    new winston.transports.File({
      filename: LOG_ERROR_FILE_PATH,
      format: productionFormat,
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 30, // Keep 30 days of error logs
    }),
  );
}

// ============================================================================
// Logger Instance
// ============================================================================

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: logFormat,
  defaultMeta: { service: 'buildmate-ai' },
  transports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: LOG_ERROR_FILE_PATH,
      format: productionFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: LOG_ERROR_FILE_PATH,
      format: productionFormat,
    }),
  ],
});

export default logger;
