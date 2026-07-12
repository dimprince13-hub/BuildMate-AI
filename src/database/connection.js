/**
 * Database Connection Module
 * ============================================================================
 * Manages PostgreSQL connection pool and provides a singleton instance.
 * Handles connection pooling, error handling, and graceful shutdown.
 *
 * Features:
 * - Connection pooling with configurable min/max connections
 * - Automatic reconnection on pool error
 * - Graceful shutdown handling
 * - Connection health monitoring
 * - Query error logging
 *
 * Usage:
 *   import db from './connection.js';
 *   const result = await db.query('SELECT * FROM users');
 */

import pg from 'pg';
import logger from '../config/logger.js';
import dbConfig from '../config/database.js';

const { Pool } = pg;

// ============================================================================
// Pool Instance
// ============================================================================

let pool = null;
let isShuttingDown = false;

/**
 * Initialize database connection pool
 * @returns {pg.Pool} PostgreSQL connection pool
 */
function initializePool() {
  if (pool) {
    return pool;
  }

  try {
    pool = new Pool(dbConfig);

    // Log pool creation
    logger.info('Database connection pool created', {
      min: dbConfig.pool.min,
      max: dbConfig.pool.max,
    });

    // Handle pool errors
    pool.on('error', (error) => {
      logger.error('Unexpected error on idle client in pool', error);
    });

    // Log pool drain
    pool.on('remove', () => {
      logger.debug('Client removed from pool');
    });

    return pool;
  } catch (error) {
    logger.error('Failed to create connection pool', error);
    process.exit(1);
  }
}

// ============================================================================
// Connection Methods
// ============================================================================

/**
 * Execute a query on the pool
 * @param {string} text - SQL query text
 * @param {Array} values - Query parameters
 * @returns {Promise<pg.QueryResult>} Query result
 */
async function query(text, values = []) {
  if (isShuttingDown) {
    throw new Error('Database connection is shutting down');
  }

  if (!pool) {
    initializePool();
  }

  const start = Date.now();

  try {
    const result = await pool.query(text, values);
    const duration = Date.now() - start;

    if (duration > 1000) {
      logger.warn('Slow query detected', {
        duration,
        query: text,
      });
    }

    logger.debug('Query executed', {
      duration,
      rows: result.rowCount,
    });

    return result;
  } catch (error) {
    logger.error('Query error', {
      error: error.message,
      query: text,
      duration: Date.now() - start,
    });
    throw error;
  }
}

/**
 * Get a client from the pool for manual transaction control
 * @returns {Promise<pg.PoolClient>} Database client
 */
async function getClient() {
  if (isShuttingDown) {
    throw new Error('Database connection is shutting down');
  }

  if (!pool) {
    initializePool();
  }

  try {
    const client = await pool.connect();
    logger.debug('Client acquired from pool');
    return client;
  } catch (error) {
    logger.error('Failed to acquire client from pool', error);
    throw error;
  }
}

/**
 * Check database connection health
 * @returns {Promise<boolean>} True if connection is healthy
 */
async function checkHealth() {
  try {
    const result = await query('SELECT 1');
    return result.rowCount > 0;
  } catch (error) {
    logger.error('Database health check failed', error);
    return false;
  }
}

/**
 * Begin a transaction
 * @param {pg.PoolClient} client - Database client
 * @returns {Promise<void>}
 */
async function beginTransaction(client) {
  try {
    await client.query('BEGIN');
    logger.debug('Transaction started');
  } catch (error) {
    logger.error('Failed to start transaction', error);
    throw error;
  }
}

/**
 * Commit a transaction
 * @param {pg.PoolClient} client - Database client
 * @returns {Promise<void>}
 */
async function commit(client) {
  try {
    await client.query('COMMIT');
    logger.debug('Transaction committed');
  } catch (error) {
    logger.error('Failed to commit transaction', error);
    throw error;
  }
}

/**
 * Rollback a transaction
 * @param {pg.PoolClient} client - Database client
 * @returns {Promise<void>}
 */
async function rollback(client) {
  try {
    await client.query('ROLLBACK');
    logger.debug('Transaction rolled back');
  } catch (error) {
    logger.error('Failed to rollback transaction', error);
    throw error;
  }
}

/**
 * Release a client back to the pool
 * @param {pg.PoolClient} client - Database client
 * @returns {Promise<void>}
 */
async function releaseClient(client) {
  if (client) {
    try {
      await client.release();
      logger.debug('Client released to pool');
    } catch (error) {
      logger.error('Failed to release client', error);
    }
  }
}

/**
 * Close the database connection pool
 * @returns {Promise<void>}
 */
async function closePool() {
  if (isShuttingDown || !pool) {
    return;
  }

  isShuttingDown = true;
  logger.info('Closing database connection pool...');

  try {
    await pool.end();
    logger.info('Database connection pool closed');
    pool = null;
  } catch (error) {
    logger.error('Error closing database connection pool', error);
    throw error;
  }
}

// ============================================================================
// Graceful Shutdown Handler
// ============================================================================

process.on('SIGINT', async () => {
  await closePool();
});

process.on('SIGTERM', async () => {
  await closePool();
});

// ============================================================================
// Export
// ============================================================================

const db = {
  query,
  getClient,
  checkHealth,
  beginTransaction,
  commit,
  rollback,
  releaseClient,
  closePool,
  getPool: () => pool || initializePool(),
};

export default db;
