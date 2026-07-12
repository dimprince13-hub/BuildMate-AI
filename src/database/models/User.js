/**
 * User Model
 * ============================================================================
 * Represents a user in the system.
 * Provides methods for user-related database operations.
 *
 * Schema:
 * - id: UUID primary key
 * - telegram_id: Telegram user ID (unique)
 * - username: Telegram username
 * - first_name: User's first name
 * - last_name: User's last name
 * - email: User's email (optional)
 * - is_active: Account active status
 * - created_at: Account creation timestamp
 * - updated_at: Last update timestamp
 *
 * Usage:
 *   import User from './models/User.js';
 *   const user = await User.create(userData);
 */

import db from '../connection.js';

// ============================================================================
// User Model
// ============================================================================

const User = {
  /**
   * Table name
   */
  tableName: 'users',

  /**
   * Get all users
   * @returns {Promise<Array>} Array of user objects
   */
  async getAll() {
    const query = `
      SELECT id, telegram_id, username, first_name, last_name, email, is_active, created_at, updated_at
      FROM ${this.tableName}
      ORDER BY created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
  },

  /**
   * Get user by ID
   * @param {string} id - User ID (UUID)
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async getById(id) {
    const query = `
      SELECT id, telegram_id, username, first_name, last_name, email, is_active, created_at, updated_at
      FROM ${this.tableName}
      WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  },

  /**
   * Get user by Telegram ID
   * @param {number} telegramId - Telegram user ID
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async getByTelegramId(telegramId) {
    const query = `
      SELECT id, telegram_id, username, first_name, last_name, email, is_active, created_at, updated_at
      FROM ${this.tableName}
      WHERE telegram_id = $1
    `;
    const result = await db.query(query, [telegramId]);
    return result.rows[0] || null;
  },

  /**
   * Get user by username
   * @param {string} username - Telegram username
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async getByUsername(username) {
    const query = `
      SELECT id, telegram_id, username, first_name, last_name, email, is_active, created_at, updated_at
      FROM ${this.tableName}
      WHERE username = $1
    `;
    const result = await db.query(query, [username]);
    return result.rows[0] || null;
  },

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async getByEmail(email) {
    const query = `
      SELECT id, telegram_id, username, first_name, last_name, email, is_active, created_at, updated_at
      FROM ${this.tableName}
      WHERE email = $1
    `;
    const result = await db.query(query, [email]);
    return result.rows[0] || null;
  },

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @param {number} userData.telegramId - Telegram user ID
   * @param {string} userData.username - Telegram username
   * @param {string} userData.firstName - First name
   * @param {string} userData.lastName - Last name (optional)
   * @param {string} userData.email - Email (optional)
   * @returns {Promise<Object>} Created user object
   */
  async create(userData) {
    const query = `
      INSERT INTO ${this.tableName} (telegram_id, username, first_name, last_name, email, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, telegram_id, username, first_name, last_name, email, is_active, created_at, updated_at
    `;
    const result = await db.query(query, [
      userData.telegramId,
      userData.username,
      userData.firstName,
      userData.lastName || null,
      userData.email || null,
      true, // is_active
    ]);
    return result.rows[0];
  },

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise<Object|null>} Updated user object or null if not found
   */
  async update(id, userData) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic update query
    if (userData.username !== undefined) {
      updates.push(`username = $${paramCount++}`);
      values.push(userData.username);
    }
    if (userData.firstName !== undefined) {
      updates.push(`first_name = $${paramCount++}`);
      values.push(userData.firstName);
    }
    if (userData.lastName !== undefined) {
      updates.push(`last_name = $${paramCount++}`);
      values.push(userData.lastName);
    }
    if (userData.email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(userData.email);
    }
    if (userData.isActive !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(userData.isActive);
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE ${this.tableName}
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, telegram_id, username, first_name, last_name, email, is_active, created_at, updated_at
    `;
    const result = await db.query(query, values);
    return result.rows[0] || null;
  },

  /**
   * Delete user (soft delete - mark as inactive)
   * @param {string} id - User ID
   * @returns {Promise<boolean>} True if user was deleted
   */
  async delete(id) {
    const query = `
      UPDATE ${this.tableName}
      SET is_active = FALSE, updated_at = NOW()
      WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
  },

  /**
   * Count total users
   * @returns {Promise<number>} Total number of users
   */
  async count() {
    const query = `SELECT COUNT(*) as total FROM ${this.tableName}`;
    const result = await db.query(query);
    return parseInt(result.rows[0].total, 10);
  },
};

export default User;
