import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  // Basic Information
  applicationId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Application Details
  title: {
    type: String,
    required: true
  },
  description: String,
  purpose: {
    type: String,
    required: true
  },

  // Status and Progress
  status: {
    type: String,
    enum: [
      'draft',
      'submitted',
      'under_review',
      'pending_documents',
      'approved',
      'rejected',
      'completed',
      'cancelled'
    ],
    default: 'draft'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  currentStep: {
    type: Number,
    default: 1
  },

  // Timeline
  submittedAt: Date,
  estimatedCompletionDate: Date,
  actualCompletionDate: Date,
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  },

  // Workflow Tracking
  workflowHistory: [{
    step: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedAt: {
      type: Date,
      default: Date.now
    },
    comments: String,
    duration: Number // in hours
  }],

  // Form Data
  formData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },

  // Documents
  documents: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
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
    },
    verified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    verificationNotes: String
  }],

  // Payment Information
  payment: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'NPR'
    },
    method: {
      type: String,
      enum: ['online', 'cash', 'bank_transfer', 'mobile_money'],
      default: 'online'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date,
    receipt: {
      publicId: String,
      url: String
    }
  },

  // Review and Approval
  review: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    comments: String,
    decision: {
      type: String,
      enum: ['approved', 'rejected', 'pending_revision']
    },
    rejectionReason: String,
    requiredChanges: [String]
  },

  // Final Document
  finalDocument: {
    publicId: String,
    url: String,
    filename: String,
    generatedAt: Date,
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    downloadCount: {
      type: Number,
      default: 0
    },
    lastDownloadedAt: Date
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

  // Priority and Urgency
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  urgentReason: String,

  // Additional Information
  notes: [{
    content: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    isInternal: {
      type: Boolean,
      default: false
    }
  }],

  // Metadata
  tags: [String],
  source: {
    type: String,
    enum: ['web', 'mobile', 'office', 'other'],
    default: 'web'
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for application age
applicationSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for processing time
applicationSchema.virtual('processingTime').get(function() {
  if (this.actualCompletionDate) {
    return Math.floor((this.actualCompletionDate - this.submittedAt) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Virtual for status color
applicationSchema.virtual('statusColor').get(function() {
  const colors = {
    draft: 'bg-gray-500',
    submitted: 'bg-blue-500',
    under_review: 'bg-yellow-500',
    pending_documents: 'bg-orange-500',
    approved: 'bg-green-500',
    rejected: 'bg-red-500',
    completed: 'bg-green-600',
    cancelled: 'bg-gray-600'
  };
  return colors[this.status] || 'bg-gray-500';
});

// Indexes
applicationSchema.index({ applicationId: 1 });
applicationSchema.index({ applicant: 1 });
applicationSchema.index({ service: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ submittedAt: -1 });
applicationSchema.index({ 'payment.status': 1 });
applicationSchema.index({ priority: -1 });

// Pre-save middleware
applicationSchema.pre('save', function(next) {
  this.lastUpdatedAt = new Date();
  
  // Generate application ID if not exists
  if (!this.applicationId) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.applicationId = `APP${timestamp}${random}`;
  }
  
  next();
});

// Static methods
applicationSchema.statics.findByApplicant = function(applicantId, options = {}) {
  const query = { applicant: applicantId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .populate('service', 'title nepaliTitle category')
    .sort({ createdAt: -1 });
};

applicationSchema.statics.findByStatus = function(status) {
  return this.find({ status })
    .populate('applicant', 'firstName lastName mobileNumber')
    .populate('service', 'title category')
    .sort({ createdAt: -1 });
};

applicationSchema.statics.findPendingReview = function() {
  return this.find({
    status: { $in: ['submitted', 'under_review', 'pending_documents'] }
  })
    .populate('applicant', 'firstName lastName mobileNumber')
    .populate('service', 'title category')
    .sort({ priority: -1, createdAt: 1 });
};

applicationSchema.statics.getStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$payment.amount' }
      }
    }
  ]);
};

// Instance methods
applicationSchema.methods.updateProgress = function(step, status, action, performedBy, comments = '') {
  this.currentStep = step;
  this.progress = (step / this.service.workflowSteps.length) * 100;
  
  this.workflowHistory.push({
    step,
    status,
    action,
    performedBy,
    comments,
    performedAt: new Date()
  });
  
  return this.save();
};

applicationSchema.methods.addDocument = function(documentData) {
  this.documents.push({
    ...documentData,
    uploadedAt: new Date()
  });
  
  return this.save();
};

applicationSchema.methods.verifyDocument = function(documentIndex, verifiedBy, notes = '') {
  if (this.documents[documentIndex]) {
    this.documents[documentIndex].verified = true;
    this.documents[documentIndex].verifiedBy = verifiedBy;
    this.documents[documentIndex].verifiedAt = new Date();
    this.documents[documentIndex].verificationNotes = notes;
  }
  
  return this.save();
};

applicationSchema.methods.addNote = function(content, addedBy, isInternal = false) {
  this.notes.push({
    content,
    addedBy,
    isInternal,
    addedAt: new Date()
  });
  
  return this.save();
};

applicationSchema.methods.sendNotification = function(type, title, message) {
  this.notifications.push({
    type,
    title,
    message,
    sentAt: new Date()
  });
  
  return this.save();
};

const Application = mongoose.model('Application', applicationSchema);

export default Application;
