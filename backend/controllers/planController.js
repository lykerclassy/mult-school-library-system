// backend/controllers/planController.js

import asyncHandler from 'express-async-handler';
import Plan from '../models/Plan.js';

/**
 * @desc    Create a new subscription plan
 * @route   POST /api/v1/plans
 * @access  Private (Developer)
 */
const createPlan = asyncHandler(async (req, res) => {
  const { name, price, studentLimit, teacherLimit, features } = req.body;

  const planExists = await Plan.findOne({ name });
  if (planExists) {
    res.status(400);
    throw new Error('A plan with this name already exists');
  }

  const plan = await Plan.create({
    name,
    price,
    studentLimit,
    teacherLimit,
    features: features || [],
  });

  res.status(201).json(plan);
});

/**
 * @desc    Get all subscription plans
 * @route   GET /api/v1/plans
 * @access  Private (Developer)
 */
const getPlans = asyncHandler(async (req, res) => {
  const plans = await Plan.find({});
  res.status(200).json(plans);
});

/**
 * @desc    Delete a plan
 * @route   DELETE /api/v1/plans/:id
 * @access  Private (Developer)
 */
const deletePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findById(req.params.id);

  if (plan) {
    // TODO: Check if any schools are subscribed to this plan before deleting
    await plan.deleteOne();
    res.status(200).json({ message: 'Plan removed' });
  } else {
    res.status(404);
    throw new Error('Plan not found');
  }
});

export { createPlan, getPlans, deletePlan };