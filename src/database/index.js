/**
 * Database Module
 * ============================================================================
 * Central export point for all database-related modules.
 * Provides easy access to connection and models.
 *
 * Usage:
 *   import { db, User, Project, Progress } from './database/index.js';
 *   const user = await User.getById(userId);
 *   const isHealthy = await db.checkHealth();
 */

import db from './connection.js';
import User from './models/User.js';
import Project from './models/Project.js';
import Progress from './models/Progress.js';

// ============================================================================
// Export
// ============================================================================

export {
  db,
  User,
  Project,
  Progress,
};

export default {
  db,
  User,
  Project,
  Progress,
};
