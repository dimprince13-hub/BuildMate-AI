/**
 * Express Application
 * ============================================================================
 * Initializes and configures the Express application with middleware,
 * security settings, and routes.
 *
 * Middleware stack:
 * 1. Helmet - Security headers
 * 2. CORS - Cross-origin requests
 * 3. Compression - Gzip compression
 * 4. JSON parsing - Request body parsing
 * 5. Request logging - HTTP request logging
 * 6. Rate limiting - API rate limiting
 * 7. Routes - Application routes
 * 8. 404 handler - Not found handler
 * 9. Error handler - Global error handling
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import logger from './config/logger.js';

// ============================================================================
// Express Application
// ============================================================================

const app = express();
const isDevelopment = process.env.NODE_ENV === 'development';

// ============================================================================
// Security Middleware
// ============================================================================

// Helmet.js - Secure Express by setting various HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: isDevelopment ? false : true,
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
  }),
);

// ============================================================================
// CORS Middleware
// ============================================================================

const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// ============================================================================
// Compression Middleware
// ============================================================================

// Compress responses for better performance
app.use(
  compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6, // Balance between compression ratio and speed
  }),
);

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
    const level = res.statusCode >= 400 ? 'warn' : 'debug';

    logger[level](`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });

  next();
});

// ============================================================================
// Routes
// ============================================================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'BuildMate AI',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
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
    status: 'running',
  });
});

// TODO: Register webhook routes
// TODO: Register API routes
// TODO: Register bot routes

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
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// Global Error Handler
// ============================================================================

app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`Error [${status}]: ${message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(status).json({
    status: 'error',
    message,
    ...(isDevelopment && { stack: err.stack }),
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// Export
// ============================================================================

export default app;
