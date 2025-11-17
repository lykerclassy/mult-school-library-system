// backend/controllers/activityLogController.js

import asyncHandler from 'express-async-handler';
import ActivityLog from '../models/ActivityLog.js';
import DeliveryLog from '../models/DeliveryLog.js'; // <-- 1. IMPORT

/**
 * @desc    Get all activity logs (paginated)
 * @route   GET /api/v1/logs/activity
 * @access  Private (Developer)
 */
const getAllLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const query = {};
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { createdAt: -1 },
    populate: [
      { path: 'user', select: 'name email role' },
      { path: 'school', select: 'name' }
    ],
  };

  const logs = await ActivityLog.paginate(query, options);
  res.status(200).json(logs);
});

/**
 * @desc    Get all delivery logs (Email/SMS)
 * @route   GET /api/v1/logs/delivery
 * @access  Private (Developer)
 */
const getDeliveryLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const query = {};
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { createdAt: -1 },
    populate: [
      { path: 'user', select: 'name email role' },
      { path: 'school', select: 'name' }
    ],
  };

  const logs = await DeliveryLog.paginate(query, options);
  res.status(200).json(logs);
});


export { getAllLogs, getDeliveryLogs };