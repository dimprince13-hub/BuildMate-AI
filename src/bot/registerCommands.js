/**
 * Command Registration
 * ============================================================================
 * Registers all bot commands and their handlers.
 * Commands are automatically discovered and registered.
 *
 * Available Commands:
 * - /start - Start the bot and begin a project
 * - /help - Show help information
 * - /myprojects - View your projects
 * - /settings - Bot settings
 *
 * Usage:
 *   import registerCommands from './registerCommands.js';
 *   registerCommands(bot);
 */

import logger from '../config/logger.js';
import startCommand from './commands/start.js';
import helpCommand from './commands/help.js';

// ============================================================================
// Command Registry
// ============================================================================

const commands = [
  {
    command: 'start',
    description: 'Start the bot and begin a project',
    handler: startCommand,
  },
  {
    command: 'help',
    description: 'Show help information',
    handler: helpCommand,
  },
];

// ============================================================================
// Register Commands
// ============================================================================

/**
 * Register all commands with the bot
 * @param {Telegraf} bot - Telegraf bot instance
 */
function registerCommands(bot) {
  if (!bot) {
    throw new Error('Bot instance is required');
  }

  // Register each command
  commands.forEach((cmd) => {
    try {
      bot.command(cmd.command, (ctx) => cmd.handler(ctx, bot));
      logger.debug(`Command registered: /${cmd.command}`);
    } catch (error) {
      logger.error(`Failed to register command /${cmd.command}`, error);
      throw error;
    }
  });

  // Set bot menu commands
  setMenuCommands(bot);
}

// ============================================================================
// Set Menu Commands
// ============================================================================

/**
 * Set bot menu commands in Telegram
 * @param {Telegraf} bot - Telegraf bot instance
 */
async function setMenuCommands(bot) {
  try {
    const menuCommands = commands.map((cmd) => ({
      command: cmd.command,
      description: cmd.description,
    }));

    await bot.telegram.setMyCommands(menuCommands);
    logger.info('Bot menu commands set successfully', {
      commandCount: menuCommands.length,
    });
  } catch (error) {
    logger.error('Failed to set bot menu commands', error);
  }
}

// ============================================================================
// Export
// ============================================================================

export default registerCommands;
