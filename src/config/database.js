/**
 * Database Configuration
 * ============================================================================
 * Centralizes database configuration and connection settings.
 * Provides environment-based configuration for PostgreSQL.
 *
 * Usage:
 *   import dbConfig from './config/database.js';
 *   console.log(dbConfig.connectionString);
 */

import config from './env.js';

// ============================================================================
// Database Configuration Object
// ============================================================================

const dbConfig = {
  // Connection String for direct connection
  connectionString: `postgresql://${config.database.user}:${config.database.password}@${config.database.host}:${config.database.port}/${config.database.name}`,

  // Pool Configuration
  pool: {
    min: config.database.poolMin,
    max: config.database.poolMax,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: config.database.timeout,
  },

  // Connection Configuration
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,

  // Query Configuration
  statement_timeout: config.database.timeout,
  application_name: 'buildmate-ai',
};

// ============================================================================
// Validation
// ============================================================================

if (!dbConfig.user || !dbConfig.password) {
  throw new Error('Database credentials are not configured');
}

// ============================================================================
// Export
// ============================================================================

export default dbConfig;
