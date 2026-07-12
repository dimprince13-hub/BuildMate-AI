/**
 * Start Command
 * ============================================================================
 * Implements the /start command.
 * Welcomes the user and displays the main menu.
 *
 * Features:
 * - Welcomes user by first name
 * - Creates user if they don't exist
 * - Displays main menu with action buttons
 * - Logs command execution
 *
 * Usage:
 *   import startCommand from './commands/start.js';
 *   bot.command('start', (ctx) => startCommand(ctx, bot));
 */

import logger from '../../config/logger.js';
import { User } from '../../database/index.js';

// ============================================================================
// Start Command Handler
// ============================================================================

/**
 * Handle /start command
 * @param {Context} ctx - Telegraf context
 * @param {Telegraf} bot - Telegraf bot instance
 */
async function startCommand(ctx, bot) {
  try {
    const { from } = ctx;

    logger.info('Start command received', {
      userId: from.id,
      username: from.username,
      firstName: from.first_name,
    });

    // Get or create user
    let user = await User.getByTelegramId(from.id);

    if (!user) {
      logger.info('Creating new user', {
        telegramId: from.id,
        username: from.username,
      });

      user = await User.create({
        telegramId: from.id,
        username: from.username || `user_${from.id}`,
        firstName: from.first_name,
        lastName: from.last_name || null,
      });

      logger.info('User created successfully', {
        userId: user.id,
        telegramId: user.telegram_id,
      });
    } else {
      logger.info('User found', {
        userId: user.id,
        telegramId: user.telegram_id,
      });
    }

    // Send welcome message with inline keyboard
    await ctx.reply(
      `🎉 Welcome to BuildMate AI, ${from.first_name}!\n\n` +
        `I'm your AI mentor for building software step by step. Let's get started!\n\n` +
        `What would you like to do today?`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 Start Building',
                callback_data: 'start_building',
              },
            ],
            [
              {
                text: '📚 My Projects',
                callback_data: 'my_projects',
              },
            ],
            [
              {
                text: '⚙️ Settings',
                callback_data: 'settings',
              },
            ],
            [
              {
                text: '❓ Help',
                callback_data: 'help_action',
              },
            ],
          ],
        },
      },
    );

    logger.debug('Start message sent successfully', {
      userId: from.id,
    });
  } catch (error) {
    logger.error('Error in start command', {
      error: error.message,
      userId: ctx.from?.id,
    });

    await ctx.reply(
      '❌ An error occurred while processing your request. Please try again.',
    ).catch((err) => {
      logger.error('Failed to send error message', err);
    });
  }
}

// ============================================================================
// Export
// ============================================================================

export default startCommand;
