import express from 'express';
import mongoose from 'mongoose';
import { body, validationResult, query } from 'express-validator';
import asyncHandler from 'express-async-handler';
import Application from '../models/Application.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import { protect, authorize, checkPermission, checkWardAccess } from '../middleware/auth.js';
import { sendApplicationStatusEmail } from '../utils/email.js';
import { sendApplicationStatusSMS } from '../utils/sms.js';

const router = express.Router();

// In-memory applications storage for development when MongoDB is not available
const inMemoryApplications = new Map();

// @desc    Get user's applications
// @route   GET /api/applications
// @access  Private
router.get('/', [
  protect,
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

  const options = {};
  if (status) {
    options.status = status;
  }

  try {
    // Try to use MongoDB if available
    const applications = await Application.findByApplicant(req.user.id, options)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments({
      applicant: req.user.id,
      ...(status && { status })
    });

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
          totalItems: total
        }
      }
    });
  } catch (error) {
    // MongoDB not available, use in-memory storage
    console.log('MongoDB not available, using in-memory storage for applications list');
    
    let applications = Array.from(inMemoryApplications.values())
      .filter(app => app.applicant === req.user.id)
      .filter(app => !status || app.status === status);

    const total = applications.length;
    applications = applications
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
          totalItems: total
        }
      }
    });
  }
}));

// @desc    Get application by ID
// @route   GET /api/applications/:id
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('service', 'title nepaliTitle category fee processingTime')
    .populate('applicant', 'firstName lastName mobileNumber email')
    .populate('assignedTo', 'firstName lastName');

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  // Check if user can access this application
  if (req.user.role === 'citizen' && application.applicant.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Access denied');
  }

  res.json({
    success: true,
    data: { application }
  });
}));

// @desc    Create new application
// @route   POST /api/applications
// @access  Private
router.post('/', [
  protect,
  // Citizens should be able to apply even if permissions array is empty in dev
  (req, res, next) => {
    if (req.user?.role === 'citizen') return next();
    return checkPermission('apply_services')(req, res, next);
  },
  body('serviceId').notEmpty().withMessage('Service ID is required'),
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('purpose').trim().isLength({ min: 10, max: 1000 }).withMessage('Purpose must be between 10 and 1000 characters'),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('formData').optional().isObject(),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
  body('isUrgent').optional().isBoolean()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const {
    serviceId,
    title,
    purpose,
    description,
    formData,
    priority = 'normal',
    isUrgent = false,
    urgentReason
  } = req.body;

  try {
    // Try to use MongoDB if available
    // Find the service by Mongo _id or by serviceId code
    let service;
    if (mongoose.Types.ObjectId.isValid(serviceId)) {
      service = await Service.findById(serviceId);
    }
    if (!service) {
      service = await Service.findOne({ serviceId: serviceId.toString().toUpperCase() });
    }
    if (!service) {
      res.status(404);
      throw new Error('Service not found');
    }

    if (!service.isActive) {
      res.status(400);
      throw new Error('Service is not available');
    }

    // Check if user has already applied for this service recently
    const recentApplication = await Application.findOne({
      applicant: mongoose.Types.ObjectId.isValid(req.user.id) ? req.user.id : undefined,
      service: service._id,
      status: { $in: ['draft', 'submitted', 'under_review', 'pending_documents'] },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });

    if (recentApplication) {
      res.status(400);
      throw new Error('You have already applied for this service recently');
    }

    // Create application
    const application = await Application.create({
      service: service._id,
      applicant: mongoose.Types.ObjectId.isValid(req.user.id) ? req.user.id : undefined,
      title,
      purpose,
      description,
      formData,
      priority,
      isUrgent,
      urgentReason,
      payment: {
        amount: service.fee.amount,
        currency: service.fee.currency
      },
      estimatedCompletionDate: new Date(Date.now() + service.processingTime.maxDays * 24 * 60 * 60 * 1000)
    });

    // Populate service details
    await application.populate('service', 'title nepaliTitle category');

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: { application }
    });
  } catch (error) {
    // MongoDB not available, use in-memory storage
    console.log('MongoDB not available, using in-memory storage for application creation');
    
    // For in-memory storage, we'll use a simple service lookup
    // In a real scenario, this would come from the services in-memory storage
    const service = {
      _id: serviceId,
      title: 'Birth Certificate',
      fee: { amount: 500, currency: 'NPR' },
      processingTime: { maxDays: 5 }
    };

    // Check if user has already applied for this service recently (in-memory)
    const recentApplication = Array.from(inMemoryApplications.values())
      .find(app => 
        app.applicant === req.user.id && 
        app.service === serviceId &&
        ['draft', 'submitted', 'under_review', 'pending_documents'].includes(app.status) &&
        new Date(app.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );

    if (recentApplication) {
      res.status(400);
      throw new Error('You have already applied for this service recently');
    }

    // Create application in memory
    const applicationId = Date.now().toString();
    const application = {
      _id: applicationId,
      service: serviceId,
      applicant: req.user.id,
      title,
      purpose,
      description,
      formData,
      priority,
      isUrgent,
      urgentReason,
      status: 'draft',
      payment: {
        amount: service.fee.amount,
        currency: service.fee.currency
      },
      estimatedCompletionDate: new Date(Date.now() + service.processingTime.maxDays * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
      serviceDetails: {
        title: service.title,
        nepaliTitle: 'जन्म प्रमाणपत्र',
        category: 'certificates'
      }
    };

    // Store in memory
    inMemoryApplications.set(applicationId, application);

    res.status(201).json({
      success: true,
      message: 'Application created successfully (Development Mode - In-Memory Storage)',
      data: { application }
    });
  }
}));

