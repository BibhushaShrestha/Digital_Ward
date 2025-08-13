import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  fullName: {
    type: String,
    required: true
  },

  // Authentication
  citizenshipNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{1,2}-\d{4}-\d{5}$/.test(v);
      },
      message: 'Citizenship number must be in format: XX-XXXX-XXXXX'
    }
  },
  mobileNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^(\+977)?[9][6-9]\d{8}$/.test(v);
      },
      message: 'Please enter a valid Nepali mobile number'
    }
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },

  // Role and Permissions
  role: {
    type: String,
    enum: ['citizen', 'staff', 'admin'],
    default: 'citizen'
  },
  permissions: [{
    type: String,
    enum: [
      'view_services',
      'apply_services',
      'view_applications',
      'manage_applications',
      'view_complaints',
      'manage_complaints',
      'view_analytics',
      'manage_users',
      'manage_staff',
      'send_broadcasts',
      'manage_events',
      'view_queue',
      'manage_queue',
      'access_digital_locker',
      'manage_digital_locker',
      'manage_services'
    ]
  }],

  // Profile Information
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  address: {
    province: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true
    },
    municipality: {
      type: String,
      required: true
    },
    ward: {
      type: Number,
      required: true,
      min: 1,
      max: 35
    },
    streetAddress: {
      type: String,
      required: true
    }
  },

  // Staff Specific Fields
  staffInfo: {
    employeeId: {
      type: String,
      unique: true,
      sparse: true
    },
    department: {
      type: String,
      enum: ['administration', 'services', 'complaints', 'finance', 'planning', 'other']
    },
    designation: String,
    joiningDate: Date,
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },

  // Verification and Status
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isMobileVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockedReason: String,

  // Security
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  mobileVerificationOTP: String,
  mobileVerificationExpires: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,

  // Profile Picture
  profilePicture: {
    publicId: String,
    url: String
  },

  // Preferences
  preferences: {
    language: {
      type: String,
      enum: ['en', 'ne'],
      default: 'en'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },

  // Timestamps
  lastLoginAt: Date,
  lastActivityAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
userSchema.virtual('fullNameVirtual').get(function() {
  return `${this.firstName} ${this.lastName}`;
});
userSchema.virtual('fullAddress').get(function() {
  return `${this.address.streetAddress}, Ward ${this.address.ward}, ${this.address.municipality}, ${this.address.district}, ${this.address.province}`;
});

// Indexes (avoid duplicating indexes for fields that already specify unique:true)
userSchema.index({ role: 1 });
userSchema.index({ 'address.ward': 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Instance methods
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};
userSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }
  return this.updateOne(updates);
};
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Static methods
userSchema.statics.findByCitizenship = function(citizenshipNumber) {
  return this.findOne({ citizenshipNumber });
};
userSchema.statics.findByMobile = function(mobileNumber) {
  return this.findOne({ mobileNumber });
};
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};
userSchema.statics.findStaffByWard = function(ward) {
  return this.find({
    role: { $in: ['staff', 'admin'] },
    'address.ward': ward,
    isActive: true
  });
};

const User = mongoose.model('User', userSchema);
export default User;
