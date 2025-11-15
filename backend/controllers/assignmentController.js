// backend/controllers/assignmentController.js

import asyncHandler from 'express-async-handler';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Student from '../models/Student.js';
import { cloudinary } from '../config/cloudinary.js';

/**
 * @desc    Create a new assignment
 * @route   POST /api/v1/assignments
 * @access  Private (Teacher)
 */
const createAssignment = asyncHandler(async (req, res) => {
  const { title, instructions, dueDate, classLevel, subject } = req.body;
  if (!title || !instructions || !dueDate || !classLevel || !subject) {
    res.status(400); throw new Error('Please fill in all required fields');
  }
  const assignment = await Assignment.create({
    title, instructions, dueDate, classLevel, subject,
    teacher: req.user._id, school: req.user.school,
  });
  res.status(201).json(assignment);
});

/**
 * @desc    Get assignments for the logged-in teacher
 * @route   GET /api/v1/assignments/my-assignments
 * @access  Private (Teacher)
 */
const getAssignmentsForTeacher = asyncHandler(async (req, res) => {
  const assignments = await Assignment.find({ teacher: req.user._id })
    .populate('classLevel', 'name').populate('subject', 'name').sort({ createdAt: -1 });
  res.status(200).json(assignments);
});

// --- (Student-facing functions are unchanged) ---
const getAssignmentsForStudent = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userAccount: req.user._id });
  if (!student) { return res.status(404).json({ message: 'Student profile not found.' }); }
  if (!student.classLevel) { return res.status(200).json([]); }
  const assignments = await Assignment.find({ school: req.user.school, classLevel: student.classLevel, })
    .populate('subject', 'name').populate('classLevel', 'name').select('-instructions').sort({ dueDate: 1 });
  const submissions = await Submission.find({ student: student._id }).select('assignment status');
  const assignmentData = assignments.map(a => {
    const submission = submissions.find(s => s.assignment.toString() === a._id.toString());
    return { ...a.toObject(), submissionStatus: submission ? submission.status : 'Pending' };
  });
  res.status(200).json(assignmentData);
});

const getAssignmentByIdForStudent = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate('classLevel', 'name').populate('subject', 'name').populate('teacher', 'name');
  if (!assignment || assignment.school.toString() !== req.user.school.toString()) {
    res.status(404); throw new Error('Assignment not found');
  }
  const student = await Student.findOne({ userAccount: req.user._id });
  const submission = await Submission.findOne({
    assignment: req.params.id,
    student: student._id,
  });
  res.status(200).json({ assignment, submission });
});

const submitAssignment = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400); throw new Error('No file uploaded.');
  }
  const { path, public_id } = req.file;
  const assignmentId = req.params.id;
  const student = await Student.findOne({ userAccount: req.user._id });
  if (!student) {
    res.status(404); throw new Error('Student profile not found');
  }
  const existingSubmission = await Submission.findOne({
    assignment: assignmentId,
    student: student._id,
  });
  if (existingSubmission) {
    if (existingSubmission.status === 'Graded') {
      res.status(400); throw new Error('Cannot resubmit a graded assignment.');
    }
    if (existingSubmission.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(existingSubmission.cloudinaryPublicId, { resource_type: "raw" });
    }
    existingSubmission.fileUrl = path;
    existingSubmission.cloudinaryPublicId = public_id;
    existingSubmission.submittedOn = Date.now();
    existingSubmission.status = 'Submitted';
    const updatedSubmission = await existingSubmission.save();
    res.status(200).json(updatedSubmission);
  } else {
    const submission = await Submission.create({
      assignment: assignmentId, student: student._id, school: req.user.school,
      fileUrl: path, cloudinaryPublicId: public_id, status: 'Submitted',
    });
    res.status(201).json(submission);
  }
});

const getSubmissionsForAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment || assignment.teacher.toString() !== req.user._id.toString()) {
    res.status(404); throw new Error('Assignment not found or you are not authorized');
  }
  const submissions = await Submission.find({ assignment: req.params.id })
    .populate('student', 'name admissionNumber').sort({ submittedOn: 1 });
  res.status(200).json(submissions);
});

const gradeSubmission = asyncHandler(async (req, res) => {
  const { grade, feedback } = req.body;
  const submission = await Submission.findById(req.params.id).populate('assignment');
  if (!submission) {
    res.status(404); throw new Error('Submission not found');
  }
  if (submission.assignment.teacher.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('You are not authorized to grade this submission');
  }
  submission.status = 'Graded';
  submission.grade = grade;
  submission.feedback = feedback || '';
  const updatedSubmission = await submission.save();
  res.status(200).json(updatedSubmission);
});

const getAssignmentsForParent = asyncHandler(async (req, res) => {
  const children = await Student.find({ parent: req.user._id }).select('_id name classLevel');
  if (!children || children.length === 0) {
    return res.status(200).json([]);
  }
  const classIds = children.map(child => child.classLevel);
  const assignments = await Assignment.find({ school: req.user.school, classLevel: { $in: classIds }, })
    .populate('subject', 'name').populate('classLevel', 'name');
  const childIds = children.map(child => child._id);
  const submissions = await Submission.find({ student: { $in: childIds } });
  const results = children.map(child => {
    const childAssignments = assignments.filter(a => a.classLevel._id.toString() === child.classLevel.toString());
    const assignmentsWithStatus = childAssignments.map(a => {
      const submission = submissions.find(s => 
        s.assignment.toString() === a._id.toString() && 
        s.student.toString() === child._id.toString()
      );
      return { ...a.toObject(), submissionStatus: submission ? submission.status : 'Pending', grade: submission ? submission.grade : null };
    });
    return { childName: child.name, childId: child._id, assignments: assignmentsWithStatus };
  });
  res.status(200).json(results);
});


// --- NEW FUNCTIONS ---

/**
 * @desc    Get a single assignment for the teacher (for editing)
 * @route   GET /api/v1/assignments/:id
 * @access  Private (Teacher)
 */
const getAssignmentByIdForTeacher = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  // Security check: is this the teacher who created it?
  if (assignment.teacher.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this assignment');
  }

  res.status(200).json(assignment);
});

/**
 * @desc    Update an assignment
 * @route   PUT /api/v1/assignments/:id
 * @access  Private (Teacher)
 */
const updateAssignment = asyncHandler(async (req, res) => {
  const { title, instructions, dueDate, classLevel, subject } = req.body;
  
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  // Security check
  if (assignment.teacher.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this assignment');
  }

  assignment.title = title || assignment.title;
  assignment.instructions = instructions || assignment.instructions;
  assignment.dueDate = dueDate || assignment.dueDate;
  assignment.classLevel = classLevel || assignment.classLevel;
  assignment.subject = subject || assignment.subject;

  const updatedAssignment = await assignment.save();
  res.status(200).json(updatedAssignment);
});

/**
 * @desc    Delete an assignment
 * @route   DELETE /api/v1/assignments/:id
 * @access  Private (Teacher)
 */
const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  // Security check
  if (assignment.teacher.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this assignment');
  }

  // 1. Delete all submissions for this assignment
  await Submission.deleteMany({ assignment: req.params.id });
  
  // 2. Delete the assignment itself
  await assignment.deleteOne();

  res.status(200).json({ message: 'Assignment and all submissions deleted' });
});


// --- EXPORT BLOCK (UPDATED) ---
export {
  createAssignment,
  getAssignmentsForTeacher,
  getAssignmentsForStudent,
  getAssignmentByIdForStudent,
  submitAssignment,
  getSubmissionsForAssignment,
  gradeSubmission,
  getAssignmentsForParent,
  getAssignmentByIdForTeacher, // <-- ADDED
  updateAssignment, // <-- ADDED
  deleteAssignment, // <-- ADDED
};