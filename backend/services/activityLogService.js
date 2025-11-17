// backend/services/activityLogService.js

import ActivityLog from '../models/ActivityLog.js';

/**
 * @desc Logs an action performed by a user.
 * @param {string} userId - The ID of the user performing the action.
 * @param {string} schoolId - The ID of the school (or null).
 * @param {string} action - A short code (e.g., "USER_LOGIN").
 * @param {string} details - A human-readable description.
 * @param {string} [ipAddress] - Optional IP address.
 */
const logActivity = async (userId, schoolId, action, details, ipAddress = '') => {
  try {
    await ActivityLog.create({
      user: userId,
      school: schoolId || null,
      action,
      details,
      ipAddress,
    });
  } catch (error) {
    // We log the error but don't stop the main request
    console.error('Failed to log activity:', error);
  }
};

export { logActivity };