import express from 'express';
import { body, validationResult, query } from 'express-validator';
import asyncHandler from 'express-async-handler';
import Service from '../models/Service.js';
import Application from '../models/Application.js';
import { protect, authorize, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// In-memory services storage for development when MongoDB is not available
const inMemoryServices = new Map();

// Initialize with some default services for development
const defaultServices = [
  {
    _id: 'birth-certificate',
    title: 'Birth Certificate',
    nepaliTitle: 'जन्म प्रमाणपत्र',
    description: 'Official birth registration and certificate issuance',
    serviceId: 'BIRTH_CERT',
    category: 'certificates',
    fee: { amount: 500, currency: 'NPR' },
    processingTime: { minDays: 3, maxDays: 5, displayText: '3-5 days' },
    requiredDocuments: ['Parents\' citizenship', 'Hospital record', 'Application form'],
    isActive: true,
    priority: 1,
    icon: 'baby',
    color: '#4CAF50'
  },
  {
    _id: 'death-certificate',
    title: 'Death Certificate',
    nepaliTitle: 'मृत्यु प्रमाणपत्र',
    description: 'Official death registration and certificate issuance',
    serviceId: 'DEATH_CERT',
    category: 'certificates',
    fee: { amount: 300, currency: 'NPR' },
    processingTime: { minDays: 2, maxDays: 4, displayText: '2-4 days' },
    requiredDocuments: ['Hospital record', 'Police report', 'Application form'],
    isActive: true,
    priority: 2,
    icon: 'file-text',
    color: '#FF9800'
  },
  {
    _id: 'marriage-certificate',
    title: 'Marriage Certificate',
    nepaliTitle: 'विवाह प्रमाणपत्र',
    description: 'Official marriage registration and certificate issuance',
    serviceId: 'MARRIAGE_CERT',
    category: 'certificates',
    fee: { amount: 1000, currency: 'NPR' },
    processingTime: { minDays: 5, maxDays: 7, displayText: '5-7 days' },
    requiredDocuments: ['Citizenship certificates', 'Marriage registration', 'Application form'],
    isActive: true,
    priority: 3,
    icon: 'heart',
    color: '#E91E63'
  }
];

// Initialize in-memory services with defaults
defaultServices.forEach(service => {
  inMemoryServices.set(service._id, service);
});

// @desc    Get all active services
// @route   GET /api/services
// @access  Public
router.get('/', [
  query('category').optional().isString(),
  query('search').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('page').optional().isInt({ min: 1 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { category, search, limit = 20, page = 1 } = req.query;
  const skip = (page - 1) * limit;

  let query = { isActive: true };

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Search functionality
  if (search) {
    query = {
      ...query,
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { nepaliTitle: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    };
  }

  try {
    // Try to use MongoDB if available
    const services = await Service.find(query)
      .sort({ priority: -1, title: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Service.countDocuments(query);

    res.json({
      success: true,
      data: {
        services,
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
    console.log('MongoDB not available, using in-memory storage for services list');
    
    let services = Array.from(inMemoryServices.values())
      .filter(service => service.isActive)
      .filter(service => !category || service.category === category)
      .filter(service => !search || 
        service.title.toLowerCase().includes(search.toLowerCase()) ||
        service.description.toLowerCase().includes(search.toLowerCase()) ||
        service.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );

    const total = services.length;
    services = services
      .sort((a, b) => (b.priority || 0) - (a.priority || 0) || a.title.localeCompare(b.title))
      .slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        services,
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

// @desc    Get service by ID
// @route   GET /api/services/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
  try {
    // Try to use MongoDB if available
    const service = await Service.findById(req.params.id);

    if (!service) {
      res.status(404);
      throw new Error('Service not found');
    }

    if (!service.isActive) {
      res.status(404);
      throw new Error('Service is not available');
    }

    res.json({
      success: true,
      data: { service }
    });
  } catch (error) {
    // MongoDB not available, use in-memory storage
    console.log('MongoDB not available, using in-memory storage for service details');
    
    const service = inMemoryServices.get(req.params.id);
    
    if (!service) {
      res.status(404);
      throw new Error('Service not found');
    }

    if (!service.isActive) {
      res.status(404);
      throw new Error('Service is not available');
    }

    res.json({
      success: true,
      data: { service }
    });
  }
}));

// @desc    Get popular services
// @route   GET /api/services/popular
// @access  Public
router.get('/popular', [
  query('limit').optional().isInt({ min: 1, max: 20 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const limit = parseInt(req.query.limit) || 10;

  try {
    // Try to use MongoDB if available
    const services = await Service.findPopular(limit);

    res.json({
      success: true,
      data: { services }
    });
  } catch (error) {
    // MongoDB not available, use in-memory storage
    console.log('MongoDB not available, using in-memory storage for popular services');
    
    const services = Array.from(inMemoryServices.values())
      .filter(service => service.isActive)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .slice(0, limit);

    res.json({
      success: true,
      data: { services }
    });
  }
}));

// @desc    Search services
// @route   GET /api/services/search
// @access  Public
router.get('/search', [
  query('q').notEmpty().withMessage('Search query is required'),
  query('limit').optional().isInt({ min: 1, max: 50 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { q, limit = 20 } = req.query;

  try {
    // Try to use MongoDB if available
    const services = await Service.searchServices(q).limit(parseInt(limit));

    res.json({
      success: true,
      data: { services }
    });
  } catch (error) {
    // MongoDB not available, use in-memory storage
    console.log('MongoDB not available, using in-memory storage for service search');
    
    const services = Array.from(inMemoryServices.values())
      .filter(service => service.isActive)
      .filter(service => 
        service.title.toLowerCase().includes(q.toLowerCase()) ||
        service.description.toLowerCase().includes(q.toLowerCase()) ||
        service.tags?.some(tag => tag.toLowerCase().includes(q.toLowerCase()))
      )
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: { services }
    });
  }
}));

// @desc    Get service categories
// @route   GET /api/services/categories
// @access  Public
router.get('/categories', asyncHandler(async (req, res) => {
  try {
    // Try to use MongoDB if available
    const categories = await Service.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          services: { $push: { id: '$_id', title: '$title', nepaliTitle: '$nepaliTitle' } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    // MongoDB not available, use in-memory storage
    console.log('MongoDB not available, using in-memory storage for service categories');
    
    const services = Array.from(inMemoryServices.values()).filter(service => service.isActive);
    const categoryMap = new Map();
    
    services.forEach(service => {
      if (!categoryMap.has(service.category)) {
        categoryMap.set(service.category, {
          _id: service.category,
          count: 0,
          services: []
        });
      }
      
      const category = categoryMap.get(service.category);
      category.count++;
      category.services.push({
        id: service._id,
        title: service.title,
        nepaliTitle: service.nepaliTitle
      });
    });
    
    const categories = Array.from(categoryMap.values())
      .sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      data: { categories }
    });
  }
}));

// @desc    Create new service (Admin/Staff only)
// @route   POST /api/services
// @access  Private
router.post('/', [
  protect,
  authorize('admin', 'staff'),
  checkPermission('manage_services'),
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('nepaliTitle').trim().notEmpty().withMessage('Nepali title is required'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  body('serviceId').trim().notEmpty().withMessage('Service ID is required'),
  body('category').isIn(['certificates', 'letters', 'permits', 'registrations', 'clearances', 'other']).withMessage('Invalid category'),
  body('fee.amount').isFloat({ min: 0 }).withMessage('Fee amount must be a positive number'),
  body('processingTime.minDays').isInt({ min: 1 }).withMessage('Minimum processing time must be at least 1 day'),
  body('processingTime.maxDays').isInt({ min: 1 }).withMessage('Maximum processing time must be at least 1 day'),
  body('processingTime.displayText').notEmpty().withMessage('Processing time display text is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const {
    title,
    nepaliTitle,
    description,
    nepaliDescription,
    serviceId,
    category,
    subcategory,
    fee,
    processingTime,
    requiredDocuments,
    eligibilityCriteria,
    workflowSteps,
    formFields,
    icon,
    color,
    priority,
    tags
  } = req.body;

  // Check if service ID already exists
  const existingService = await Service.findOne({ serviceId });
  if (existingService) {
    res.status(400);
    throw new Error('Service ID already exists');
  }

  const service = await Service.create({
    title,
    nepaliTitle,
    description,
    nepaliDescription,
    serviceId,
    category,
    subcategory,
    fee,
    processingTime,
    requiredDocuments,
    eligibilityCriteria,
    workflowSteps,
    formFields,
    icon,
    color,
    priority,
    tags
  });

  res.status(201).json({
    success: true,
    message: 'Service created successfully',
    data: { service }
  });
}));

// @desc    Update service (Admin/Staff only)
// @route   PUT /api/services/:id
// @access  Private
router.put('/:id', [
  protect,
  authorize('admin', 'staff'),
  checkPermission('manage_services'),
  body('title').optional().trim().isLength({ min: 3, max: 100 }),
  body('nepaliTitle').optional().trim().notEmpty(),
  body('description').optional().trim().isLength({ min: 10, max: 500 }),
  body('category').optional().isIn(['certificates', 'letters', 'permits', 'registrations', 'clearances', 'other']),
  body('fee.amount').optional().isFloat({ min: 0 }),
  body('processingTime.minDays').optional().isInt({ min: 1 }),
  body('processingTime.maxDays').optional().isInt({ min: 1 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  // Update service
  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined) {
      service[key] = req.body[key];
    }
  });

  await service.save();

  res.json({
    success: true,
    message: 'Service updated successfully',
    data: { service }
  });
}));

// @desc    Delete service (Admin only)
// @route   DELETE /api/services/:id
// @access  Private
router.delete('/:id', [
  protect,
  authorize('admin'),
  checkPermission('manage_services')
], asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  // Check if there are any active applications for this service
  const activeApplications = await Application.countDocuments({
    service: service._id,
    status: { $in: ['submitted', 'under_review', 'pending_documents'] }
  });

  if (activeApplications > 0) {
    res.status(400);
    throw new Error(`Cannot delete service with ${activeApplications} active applications`);
  }

  // Soft delete by setting isActive to false
  service.isActive = false;
  await service.save();

  res.json({
    success: true,
    message: 'Service deactivated successfully'
  });
}));

// @desc    Toggle service status (Admin/Staff only)
// @route   PATCH /api/services/:id/toggle
// @access  Private
router.patch('/:id/toggle', [
  protect,
  authorize('admin', 'staff'),
  checkPermission('manage_services')
], asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  service.isActive = !service.isActive;
  await service.save();

  res.json({
    success: true,
    message: `Service ${service.isActive ? 'activated' : 'deactivated'} successfully`,
    data: { service }
  });
}));

// @desc    Get service statistics
// @route   GET /api/services/:id/stats
// @access  Private
router.get('/:id/stats', [
  protect,
  authorize('admin', 'staff'),
  checkPermission('view_analytics')
], asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  // Get application statistics for this service
  const stats = await Application.aggregate([
    { $match: { service: service._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$payment.amount' }
      }
    }
  ]);

  // Get monthly trends
  const monthlyTrends = await Application.aggregate([
    { $match: { service: service._id } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 },
        totalAmount: { $sum: '$payment.amount' }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);

  res.json({
    success: true,
    data: {
      service,
      stats,
      monthlyTrends
    }
  });
}));

// @desc    Bulk update services (Admin only)
// @route   PUT /api/services/bulk-update
// @access  Private
router.put('/bulk-update', [
  protect,
  authorize('admin'),
  checkPermission('manage_services'),
  body('services').isArray().withMessage('Services array is required'),
  body('services.*.id').notEmpty().withMessage('Service ID is required'),
  body('services.*.updates').isObject().withMessage('Updates object is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { services } = req.body;
  const results = [];

  for (const serviceUpdate of services) {
    try {
      const service = await Service.findById(serviceUpdate.id);
      if (!service) {
        results.push({
          id: serviceUpdate.id,
          success: false,
          error: 'Service not found'
        });
        continue;
      }

      Object.keys(serviceUpdate.updates).forEach(key => {
        service[key] = serviceUpdate.updates[key];
      });

      await service.save();
      results.push({
        id: serviceUpdate.id,
        success: true,
        message: 'Service updated successfully'
      });
    } catch (error) {
      results.push({
        id: serviceUpdate.id,
        success: false,
        error: error.message
      });
    }
  }

  res.json({
    success: true,
    message: 'Bulk update completed',
    data: { results }
  });
}));

export default router;
