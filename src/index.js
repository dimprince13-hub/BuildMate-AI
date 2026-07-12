/**
 * Application Entry Point
 * ============================================================================
 * BuildMate AI - AI-powered Telegram Bot for Development Workflows
 *
 * This module serves as the main entry point for the application.
 * It handles:
 * - Environment variable validation
 * - Logger initialization
 * - Express server setup
 * - Graceful shutdown handling
 * - Error handling
 */

import 'dotenv/config';
import http from 'http';
import app from './api/index.js';
import logger from './config/logger.js';

// ============================================================================
// Constants
// ============================================================================

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const isDevelopment = NODE_ENV === 'development';

// ============================================================================
// Startup Banner
// ============================================================================

function printStartupBanner() {
  const banner = `
    ╔══════════════════════════════════════════════════════════════════╗
    ║                                                                  ║
    ║          🚀 BuildMate AI - Development Assistant Bot            ║
    ║                                                                  ║
    ║     AI mentor that teaches developers to build software         ║
    ║              step by step with Telegram                         ║
    ║                                                                  ║
    ╚══════════════════════════════════════════════════════════════════╝
  `;

  const info = `
    Environment:  ${NODE_ENV.toUpperCase()}
    Port:         ${PORT}
    Timezone:     ${Intl.DateTimeFormat().resolvedOptions().timeZone}
    Memory:       ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
    Uptime:       Just started
    Node.js:      ${process.version}
    PID:          ${process.pid}
  `;

  console.log(banner);
  console.log(info);
  console.log('    Starting services...\n');
}

// ============================================================================
// Environment Validation
// ============================================================================

function validateEnvironment() {
  const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'LOG_LEVEL',
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_BOT_USERNAME',
  ];

  const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    logger.error(
      `Missing required environment variables: ${missingEnvVars.join(', ')}`,
    );
    process.exit(1);
  }

  logger.info('✓ All required environment variables are set');
}

// ============================================================================
// Server Initialization
// ============================================================================

async function startServer() {
  try {
    // Print startup banner
    printStartupBanner();

    // Validate environment
    validateEnvironment();

    // Create HTTP server
    const server = http.createServer(app);

    // Start listening
    server.listen(PORT, () => {
      logger.info(`✓ Express server listening on port ${PORT}`);
      logger.info(`✓ API available at http://localhost:${PORT}`);

      if (isDevelopment) {
        logger.info(`✓ Debug mode enabled`);
      }

      logger.info('\n✓ Application is ready to accept requests\n');
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
        process.exit(1);
      }
      logger.error('Server error:', error);
      process.exit(1);
    });

    // Return server for graceful shutdown
    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// ============================================================================
// Graceful Shutdown
// ============================================================================

function setupGracefulShutdown(server) {
  const signals = ['SIGTERM', 'SIGINT'];

  signals.forEach((signal) => {
    process.on(signal, async () => {
      logger.info(`\nReceived ${signal}, shutting down gracefully...`);

      try {
        // Close HTTP server
        server.close(() => {
          logger.info('✓ HTTP server closed');
        });

        // TODO: Close database connection
        // TODO: Close cache connection
        // TODO: Close bot connection

        // Exit after a timeout if something doesn't close cleanly
        setTimeout(() => {
          logger.warn('Forcing process exit after 10 seconds');
          process.exit(1);
        }, 10000);

        // Exit cleanly
        process.exit(0);
      } catch (error) {
        logger.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    });
  });
}

// ============================================================================
// Global Error Handlers
// ============================================================================

function setupErrorHandlers() {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });

  // Handle warnings
  process.on('warning', (warning) => {
    logger.warn(`Warning: ${warning.name}`, warning.message);
  });
}

// ============================================================================
// Application Startup
// ============================================================================

async function main() {
  try {
    // Setup error handlers first
    setupErrorHandlers();

    // Start the server
    const server = await startServer();

    // Setup graceful shutdown
    setupGracefulShutdown(server);
  } catch (error) {
    logger.error('Application startup failed:', error);
    process.exit(1);
  }
}

// Start the application
main();
