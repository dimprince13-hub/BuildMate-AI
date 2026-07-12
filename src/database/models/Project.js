/**
 * Project Model
 * ============================================================================
 * Represents a development project that users can build.
 * Provides methods for project-related database operations.
 *
 * Schema:
 * - id: UUID primary key
 * - user_id: Foreign key to users table
 * - name: Project name
 * - description: Project description
 * - technology_stack: JSON array of technologies
 * - difficulty_level: Difficulty level (beginner, intermediate, advanced)
 * - status: Project status (active, completed, archived)
 * - created_at: Project creation timestamp
 * - updated_at: Last update timestamp
 *
 * Usage:
 *   import Project from './models/Project.js';
 *   const project = await Project.create(projectData);
 */

import db from '../connection.js';

// ============================================================================
// Project Model
// ============================================================================

const Project = {
  /**
   * Table name
   */
  tableName: 'projects',

  /**
   * Get all projects
   * @returns {Promise<Array>} Array of project objects
   */
  async getAll() {
    const query = `
      SELECT id, user_id, name, description, technology_stack, difficulty_level, status, created_at, updated_at
      FROM ${this.tableName}
      ORDER BY created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
  },

  /**
   * Get project by ID
   * @param {string} id - Project ID (UUID)
   * @returns {Promise<Object|null>} Project object or null if not found
   */
  async getById(id) {
    const query = `
      SELECT id, user_id, name, description, technology_stack, difficulty_level, status, created_at, updated_at
      FROM ${this.tableName}
      WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  },

  /**
   * Get all projects for a user
   * @param {string} userId - User ID (UUID)
   * @returns {Promise<Array>} Array of project objects
   */
  async getByUserId(userId) {
    const query = `
      SELECT id, user_id, name, description, technology_stack, difficulty_level, status, created_at, updated_at
      FROM ${this.tableName}
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  },

  /**
   * Get projects by status
   * @param {string} status - Project status
   * @returns {Promise<Array>} Array of project objects
   */
  async getByStatus(status) {
    const query = `
      SELECT id, user_id, name, description, technology_stack, difficulty_level, status, created_at, updated_at
      FROM ${this.tableName}
      WHERE status = $1
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [status]);
    return result.rows;
  },

  /**
   * Get projects by difficulty level
   * @param {string} level - Difficulty level
   * @returns {Promise<Array>} Array of project objects
   */
  async getByDifficultyLevel(level) {
    const query = `
      SELECT id, user_id, name, description, technology_stack, difficulty_level, status, created_at, updated_at
      FROM ${this.tableName}
      WHERE difficulty_level = $1
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [level]);
    return result.rows;
  },

  /**
   * Create a new project
   * @param {Object} projectData - Project data
   * @param {string} projectData.userId - User ID
   * @param {string} projectData.name - Project name
   * @param {string} projectData.description - Project description
   * @param {Array} projectData.technologyStack - Array of technologies
   * @param {string} projectData.difficultyLevel - Difficulty level
   * @returns {Promise<Object>} Created project object
   */
  async create(projectData) {
    const query = `
      INSERT INTO ${this.tableName} (user_id, name, description, technology_stack, difficulty_level, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, user_id, name, description, technology_stack, difficulty_level, status, created_at, updated_at
    `;
    const result = await db.query(query, [
      projectData.userId,
      projectData.name,
      projectData.description,
      JSON.stringify(projectData.technologyStack || []),
      projectData.difficultyLevel || 'beginner',
      'active', // default status
    ]);
    const row = result.rows[0];
    if (row) {
      row.technology_stack = JSON.parse(row.technology_stack);
    }
    return row;
  },

  /**
   * Update project
   * @param {string} id - Project ID
   * @param {Object} projectData - Project data to update
   * @returns {Promise<Object|null>} Updated project object or null if not found
   */
  async update(id, projectData) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic update query
    if (projectData.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(projectData.name);
    }
    if (projectData.description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(projectData.description);
    }
    if (projectData.technologyStack !== undefined) {
      updates.push(`technology_stack = $${paramCount++}`);
      values.push(JSON.stringify(projectData.technologyStack));
    }
    if (projectData.difficultyLevel !== undefined) {
      updates.push(`difficulty_level = $${paramCount++}`);
      values.push(projectData.difficultyLevel);
    }
    if (projectData.status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(projectData.status);
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
      RETURNING id, user_id, name, description, technology_stack, difficulty_level, status, created_at, updated_at
    `;
    const result = await db.query(query, values);
    const row = result.rows[0];
    if (row) {
      row.technology_stack = JSON.parse(row.technology_stack);
    }
    return row || null;
  },

  /**
   * Delete project
   * @param {string} id - Project ID
   * @returns {Promise<boolean>} True if project was deleted
   */
  async delete(id) {
    const query = `DELETE FROM ${this.tableName} WHERE id = $1`;
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
  },

  /**
   * Count total projects
   * @returns {Promise<number>} Total number of projects
   */
  async count() {
    const query = `SELECT COUNT(*) as total FROM ${this.tableName}`;
    const result = await db.query(query);
    return parseInt(result.rows[0].total, 10);
  },
};

export default Project;
