/**
 * Telegram Bot Core
 * ============================================================================
 * Initializes and configures the Telegraf bot instance.
 * Handles bot setup, middleware, error handling, and lifecycle.
 *
 * Features:
 * - Bot initialization from environment variables
 * - Middleware registration
 * - Command and handler setup
 * - Error handling and logging
 * - Graceful shutdown
 *
 * Usage:
 *   import bot from './bot.js';
 *   await bot.launch();
 */

import { Telegraf } from 'telegraf';
import logger from '../config/logger.js';
import registerCommands from './registerCommands.js';
import registerHandlers from './registerHandlers.js';

// ============================================================================
// Constants
// ============================================================================

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// ============================================================================
// Validation
// ============================================================================

if (!BOT_TOKEN) {
  logger.error('TELEGRAM_BOT_TOKEN is not set in environment variables');
  process.exit(1);
}

// ============================================================================
// Bot Instance
// ============================================================================

/**
 * Create Telegraf bot instance
 */
const bot = new Telegraf(BOT_TOKEN);

// ============================================================================
// Middleware
// ============================================================================

/**
 * Logging middleware - logs all incoming updates
 */
bot.use((ctx, next) => {
  const startTime = Date.now();
  const updateType = ctx.updateType;
  const from = ctx.from;

  logger.debug(`Incoming update: ${updateType}`, {
    userId: from?.id,
    username: from?.username,
    firstName: from?.first_name,
  });

  // Call next middleware
  return next().then(() => {
    const duration = Date.now() - startTime;
    logger.debug(`Update processed`, {
      updateType,
      userId: from?.id,
      duration,
    });
  });
});

// ============================================================================
// Command Registration
// ============================================================================

/**
 * Register all commands
 */
function initializeCommands() {
  try {
    registerCommands(bot);
    logger.info('Bot commands registered successfully');
  } catch (error) {
    logger.error('Failed to register bot commands', error);
    throw error;
  }
}

// ============================================================================
// Handler Registration
// ============================================================================

/**
 * Register all handlers
 */
function initializeHandlers() {
  try {
    registerHandlers(bot);
    logger.info('Bot handlers registered successfully');
  } catch (error) {
    logger.error('Failed to register bot handlers', error);
    throw error;
  }
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Handle bot errors
 */
bot.catch((error, ctx) => {
  logger.error('Bot error caught', {
    error: error.message,
    stack: error.stack,
    userId: ctx?.from?.id,
    updateType: ctx?.updateType,
  });

  // Send error response to user if possible
  if (ctx && ctx.reply) {
    ctx.reply(
      '❌ An error occurred. Please try again later or contact support.',
    ).catch((err) => {
      logger.error('Failed to send error response', err);
    });
  }
});

// ============================================================================
// Bot Launch
// ============================================================================

/**
 * Launch the bot
 * @returns {Promise<void>}
 */
async function launch() {
  try {
    logger.info('Starting Telegram bot...');

    // Initialize commands and handlers
    initializeCommands();
    initializeHandlers();

    // Launch bot
    await bot.launch();

    logger.info(`✓ Telegram bot launched successfully`);
    logger.info(`✓ Bot username: @${(await bot.telegram.getMe()).username}`);
    logger.info(`✓ Bot is ready to accept messages`);
  } catch (error) {
    logger.error('Failed to launch bot', error);
    throw error;
  }
}

// ============================================================================
// Bot Stop
// ============================================================================

/**
 * Stop the bot
 * @returns {Promise<void>}
 */
async function stop() {
  try {
    logger.info('Stopping Telegram bot...');
    await bot.stop();
    logger.info('✓ Telegram bot stopped');
  } catch (error) {
    logger.error('Failed to stop bot', error);
    throw error;
  }
}

// ============================================================================
// Graceful Shutdown
// ============================================================================

process.once('SIGINT', async () => {
  await stop();
});

process.once('SIGTERM', async () => {
  await stop();
});

// ============================================================================
// Export
// ============================================================================

export default bot;
export { launch, stop };
