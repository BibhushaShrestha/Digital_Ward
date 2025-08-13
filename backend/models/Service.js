import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Service title is required'],
    trim: true,
    maxlength: [100, 'Service title cannot exceed 100 characters']
  },
  nepaliTitle: {
    type: String,
    required: [true, 'Nepali title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  nepaliDescription: {
    type: String,
    maxlength: [500, 'Nepali description cannot exceed 500 characters']
  },

  // Service Details
  serviceId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Service category is required'],
    enum: ['certificates', 'letters', 'permits', 'registrations', 'clearances', 'other']
  },
  subcategory: {
    type: String,
    trim: true
  },

  // Processing Information
  fee: {
    amount: {
      type: Number,
      required: [true, 'Service fee is required'],
      min: [0, 'Fee cannot be negative']
    },
    currency: {
      type: String,
      default: 'NPR',
      enum: ['NPR', 'USD']
    },
    displayText: {
      type: String,
      default: 'Rs.'
    }
  },
  processingTime: {
    minDays: {
      type: Number,
      required: [true, 'Minimum processing time is required'],
      min: [1, 'Processing time must be at least 1 day']
    },
    maxDays: {
      type: Number,
      required: [true, 'Maximum processing time is required'],
      min: [1, 'Processing time must be at least 1 day']
    },
    displayText: {
      type: String,
      required: true
    }
  },

  // Requirements
  requiredDocuments: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    isRequired: {
      type: Boolean,
      default: true
    },
    fileTypes: [{
      type: String,
      enum: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']
    }],
    maxSize: {
      type: Number,
      default: 5242880 // 5MB
    }
  }],

  // Eligibility
  eligibilityCriteria: [{
    type: String,
    trim: true
  }],
  ageRequirement: {
    minAge: {
      type: Number,
      min: 0
    },
    maxAge: {
      type: Number,
      min: 0
    }
  },
  residencyRequirement: {
    type: Boolean,
    default: true
  },

  // Service Configuration
  isActive: {
    type: Boolean,
    default: true
  },
  isOnline: {
    type: Boolean,
    default: true
  },
  requiresVerification: {
    type: Boolean,
    default: false
  },
  requiresApproval: {
    type: Boolean,
    default: true
  },
  autoApprove: {
    type: Boolean,
    default: false
  },

  // Workflow
  workflowSteps: [{
    step: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    isRequired: {
      type: Boolean,
      default: true
    },
    estimatedTime: {
      type: Number, // in hours
      default: 24
    },
    assignedRole: {
      type: String,
      enum: ['citizen', 'staff', 'admin', 'supervisor']
    }
  }],

  // Form Configuration
  formFields: [{
    name: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'email', 'number', 'date', 'select', 'textarea', 'file', 'checkbox', 'radio'],
      required: true
    },
    isRequired: {
      type: Boolean,
      default: false
    },
    placeholder: String,
    options: [String], // For select, radio, checkbox
    validation: {
      min: Number,
      max: Number,
      pattern: String,
      customMessage: String
    },
    order: {
      type: Number,
      default: 0
    }
  }],

  // Display Configuration
  icon: {
    type: String,
    default: 'FileText'
  },
  color: {
    type: String,
    default: 'bg-blue-500'
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },

  // Statistics
  totalApplications: {
    type: Number,
    default: 0
  },
  successRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  averageProcessingTime: {
    type: Number,
    default: 0
  },

  // Metadata
  tags: [String],
  keywords: [String],
  seoDescription: String,

  // Timestamps
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for display fee
serviceSchema.virtual('displayFee').get(function() {
  return `${this.fee.displayText} ${this.fee.amount}`;
});

// Virtual for display processing time
serviceSchema.virtual('displayProcessingTime').get(function() {
  return this.processingTime.displayText;
});

// Virtual for total required documents
serviceSchema.virtual('totalRequiredDocuments').get(function() {
  return this.requiredDocuments.filter(doc => doc.isRequired).length;
});

// Indexes
serviceSchema.index({ serviceId: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ priority: -1 });
serviceSchema.index({ title: 'text', description: 'text', nepaliTitle: 'text' });

// Pre-save middleware
serviceSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Static methods
serviceSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ priority: -1, title: 1 });
};

serviceSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ priority: -1, title: 1 });
};

serviceSchema.statics.findPopular = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ totalApplications: -1 })
    .limit(limit);
};

serviceSchema.statics.searchServices = function(query) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { nepaliTitle: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      }
    ]
  }).sort({ priority: -1, title: 1 });
};

// Instance methods
serviceSchema.methods.updateStatistics = function(processingTime, isSuccessful) {
  this.totalApplications += 1;
  
  if (isSuccessful) {
    this.successRate = ((this.successRate * (this.totalApplications - 1)) + 100) / this.totalApplications;
  } else {
    this.successRate = (this.successRate * (this.totalApplications - 1)) / this.totalApplications;
  }
  
  this.averageProcessingTime = ((this.averageProcessingTime * (this.totalApplications - 1)) + processingTime) / this.totalApplications;
  
  return this.save();
};

const Service = mongoose.model('Service', serviceSchema);

export default Service;
