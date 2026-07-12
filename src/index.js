/**
 * Application Entry Point
 * ============================================================================
 * BuildMate AI - AI-powered Telegram Bot for Development Workflows
 *
 * This is the main entry point that:
 * - Loads environment variables
 * - Initializes the logger
 * - Starts the Express server
 * - Handles graceful shutdown
 * - Catches unhandled errors
 */

import 'dotenv/config';
import http from 'http';
import app from './app.js';
import logger from './config/logger.js';

// ============================================================================
// Constants
// ============================================================================

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const HOST = process.env.HOST || '0.0.0.0';

// ============================================================================
// Startup Banner
// ============================================================================

function printStartupBanner() {
  const banner = `
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║              🚀 BuildMate AI - Development Assistant Bot                  ║
║                                                                            ║
║        AI mentor that teaches developers to build software step by step   ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
  `;

  const info = `
  ✓ Environment:    ${NODE_ENV.toUpperCase()}
  ✓ Host:           ${HOST}
  ✓ Port:           ${PORT}
  ✓ Node.js:        ${process.version}
  ✓ Process ID:     ${process.pid}
  ✓ Timestamp:      ${new Date().toISOString()}
  `;

  console.log(banner);
  console.log(info);
}

// ============================================================================
// Server Initialization
// ============================================================================

async function startServer() {
  try {
    // Print startup banner
    printStartupBanner();

    // Create HTTP server
    const server = http.createServer(app);

    // Start listening
    server.listen(PORT, HOST, () => {
      logger.info(`Server started successfully`);
      logger.info(`API available at http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
      logger.info(`Health check: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/health`);
      logger.info(`Ready to accept requests\n`);
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
          logger.info('HTTP server closed');
        });

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
    logger.error('Unhandled Rejection:', reason);
    process.exit(1);
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
