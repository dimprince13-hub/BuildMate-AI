/**
 * Help Command
 * ============================================================================
 * Implements the /help command.
 * Provides comprehensive help information to users.
 *
 * Features:
 * - Displays all available commands
 * - Explains bot features
 * - Provides usage instructions
 * - Links to documentation
 *
 * Usage:
 *   import helpCommand from './commands/help.js';
 *   bot.command('help', (ctx) => helpCommand(ctx));
 */

import logger from '../../config/logger.js';

// ============================================================================
// Help Command Handler
// ============================================================================

/**
 * Handle /help command
 * @param {Context} ctx - Telegraf context
 */
async function helpCommand(ctx) {
  try {
    const { from } = ctx;

    logger.info('Help command received', {
      userId: from.id,
      username: from.username,
    });

    const helpText = `
📖 **BuildMate AI - Help Guide**

🤖 **About BuildMate AI**
Your personal AI mentor for building software step by step. Learn, build, and master development with guided projects.

📋 **Available Commands**

/start - Start the bot and see main menu
/help - Show this help message
/myprojects - View all your projects
/settings - Configure bot settings

🚀 **Getting Started**

1. Use /start to begin
2. Choose "Start Building" to select a project
3. Follow the step-by-step guide
4. Complete each milestone
5. Track your progress

💡 **Features**

🎯 Guided Learning - Learn through structured projects
📊 Progress Tracking - Monitor your learning journey
🔗 Integration - Connect with GitHub and other tools
💬 AI Assistance - Get help from AI mentor

❓ **FAQ**

Q: How do I start a new project?
A: Use /start and select "Start Building"

Q: Can I work on multiple projects?
A: Yes! You can work on multiple projects simultaneously

Q: How is my progress tracked?
A: Progress is automatically saved after each step

🔗 **Links**

📚 Documentation: https://docs.buildmate.ai
🐛 Report Issues: https://github.com/buildmate-ai/issues
💬 Support: support@buildmate.ai

✨ **Need More Help?**

Message us directly and our team will assist you!
    `;

    await ctx.reply(helpText, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🏠 Back to Menu',
              callback_data: 'back_to_menu',
            },
          ],
          [
            {
              text: '📚 Documentation',
              url: 'https://docs.buildmate.ai',
            },
          ],
        ],
      },
    });

    logger.debug('Help message sent successfully', {
      userId: from.id,
    });
  } catch (error) {
    logger.error('Error in help command', {
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

export default helpCommand;
