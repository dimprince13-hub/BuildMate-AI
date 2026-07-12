/**
 * Express API Server Configuration
 * ============================================================================
 * Initializes Express application with middleware, routes, and error handling.
 * Does not include Telegram bot logic.
 *
 * Middleware stack:
 * 1. Security headers (Helmet)
 * 2. CORS configuration
 * 3. Request parsing
 * 4. Request logging
 * 5. Rate limiting
 * 6. Routes
 * 7. 404 handler
 * 8. Error handler
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import logger from '../config/logger.js';

// ============================================================================
// Express Application
// ============================================================================

const app = express();
const isDevelopment = process.env.NODE_ENV === 'development';

// ============================================================================
// Security Middleware
// ============================================================================

// Helmet.js for security headers
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// ============================================================================
// Request Parsing Middleware
// ============================================================================

// Parse JSON requests
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded requests
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============================================================================
// Request Logging Middleware
// ============================================================================

app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'info';

    logger[level](
      `${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`,
    );
  });

  next();
});

// ============================================================================
// Rate Limiting Middleware
// ============================================================================

const limiter = rateLimit({
  windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || '900000', 10),
  max: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS || '100', 10),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => isDevelopment && req.hostname === 'localhost',
});

app.use('/api/', limiter);

// ============================================================================
// Routes
// ============================================================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'BuildMate AI',
    version: '1.0.0',
    description: 'AI mentor that teaches developers to build software step by step',
    endpoints: {
      health: '/health',
      api: '/api',
    },
  });
});

// TODO: Register webhook routes
// TODO: Register API routes

// ============================================================================
// 404 Handler
// ============================================================================

app.use((req, res) => {
  logger.warn(`404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.path,
    method: req.method,
  });
});

// ============================================================================
// Global Error Handler
// ============================================================================

app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`Error [${status}]: ${message}`, { error: err });

  res.status(status).json({
    status: 'error',
    message,
    ...(isDevelopment && { stack: err.stack }),
  });
});

// ============================================================================
// Export
// ============================================================================

export default app;