// @desc    Submit application
// @route   POST /api/applications/:id/submit
// @access  Private
router.post('/:id/submit', [
  protect,
  checkPermission('apply_services'),
  body('documents').isArray().withMessage('Documents array is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const application = await Application.findById(req.params.id)
    .populate('service', 'requiredDocuments');

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  if (application.applicant.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Access denied');
  }

  if (application.status !== 'draft') {
    res.status(400);
    throw new Error('Application is not in draft status');
  }

  const { documents } = req.body;

  // Validate required documents
  const requiredDocs = application.service.requiredDocuments.filter(doc => doc.isRequired);
  const uploadedDocs = documents.map(doc => doc.name);

  for (const requiredDoc of requiredDocs) {
    if (!uploadedDocs.includes(requiredDoc.name)) {
      res.status(400);
      throw new Error(`Required document missing: ${requiredDoc.name}`);
    }
  }

  // Add documents to application
  application.documents = documents;
  application.status = 'submitted';
  application.submittedAt = new Date();
  application.progress = 10; // Initial progress

  await application.save();

  // Send notification to staff
  // This would typically trigger a notification system

  res.json({
    success: true,
    message: 'Application submitted successfully',
    data: { application }
  });
}));

// @desc    Update application status (Staff/Admin only)
// @route   PUT /api/applications/:id/status
// @access  Private
router.put('/:id/status', [
  protect,
  authorize('admin', 'staff'),
  checkPermission('manage_applications'),
  body('status').isIn(['submitted', 'under_review', 'pending_documents', 'approved', 'rejected', 'completed']).withMessage('Invalid status'),
  body('comments').optional().trim().isLength({ max: 1000 }),
  body('step').optional().isInt({ min: 1 }),
  body('action').optional().trim()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { status, comments, step, action } = req.body;

  const application = await Application.findById(req.params.id)
    .populate('applicant', 'firstName lastName email mobileNumber')
    .populate('service', 'title');

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  const oldStatus = application.status;
  application.status = status;

  // Update progress based on status
  const progressMap = {
    submitted: 10,
    under_review: 30,
    pending_documents: 50,
    approved: 80,
    completed: 100,
    rejected: 100
  };

  application.progress = progressMap[status] || application.progress;

  // Add to workflow history
  if (step && action) {
    await application.updateProgress(step, status, action, req.user.id, comments);
  } else {
    application.workflowHistory.push({
      step: application.currentStep,
      status,
      action: 'status_update',
      performedBy: req.user.id,
      comments,
      performedAt: new Date()
    });
  }

  // Set completion date if completed
  if (status === 'completed') {
    application.actualCompletionDate = new Date();
  }

  await application.save();

  // Send notifications
  if (oldStatus !== status) {
    try {
      if (application.applicant.email) {
        await sendApplicationStatusEmail(application.applicant, application, status);
      }
      if (application.applicant.mobileNumber) {
        await sendApplicationStatusSMS(application.applicant.mobileNumber, application, status);
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  res.json({
    success: true,
    message: 'Application status updated successfully',
    data: { application }
  });
}));

// @desc    Add documents to application
// @route   POST /api/applications/:id/documents
// @access  Private
router.post('/:id/documents', [
  protect,
  body('documents').isArray().withMessage('Documents array is required'),
  body('documents.*.name').notEmpty().withMessage('Document name is required'),
  body('documents.*.type').notEmpty().withMessage('Document type is required'),
  body('documents.*.file').isObject().withMessage('File object is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  // Check access permissions
  if (req.user.role === 'citizen' && application.applicant.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Access denied');
  }

  const { documents } = req.body;

  // Add documents
  for (const doc of documents) {
    await application.addDocument(doc);
  }

  res.json({
    success: true,
    message: 'Documents added successfully',
    data: { application }
  });
}));

// @desc    Verify document (Staff/Admin only)
// @route   PUT /api/applications/:id/documents/:docIndex/verify
// @access  Private
router.put('/:id/documents/:docIndex/verify', [
  protect,
  authorize('admin', 'staff'),
  checkPermission('manage_applications'),
  body('verified').isBoolean().withMessage('Verified status is required'),
  body('notes').optional().trim().isLength({ max: 500 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { verified, notes } = req.body;
  const docIndex = parseInt(req.params.docIndex);

  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  if (docIndex < 0 || docIndex >= application.documents.length) {
    res.status(400);
    throw new Error('Invalid document index');
  }

  await application.verifyDocument(docIndex, req.user.id, notes);

  res.json({
    success: true,
    message: 'Document verification updated',
    data: { application }
  });
}));

// @desc    Add note to application
// @route   POST /api/applications/:id/notes
// @access  Private
router.post('/:id/notes', [
  protect,
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Note content is required'),
  body('isInternal').optional().isBoolean()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { content, isInternal = false } = req.body;

  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  // Check access permissions
  if (req.user.role === 'citizen' && application.applicant.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Access denied');
  }

  await application.addNote(content, req.user.id, isInternal);

  res.json({
    success: true,
    message: 'Note added successfully',
    data: { application }
  });
}));

// @desc    Get applications for staff review
// @route   GET /api/applications/staff/pending
// @access  Private
router.get('/staff/pending', [
  protect,
  authorize('admin', 'staff'),
  checkPermission('manage_applications'),
  query('status').optional().isString(),
  query('ward').optional().isInt({ min: 1, max: 35 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('page').optional().isInt({ min: 1 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { status, ward, limit = 20, page = 1 } = req.query;
  const skip = (page - 1) * limit;

  let query = {
    status: { $in: ['submitted', 'under_review', 'pending_documents'] }
  };

  if (status) {
    query.status = status;
  }

  // Filter by ward if specified
  if (ward && req.user.role !== 'admin') {
    query['applicant.address.ward'] = parseInt(ward);
  }

  const applications = await Application.find(query)
    .populate('applicant', 'firstName lastName mobileNumber email address')
    .populate('service', 'title category')
    .sort({ priority: -1, createdAt: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Application.countDocuments(query);

  res.json({
    success: true,
    data: {
      applications,
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

// @desc    Get application statistics
// @route   GET /api/applications/stats
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

  let matchQuery = { createdAt: dateFilter };

  if (ward) {
    matchQuery['applicant.address.ward'] = parseInt(ward);
  }

  const stats = await Application.aggregate([
    { $match: matchQuery },
    {
      $lookup: {
        from: 'users',
        localField: 'applicant',
        foreignField: '_id',
        as: 'applicant'
      }
    },
    { $unwind: '$applicant' },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$payment.amount' }
      }
    }
  ]);

  // Get service-wise statistics
  const serviceStats = await Application.aggregate([
    { $match: matchQuery },
    {
      $lookup: {
        from: 'services',
        localField: 'service',
        foreignField: '_id',
        as: 'service'
      }
    },
    { $unwind: '$service' },
    {
      $group: {
        _id: '$service.title',
        count: { $sum: 1 },
        totalAmount: { $sum: '$payment.amount' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  res.json({
    success: true,
    data: {
      stats,
      serviceStats,
      period,
      ward: ward || 'all'
    }
  });
}));

// @desc    Cancel application
// @route   POST /api/applications/:id/cancel
// @access  Private
router.post('/:id/cancel', [
  protect,
  body('reason').optional().trim().isLength({ max: 500 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { reason } = req.body;

  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  if (application.applicant.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Access denied');
  }

  if (!['draft', 'submitted'].includes(application.status)) {
    res.status(400);
    throw new Error('Application cannot be cancelled in current status');
  }

  application.status = 'cancelled';
  if (reason) {
    await application.addNote(`Application cancelled: ${reason}`, req.user.id, false);
  }

  await application.save();

  res.json({
    success: true,
    message: 'Application cancelled successfully',
    data: { application }
  });
}));

export default router;
