import express from 'express';
import { body, validationResult, query } from 'express-validator';
import asyncHandler from 'express-async-handler';
import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import { protect, authorize, checkPermission, checkWardAccess } from '../middleware/auth.js';
import { sendComplaintUpdateEmail } from '../utils/email.js';
import { sendComplaintUpdateSMS } from '../utils/sms.js';

const router = express.Router();

// @desc    Get user's complaints
// @route   GET /api/complaints
// @access  Private
router.get('/', [
  protect,
  query('status').optional().isString(),
  query('category').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('page').optional().isInt({ min: 1 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { status, category, limit = 20, page = 1 } = req.query;
  const skip = (page - 1) * limit;

  const options = {};
  if (status) {
    options.status = status;
  }
  if (category) {
    options.category = category;
  }

  const complaints = await Complaint.findByComplainant(req.user.id, options)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Complaint.countDocuments({
    complainant: req.user.id,
    ...(status && { status }),
    ...(category && { category })
  });

  res.json({
    success: true,
    data: {
      complaints,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
        totalItems: total
      }
    }
  });
}));

// @desc    Get complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('complainant', 'firstName lastName mobileNumber email')
    .populate('assignedTo', 'firstName lastName')
    .populate('updates.updatedBy', 'firstName lastName');

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  // Check if user can access this complaint
  if (req.user.role === 'citizen' && complaint.complainant.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Access denied');
  }

  res.json({
    success: true,
    data: { complaint }
  });
}));

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private
router.post('/', [
  protect,
  checkPermission('view_complaints'),
  body('subject').trim().isLength({ min: 5, max: 200 }).withMessage('Subject must be between 5 and 200 characters'),
  body('description').trim().isLength({ min: 20, max: 2000 }).withMessage('Description must be between 20 and 2000 characters'),
  body('category').isIn(['infrastructure', 'utilities', 'sanitation', 'traffic', 'noise', 'environment', 'security', 'corruption', 'service_delivery', 'other']).withMessage('Invalid category'),
  body('location.address').notEmpty().withMessage('Location address is required'),
  body('location.ward').isInt({ min: 1, max: 35 }).withMessage('Ward must be between 1 and 35'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('isUrgent').optional().isBoolean(),
  body('isAnonymous').optional().isBoolean()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const {
    subject,
    description,
    category,
    subcategory,
    location,
    priority = 'medium',
    isUrgent = false,
    urgentReason,
    isAnonymous = false,
    attachments
  } = req.body;

  // Create complaint
  const complaint = await Complaint.create({
    complainant: req.user.id,
    subject,
    description,
    category,
    subcategory,
    location: {
      ...location,
      municipality: req.user.address.municipality,
      district: req.user.address.district,
      province: req.user.address.province
    },
    priority,
    isUrgent,
    urgentReason,
    isAnonymous,
    attachments: attachments || []
  });

  // Populate complainant details
  await complaint.populate('complainant', 'firstName lastName mobileNumber email');

  res.status(201).json({
    success: true,
    message: 'Complaint submitted successfully',
    data: { complaint }
  });
}));

