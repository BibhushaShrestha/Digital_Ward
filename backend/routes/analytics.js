import express from 'express';
import { query, validationResult } from 'express-validator';
import asyncHandler from 'express-async-handler';
import Application from '../models/Application.js';
import Complaint from '../models/Complaint.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import { protect, authorize, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get dashboard overview statistics
// @route   GET /api/analytics/dashboard
// @access  Private
router.get('/dashboard', [
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

  // Application statistics
  const applicationStats = await Application.aggregate([
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

  // Complaint statistics
  let complaintMatchQuery = { submittedAt: dateFilter };
  if (ward) {
    complaintMatchQuery['location.ward'] = parseInt(ward);
  }

  const complaintStats = await Complaint.aggregate([
    { $match: complaintMatchQuery },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // User statistics
  let userMatchQuery = { createdAt: dateFilter };
  if (ward) {
    userMatchQuery['address.ward'] = parseInt(ward);
  }

  const userStats = await User.aggregate([
    { $match: userMatchQuery },
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);

  // Service statistics
  const serviceStats = await Service.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: 'applications',
        localField: '_id',
        foreignField: 'service',
        as: 'applications'
      }
    },
    {
      $project: {
        title: 1,
        totalApplications: { $size: '$applications' },
        successRate: 1,
        averageProcessingTime: 1
      }
    },
    { $sort: { totalApplications: -1 } },
    { $limit: 5 }
  ]);

  // Calculate totals
  const totalApplications = applicationStats.reduce((sum, stat) => sum + stat.count, 0);
  const totalComplaints = complaintStats.reduce((sum, stat) => sum + stat.count, 0);
  const totalUsers = userStats.reduce((sum, stat) => sum + stat.count, 0);

  // Calculate success rates
  const completedApplications = applicationStats.find(stat => stat._id === 'completed')?.count || 0;
  const resolvedComplaints = complaintStats.find(stat => stat._id === 'resolved')?.count || 0;

  const applicationSuccessRate = totalApplications > 0 ? (completedApplications / totalApplications) * 100 : 0;
  const complaintResolutionRate = totalComplaints > 0 ? (resolvedComplaints / totalComplaints) * 100 : 0;

  res.json({
    success: true,
    data: {
      overview: {
        totalApplications,
        totalComplaints,
        totalUsers,
        applicationSuccessRate: Math.round(applicationSuccessRate * 100) / 100,
        complaintResolutionRate: Math.round(complaintResolutionRate * 100) / 100
      },
      applicationStats,
      complaintStats,
      userStats,
      serviceStats,
      period,
      ward: ward || 'all'
    }
  });
}));

// @desc    Get application analytics
// @route   GET /api/analytics/applications
// @access  Private
router.get('/applications', [
  protect,
  authorize('admin', 'staff'),
  checkPermission('view_analytics'),
  query('ward').optional().isInt({ min: 1, max: 35 }),
  query('period').optional().isIn(['day', 'week', 'month', 'year']),
  query('service').optional().isString()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { ward, period = 'month', service } = req.query;

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

  if (service) {
    matchQuery.service = service;
  }

  // Status-wise statistics
  const statusStats = await Application.aggregate([
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
        totalAmount: { $sum: '$payment.amount' },
        avgProcessingTime: {
          $avg: {
            $cond: [
              { $ne: ['$actualCompletionDate', null] },
              { $divide: [{ $subtract: ['$actualCompletionDate', '$submittedAt'] }, 1000 * 60 * 60 * 24] },
              null
            ]
          }
        }
      }
    }
  ]);

  // Monthly trends
  const monthlyTrends = await Application.aggregate([
    { $match: matchQuery },
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

  // Service-wise statistics
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
        totalAmount: { $sum: '$payment.amount' },
        successRate: {
          $avg: {
            $cond: [
              { $eq: ['$status', 'completed'] },
              100,
              0
            ]
          }
        }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Ward-wise statistics
  const wardStats = await Application.aggregate([
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
        _id: '$applicant.address.ward',
        count: { $sum: 1 },
        totalAmount: { $sum: '$payment.amount' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    data: {
      statusStats,
      monthlyTrends,
      serviceStats,
      wardStats,
      period,
      ward: ward || 'all',
      service: service || 'all'
    }
  });
}));

// @desc    Get complaint analytics
// @route   GET /api/analytics/complaints
// @access  Private
router.get('/complaints', [
  protect,
  authorize('admin', 'staff'),
  checkPermission('view_analytics'),
  query('ward').optional().isInt({ min: 1, max: 35 }),
  query('period').optional().isIn(['day', 'week', 'month', 'year']),
  query('category').optional().isString()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { ward, period = 'month', category } = req.query;

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

  if (category) {
    matchQuery.category = category;
  }

  // Status-wise statistics
  const statusStats = await Complaint.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$status',
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
    }
  ]);

  // Category-wise statistics
  const categoryStats = await Complaint.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        resolutionRate: {
          $avg: {
            $cond: [
              { $eq: ['$status', 'resolved'] },
              100,
              0
            ]
          }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Priority-wise statistics
  const priorityStats = await Complaint.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$priority',
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
    }
  ]);

  // Monthly trends
  const monthlyTrends = await Complaint.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: {
          year: { $year: '$submittedAt' },
          month: { $month: '$submittedAt' }
        },
        count: { $sum: 1 },
        resolved: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'resolved'] },
              1,
              0
            ]
          }
        }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);

  // Ward-wise statistics
  const wardStats = await Complaint.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$location.ward',
        count: { $sum: 1 },
        resolved: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'resolved'] },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $addFields: {
        resolutionRate: {
          $cond: [
            { $gt: ['$count', 0] },
            { $multiply: [{ $divide: ['$resolved', '$count'] }, 100] },
            0
          ]
        }
      }
    },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    data: {
      statusStats,
      categoryStats,
      priorityStats,
      monthlyTrends,
      wardStats,
      period,
      ward: ward || 'all',
      category: category || 'all'
    }
  });
}));

