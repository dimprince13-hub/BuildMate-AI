/**
 * Progress Model
 * ============================================================================
 * Tracks user progress on projects.
 * Records user milestones, steps completed, and learning progress.
 *
 * Schema:
 * - id: UUID primary key
 * - user_id: Foreign key to users table
 * - project_id: Foreign key to projects table
 * - current_step: Current step in the project
 * - total_steps: Total steps in the project
 * - completion_percentage: Progress percentage (0-100)
 * - is_completed: Whether the project is completed
 * - started_at: When the user started the project
 * - completed_at: When the user completed the project (null if not completed)
 * - created_at: Record creation timestamp
 * - updated_at: Last update timestamp
 *
 * Usage:
 *   import Progress from './models/Progress.js';
 *   const progress = await Progress.create(progressData);
 */

import db from '../connection.js';

// ============================================================================
// Progress Model
// ============================================================================

const Progress = {
  /**
   * Table name
   */
  tableName: 'progress',

  /**
   * Get all progress records
   * @returns {Promise<Array>} Array of progress objects
   */
  async getAll() {
    const query = `
      SELECT id, user_id, project_id, current_step, total_steps, completion_percentage, is_completed, started_at, completed_at, created_at, updated_at
      FROM ${this.tableName}
      ORDER BY updated_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
  },

  /**
   * Get progress by ID
   * @param {string} id - Progress ID (UUID)
   * @returns {Promise<Object|null>} Progress object or null if not found
   */
  async getById(id) {
    const query = `
      SELECT id, user_id, project_id, current_step, total_steps, completion_percentage, is_completed, started_at, completed_at, created_at, updated_at
      FROM ${this.tableName}
      WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  },

  /**
   * Get progress for a specific user and project
   * @param {string} userId - User ID
   * @param {string} projectId - Project ID
   * @returns {Promise<Object|null>} Progress object or null if not found
   */
  async getByUserAndProject(userId, projectId) {
    const query = `
      SELECT id, user_id, project_id, current_step, total_steps, completion_percentage, is_completed, started_at, completed_at, created_at, updated_at
      FROM ${this.tableName}
      WHERE user_id = $1 AND project_id = $2
    `;
    const result = await db.query(query, [userId, projectId]);
    return result.rows[0] || null;
  },

  /**
   * Get all progress records for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of progress objects
   */
  async getByUserId(userId) {
    const query = `
      SELECT id, user_id, project_id, current_step, total_steps, completion_percentage, is_completed, started_at, completed_at, created_at, updated_at
      FROM ${this.tableName}
      WHERE user_id = $1
      ORDER BY updated_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  },

  /**
   * Get all progress records for a project
   * @param {string} projectId - Project ID
   * @returns {Promise<Array>} Array of progress objects
   */
  async getByProjectId(projectId) {
    const query = `
      SELECT id, user_id, project_id, current_step, total_steps, completion_percentage, is_completed, started_at, completed_at, created_at, updated_at
      FROM ${this.tableName}
      WHERE project_id = $1
      ORDER BY updated_at DESC
    `;
    const result = await db.query(query, [projectId]);
    return result.rows;
  },

  /**
   * Get completed projects for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of completed progress objects
   */
  async getCompletedByUserId(userId) {
    const query = `
      SELECT id, user_id, project_id, current_step, total_steps, completion_percentage, is_completed, started_at, completed_at, created_at, updated_at
      FROM ${this.tableName}
      WHERE user_id = $1 AND is_completed = TRUE
      ORDER BY completed_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  },

  /**
   * Get in-progress projects for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of in-progress progress objects
   */
  async getInProgressByUserId(userId) {
    const query = `
      SELECT id, user_id, project_id, current_step, total_steps, completion_percentage, is_completed, started_at, completed_at, created_at, updated_at
      FROM ${this.tableName}
      WHERE user_id = $1 AND is_completed = FALSE
      ORDER BY updated_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  },

  /**
   * Create a new progress record
   * @param {Object} progressData - Progress data
   * @param {string} progressData.userId - User ID
   * @param {string} progressData.projectId - Project ID
   * @param {number} progressData.totalSteps - Total steps in project
   * @returns {Promise<Object>} Created progress object
   */
  async create(progressData) {
    const query = `
      INSERT INTO ${this.tableName} (user_id, project_id, current_step, total_steps, completion_percentage, is_completed, started_at, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), NOW())
      RETURNING id, user_id, project_id, current_step, total_steps, completion_percentage, is_completed, started_at, completed_at, created_at, updated_at
    `;
    const result = await db.query(query, [
      progressData.userId,
      progressData.projectId,
      0, // current_step starts at 0
      progressData.totalSteps || 10,
      0, // completion_percentage starts at 0%
      false, // is_completed starts as false
    ]);
    return result.rows[0];
  },

  /**
   * Update progress
   * @param {string} id - Progress ID
   * @param {Object} progressData - Progress data to update
   * @returns {Promise<Object|null>} Updated progress object or null if not found
   */
  async update(id, progressData) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic update query
    if (progressData.currentStep !== undefined) {
      updates.push(`current_step = $${paramCount++}`);
      values.push(progressData.currentStep);
    }
    if (progressData.totalSteps !== undefined) {
      updates.push(`total_steps = $${paramCount++}`);
      values.push(progressData.totalSteps);
    }
    if (progressData.completionPercentage !== undefined) {
      updates.push(`completion_percentage = $${paramCount++}`);
      values.push(progressData.completionPercentage);
    }
    if (progressData.isCompleted !== undefined) {
      updates.push(`is_completed = $${paramCount++}`);
      values.push(progressData.isCompleted);
      // Set completed_at when marking as complete
      if (progressData.isCompleted === true) {
        updates.push(`completed_at = NOW()`);
      }
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
      RETURNING id, user_id, project_id, current_step, total_steps, completion_percentage, is_completed, started_at, completed_at, created_at, updated_at
    `;
    const result = await db.query(query, values);
    return result.rows[0] || null;
  },

  /**
   * Delete progress record
   * @param {string} id - Progress ID
   * @returns {Promise<boolean>} True if progress was deleted
   */
  async delete(id) {
    const query = `DELETE FROM ${this.tableName} WHERE id = $1`;
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
  },

  /**
   * Count total progress records
   * @returns {Promise<number>} Total number of progress records
   */
  async count() {
    const query = `SELECT COUNT(*) as total FROM ${this.tableName}`;
    const result = await db.query(query);
    return parseInt(result.rows[0].total, 10);
  },
};

export default Progress;
