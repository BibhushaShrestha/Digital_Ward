import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  // Basic Information
  complaintId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  complainant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Complaint Details
  subject: {
    type: String,
    required: [true, 'Complaint subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Complaint description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Complaint category is required'],
    enum: [
      'infrastructure',
      'utilities',
      'sanitation',
      'traffic',
      'noise',
      'environment',
      'security',
      'corruption',
      'service_delivery',
      'other'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },

  // Location Information
  location: {
    address: {
      type: String,
      required: [true, 'Location address is required']
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    ward: {
      type: Number,
      required: true,
      min: 1,
      max: 35
    },
    municipality: String,
    district: String,
    province: String
  },

  // Status and Priority
  status: {
    type: String,
    enum: [
      'pending',
      'acknowledged',
      'in_progress',
      'under_investigation',
      'resolved',
      'closed',
      'rejected'
    ],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isUrgent: {
    type: Boolean,
    default: false
  },

  // Timeline
  submittedAt: {
    type: Date,
    default: Date.now
  },
  acknowledgedAt: Date,
  estimatedResolutionDate: Date,
  resolvedAt: Date,
  closedAt: Date,
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  },

  // Assignment and Handling
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: Date,
  department: {
    type: String,
    enum: ['administration', 'infrastructure', 'utilities', 'sanitation', 'security', 'other']
  },

  // Progress Tracking
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  currentStep: {
    type: String,
    default: 'submitted'
  },

  // Updates and Communication
  updates: [{
    status: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    isInternal: {
      type: Boolean,
      default: false
    },
    attachments: [{
      publicId: String,
      url: String,
      filename: String,
      type: String
    }]
  }],

  // Attachments
  attachments: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['image', 'video', 'document', 'audio'],
      required: true
    },
    file: {
      publicId: String,
      url: String,
      filename: String,
      size: Number,
      mimeType: String
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Resolution
  resolution: {
    description: String,
    actions: [String],
    cost: {
      amount: Number,
      currency: {
        type: String,
        default: 'NPR'
      }
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: Date,
    beforePhotos: [{
      publicId: String,
      url: String,
      caption: String
    }],
    afterPhotos: [{
      publicId: String,
      url: String,
      caption: String
    }]
  },

  // Feedback and Rating
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date,
    isAnonymous: {
      type: Boolean,
      default: false
    }
  },

  // Escalation
  escalation: {
    isEscalated: {
      type: Boolean,
      default: false
    },
    escalatedAt: Date,
    escalatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    escalatedTo: {
      type: String,
      enum: ['supervisor', 'department_head', 'municipality', 'province', 'central']
    },
    reason: String,
    resolution: String
  },

  // Notifications
  notifications: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push', 'in_app']
    },
    title: String,
    message: String,
    sentAt: {
      type: Date,
      default: Date.now
    },
    readAt: Date,
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed'],
      default: 'sent'
    }
  }],

  // Related Complaints
  relatedComplaints: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint'
  }],

  // Tags and Classification
  tags: [String],
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isSensitive: {
    type: Boolean,
    default: false
  },

  // Metadata
  source: {
    type: String,
    enum: ['web', 'mobile', 'office', 'phone', 'other'],
    default: 'web'
  },
  ipAddress: String,
  userAgent: String,
  deviceInfo: {
    type: String,
    platform: String,
    browser: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for complaint age
complaintSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.submittedAt) / (1000 * 60 * 60 * 24));
});

// Virtual for resolution time
complaintSchema.virtual('resolutionTime').get(function() {
  if (this.resolvedAt) {
    return Math.floor((this.resolvedAt - this.submittedAt) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Virtual for status color
complaintSchema.virtual('statusColor').get(function() {
  const colors = {
    pending: 'bg-gray-500',
    acknowledged: 'bg-blue-500',
    in_progress: 'bg-yellow-500',
    under_investigation: 'bg-orange-500',
    resolved: 'bg-green-500',
    closed: 'bg-green-600',
    rejected: 'bg-red-500'
  };
  return colors[this.status] || 'bg-gray-500';
});

// Virtual for priority color
complaintSchema.virtual('priorityColor').get(function() {
  const colors = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    urgent: 'bg-red-500'
  };
  return colors[this.priority] || 'bg-gray-500';
});

// Indexes
complaintSchema.index({ complaintId: 1 });
complaintSchema.index({ complainant: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ priority: -1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ 'location.ward': 1 });
complaintSchema.index({ submittedAt: -1 });
complaintSchema.index({ assignedTo: 1 });
complaintSchema.index({ isUrgent: -1 });

// Pre-save middleware
complaintSchema.pre('save', function(next) {
  this.lastUpdatedAt = new Date();
  
  // Generate complaint ID if not exists
  if (!this.complaintId) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.complaintId = `CMP${timestamp}${random}`;
  }
  
  next();
});

// Static methods
complaintSchema.statics.findByComplainant = function(complainantId, options = {}) {
  const query = { complainant: complainantId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .populate('assignedTo', 'firstName lastName')
    .sort({ createdAt: -1 });
};

complaintSchema.statics.findByStatus = function(status) {
  return this.find({ status })
    .populate('complainant', 'firstName lastName mobileNumber')
    .populate('assignedTo', 'firstName lastName')
    .sort({ priority: -1, createdAt: 1 });
};

complaintSchema.statics.findByWard = function(ward) {
  return this.find({ 'location.ward': ward })
    .populate('complainant', 'firstName lastName')
    .populate('assignedTo', 'firstName lastName')
    .sort({ priority: -1, createdAt: -1 });
};

complaintSchema.statics.findUrgent = function() {
  return this.find({ isUrgent: true, status: { $ne: 'resolved' } })
    .populate('complainant', 'firstName lastName mobileNumber')
    .populate('assignedTo', 'firstName lastName')
    .sort({ submittedAt: 1 });
};

complaintSchema.statics.getStatistics = function() {
  return this.aggregate([
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
};

// Instance methods
complaintSchema.methods.addUpdate = function(status, message, updatedBy, isInternal = false, attachments = []) {
  this.updates.push({
    status,
    message,
    updatedBy,
    isInternal,
    attachments,
    updatedAt: new Date()
  });
  
  this.status = status;
  this.lastUpdatedAt = new Date();
  
  return this.save();
};

complaintSchema.methods.assignTo = function(userId, department) {
  this.assignedTo = userId;
  this.department = department;
  this.assignedAt = new Date();
  this.status = 'acknowledged';
  
  return this.save();
};

complaintSchema.methods.resolve = function(resolutionData, completedBy) {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  this.progress = 100;
  this.resolution = {
    ...resolutionData,
    completedBy,
    completedAt: new Date()
  };
  
  return this.save();
};

complaintSchema.methods.addAttachment = function(attachmentData) {
  this.attachments.push({
    ...attachmentData,
    uploadedAt: new Date()
  });
  
  return this.save();
};

complaintSchema.methods.escalate = function(escalatedBy, escalatedTo, reason) {
  this.escalation = {
    isEscalated: true,
    escalatedAt: new Date(),
    escalatedBy,
    escalatedTo,
    reason
  };
  
  return this.save();
};

complaintSchema.methods.addFeedback = function(rating, comment, isAnonymous = false) {
  this.feedback = {
    rating,
    comment,
    submittedAt: new Date(),
    isAnonymous
  };
  
  return this.save();
};

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;