// @desc    Get user analytics
// @route   GET /api/analytics/users
// @access  Private
router.get('/users', [
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
    matchQuery['address.ward'] = parseInt(ward);
  }

  // Role-wise statistics
  const roleStats = await User.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        verified: {
          $sum: {
            $cond: [
              { $and: ['$isEmailVerified', '$isMobileVerified'] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  // Gender-wise statistics
  const genderStats = await User.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$gender',
        count: { $sum: 1 }
      }
    }
  ]);

  // Ward-wise statistics
  const wardStats = await User.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$address.ward',
        count: { $sum: 1 },
        citizens: {
          $sum: {
            $cond: [
              { $eq: ['$role', 'citizen'] },
              1,
              0
            ]
          }
        },
        staff: {
          $sum: {
            $cond: [
              { $in: ['$role', ['staff', 'admin']] },
              1,
              0
            ]
          }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Monthly registration trends
  const monthlyTrends = await User.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 },
        citizens: {
          $sum: {
            $cond: [
              { $eq: ['$role', 'citizen'] },
              1,
              0
            ]
          }
        }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);

  // Age group statistics
  const ageStats = await User.aggregate([
    { $match: matchQuery },
    {
      $addFields: {
        age: {
          $floor: {
            $divide: [
              { $subtract: [new Date(), '$dateOfBirth'] },
              365 * 24 * 60 * 60 * 1000
            ]
          }
        }
      }
    },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $lt: ['$age', 18] }, then: 'Under 18' },
              { case: { $lt: ['$age', 30] }, then: '18-29' },
              { case: { $lt: ['$age', 50] }, then: '30-49' },
              { case: { $lt: ['$age', 65] }, then: '50-64' }
            ],
            default: '65+'
          }
        },
        count: { $sum: 1 }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      roleStats,
      genderStats,
      wardStats,
      monthlyTrends,
      ageStats,
      period,
      ward: ward || 'all'
    }
  });
}));

// @desc    Get performance metrics
// @route   GET /api/analytics/performance
// @access  Private
router.get('/performance', [
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

  // Application processing time
  let appMatchQuery = { createdAt: dateFilter, actualCompletionDate: { $ne: null } };
  if (ward) {
    appMatchQuery['applicant.address.ward'] = parseInt(ward);
  }

  const appProcessingTime = await Application.aggregate([
    { $match: appMatchQuery },
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
        _id: null,
        avgProcessingTime: {
          $avg: {
            $divide: [
              { $subtract: ['$actualCompletionDate', '$submittedAt'] },
              1000 * 60 * 60 * 24
            ]
          }
        },
        minProcessingTime: {
          $min: {
            $divide: [
              { $subtract: ['$actualCompletionDate', '$submittedAt'] },
              1000 * 60 * 60 * 24
            ]
          }
        },
        maxProcessingTime: {
          $max: {
            $divide: [
              { $subtract: ['$actualCompletionDate', '$submittedAt'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      }
    }
  ]);

  // Complaint resolution time
  let compMatchQuery = { submittedAt: dateFilter, resolvedAt: { $ne: null } };
  if (ward) {
    compMatchQuery['location.ward'] = parseInt(ward);
  }

  const compResolutionTime = await Complaint.aggregate([
    { $match: compMatchQuery },
    {
      $group: {
        _id: null,
        avgResolutionTime: {
          $avg: {
            $divide: [
              { $subtract: ['$resolvedAt', '$submittedAt'] },
              1000 * 60 * 60 * 24
            ]
          }
        },
        minResolutionTime: {
          $min: {
            $divide: [
              { $subtract: ['$resolvedAt', '$submittedAt'] },
              1000 * 60 * 60 * 24
            ]
          }
        },
        maxResolutionTime: {
          $max: {
            $divide: [
              { $subtract: ['$resolvedAt', '$submittedAt'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      }
    }
  ]);

  // Staff performance
  const staffPerformance = await Application.aggregate([
    { $match: { ...dateFilter, assignedTo: { $ne: null } } },
    {
      $lookup: {
        from: 'users',
        localField: 'assignedTo',
        foreignField: '_id',
        as: 'staff'
      }
    },
    { $unwind: '$staff' },
    {
      $group: {
        _id: '$assignedTo',
        staffName: { $first: { $concat: ['$staff.firstName', ' ', '$staff.lastName'] } },
        totalAssigned: { $sum: 1 },
        completed: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'completed'] },
              1,
              0
            ]
          }
        },
        avgProcessingTime: {
          $avg: {
            $cond: [
              { $ne: ['$actualCompletionDate', null] },
              {
                $divide: [
                  { $subtract: ['$actualCompletionDate', '$submittedAt'] },
                  1000 * 60 * 60 * 24
                ]
              },
              null
            ]
          }
        }
      }
    },
    {
      $addFields: {
        completionRate: {
          $cond: [
            { $gt: ['$totalAssigned', 0] },
            { $multiply: [{ $divide: ['$completed', '$totalAssigned'] }, 100] },
            0
          ]
        }
      }
    },
    { $sort: { completionRate: -1 } }
  ]);

  res.json({
    success: true,
    data: {
      applicationProcessing: appProcessingTime[0] || {},
      complaintResolution: compResolutionTime[0] || {},
      staffPerformance,
      period,
      ward: ward || 'all'
    }
  });
}));

export default router;