// @desc    Update complaint status (Staff/Admin only)
// @route   PUT /api/complaints/:id/status
// @access  Private
router.put('/:id/status', [
  protect,
  authorize('admin', 'staff'),
  checkPermission('manage_complaints'),
  body('status').isIn(['acknowledged', 'in_progress', 'under_investigation', 'resolved', 'closed', 'rejected']).withMessage('Invalid status'),
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Update message is required'),
  body('isInternal').optional().isBoolean()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { status, message, isInternal = false, attachments } = req.body;

  const complaint = await Complaint.findById(req.params.id)
    .populate('complainant', 'firstName lastName email mobileNumber');

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  const oldStatus = complaint.status;

  // Add update
  await complaint.addUpdate(status, message, req.user.id, isInternal, attachments);

  // Update progress based on status
  const progressMap = {
    acknowledged: 20,
    in_progress: 40,
    under_investigation: 60,
    resolved: 100,
    closed: 100,
    rejected: 100
  };

  complaint.progress = progressMap[status] || complaint.progress;

  // Set resolution date if resolved
  if (status === 'resolved') {
    complaint.resolvedAt = new Date();
  }

  await complaint.save();

  // Send notifications to complainant (if not internal update)
  if (!isInternal && oldStatus !== status) {
    try {
      if (complaint.complainant.email) {
        await sendComplaintUpdateEmail(complaint.complainant, complaint, {
          status,
          message,
          updatedAt: new Date()
        });
      }
      if (complaint.complainant.mobileNumber) {
        await sendComplaintUpdateSMS(complaint.complainant.mobileNumber, complaint, {
          status,
          message,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  res.json({
    success: true,
    message: 'Complaint status updated successfully',
    data: { complaint }
  });
}));

// @desc    Assign complaint to staff
// @route   PUT /api/complaints/:id/assign
// @access  Private
router.put('/:id/assign', [
  protect,
  authorize('admin', 'staff'),
  checkPermission('manage_complaints'),
  body('assignedTo').notEmpty().withMessage('Assigned user ID is required'),
  body('department').isIn(['administration', 'infrastructure', 'utilities', 'sanitation', 'security', 'other']).withMessage('Invalid department')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { assignedTo, department } = req.body;

  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  // Verify assigned user exists and is staff
  const assignedUser = await User.findById(assignedTo);
  if (!assignedUser || !['staff', 'admin'].includes(assignedUser.role)) {
    res.status(400);
    throw new Error('Invalid staff member');
  }

  await complaint.assignTo(assignedTo, department);

  res.json({
    success: true,
    message: 'Complaint assigned successfully',
    data: { complaint }
  });
}));

// @desc    Add attachments to complaint
// @route   POST /api/complaints/:id/attachments
// @access  Private
router.post('/:id/attachments', [
  protect,
  body('attachments').isArray().withMessage('Attachments array is required'),
  body('attachments.*.name').notEmpty().withMessage('Attachment name is required'),
  body('attachments.*.type').isIn(['image', 'video', 'document', 'audio']).withMessage('Invalid attachment type'),
  body('attachments.*.file').isObject().withMessage('File object is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  // Check access permissions
  if (req.user.role === 'citizen' && complaint.complainant.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Access denied');
  }

  const { attachments } = req.body;

  // Add attachments
  for (const attachment of attachments) {
    await complaint.addAttachment(attachment);
  }

  res.json({
    success: true,
    message: 'Attachments added successfully',
    data: { complaint }
  });
}));

// @desc    Resolve complaint
// @route   POST /api/complaints/:id/resolve
// @access  Private
router.post('/:id/resolve', [
  protect,
  authorize('admin', 'staff'),
  checkPermission('manage_complaints'),
  body('resolution.description').trim().isLength({ min: 10, max: 1000 }).withMessage('Resolution description is required'),
  body('resolution.actions').isArray().withMessage('Actions array is required'),
  body('resolution.cost.amount').optional().isFloat({ min: 0 }),
  body('resolution.beforePhotos').optional().isArray(),
  body('resolution.afterPhotos').optional().isArray()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { resolution } = req.body;

  const complaint = await Complaint.findById(req.params.id)
    .populate('complainant', 'firstName lastName email mobileNumber');

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  await complaint.resolve(resolution, req.user.id);

  // Send notification
  try {
    if (complaint.complainant.email) {
      await sendComplaintUpdateEmail(complaint.complainant, complaint, {
        status: 'resolved',
        message: 'Your complaint has been resolved successfully.',
        updatedAt: new Date()
      });
    }
    if (complaint.complainant.mobileNumber) {
      await sendComplaintUpdateSMS(complaint.complainant.mobileNumber, complaint, {
        status: 'resolved',
        message: 'Your complaint has been resolved successfully.',
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error('Failed to send notification:', error);
  }

  res.json({
    success: true,
    message: 'Complaint resolved successfully',
    data: { complaint }
  });
}));

// @desc    Add feedback to complaint
// @route   POST /api/complaints/:id/feedback
// @access  Private
router.post('/:id/feedback', [
  protect,
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 }),
  body('isAnonymous').optional().isBoolean()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { rating, comment, isAnonymous = false } = req.body;

  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  if (complaint.complainant.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Access denied');
  }

  if (complaint.status !== 'resolved') {
    res.status(400);
    throw new Error('Can only provide feedback for resolved complaints');
  }

  await complaint.addFeedback(rating, comment, isAnonymous);

  res.json({
    success: true,
    message: 'Feedback submitted successfully',
    data: { complaint }
  });
}));

// @desc    Get complaints for staff review
// @route   GET /api/complaints/staff/pending
// @access  Private
router.get('/staff/pending', [
  protect,
  authorize('admin', 'staff'),
  checkPermission('manage_complaints'),
  query('status').optional().isString(),
  query('ward').optional().isInt({ min: 1, max: 35 }),
  query('category').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('page').optional().isInt({ min: 1 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { status, ward, category, limit = 20, page = 1 } = req.query;
  const skip = (page - 1) * limit;

  let query = {
    status: { $in: ['pending', 'acknowledged', 'in_progress', 'under_investigation'] }
  };

  if (status) {
    query.status = status;
  }
  if (category) {
    query.category = category;
  }

  // Filter by ward if specified
  if (ward && req.user.role !== 'admin') {
    query['location.ward'] = parseInt(ward);
  }

  const complaints = await Complaint.find(query)
    .populate('complainant', 'firstName lastName mobileNumber email')
    .populate('assignedTo', 'firstName lastName')
    .sort({ priority: -1, isUrgent: -1, submittedAt: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Complaint.countDocuments(query);

  res.json({
    success: true,
    data: {
      complaints,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
        totalItems: total
      }
    }
  });
}));

// @desc    Get urgent complaints
// @route   GET /api/complaints/staff/urgent
// @access  Private
router.get('/staff/urgent', [
  protect,
  authorize('admin', 'staff'),
  checkPermission('manage_complaints')
], asyncHandler(async (req, res) => {
  const complaints = await Complaint.findUrgent();

  res.json({
    success: true,
    data: { complaints }
  });
}));

// @desc    Get complaints by ward
// @route   GET /api/complaints/ward/:ward
// @access  Private
router.get('/ward/:ward', [
  protect,
  authorize('admin', 'staff'),
  checkPermission('manage_complaints'),
  checkWardAccess,
  query('status').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('page').optional().isInt({ min: 1 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { status, limit = 20, page = 1 } = req.query;
  const skip = (page - 1) * limit;
  const ward = parseInt(req.params.ward);

  let query = { 'location.ward': ward };

  if (status) {
    query.status = status;
  }

  const complaints = await Complaint.findByWard(ward)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Complaint.countDocuments(query);

  res.json({
    success: true,
    data: {
      complaints,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
        totalItems: total
      }
    }
  });
}));

// @desc    Get complaint statistics
// @route   GET /api/complaints/stats
// @access  Private
router.get('/stats', [
  protect,
  authorize('admin', 'staff'),
  checkPermission('view_analytics'),
  query('ward').optional().isInt({ min: 1, max: 35 }),
  query('period').optional().isIn(['day', 'week', 'month', 'year'])
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { ward, period = 'month' } = req.query;

  let dateFilter = {};
  const now = new Date();

  switch (period) {
    case 'day':
      dateFilter = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
      break;
    case 'week':
      dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
      break;
    case 'month':
      dateFilter = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
      break;
    case 'year':
      dateFilter = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
      break;
  }

  let matchQuery = { submittedAt: dateFilter };

  if (ward) {
    matchQuery['location.ward'] = parseInt(ward);
  }

  const stats = await Complaint.getStatistics();

  // Get category-wise statistics
  const categoryStats = await Complaint.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgResolutionTime: {
          $avg: {
            $cond: [
              { $ne: ['$resolvedAt', null] },
              { $divide: [{ $subtract: ['$resolvedAt', '$submittedAt'] }, 1000 * 60 * 60 * 24] },
              null
            ]
          }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Get priority-wise statistics
  const priorityStats = await Complaint.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    data: {
      stats,
      categoryStats,
      priorityStats,
      period,
      ward: ward || 'all'
    }
  });
}));

// @desc    Escalate complaint
// @route   POST /api/complaints/:id/escalate
// @access  Private
router.post('/:id/escalate', [
  protect,
  authorize('admin', 'staff'),
  checkPermission('manage_complaints'),
  body('escalatedTo').isIn(['supervisor', 'department_head', 'municipality', 'province', 'central']).withMessage('Invalid escalation level'),
  body('reason').trim().isLength({ min: 10, max: 500 }).withMessage('Escalation reason is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { escalatedTo, reason } = req.body;

  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  await complaint.escalate(req.user.id, escalatedTo, reason);

  res.json({
    success: true,
    message: 'Complaint escalated successfully',
    data: { complaint }
  });
}));

export default router;
