import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  email: string
  password?: string
  role: string
  department?: string
  position?: string
  avatar?: string
  phone?: string
  website?: string
  lastLogin?: Date
  emailVerified: boolean
  isActive: boolean
  roles?: mongoose.Types.ObjectId[]
  passwordResetToken?: string
  passwordResetExpires?: Date
  emailVerificationToken?: string
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
  createPasswordResetToken(): string
  fullName: string
}

export interface IUserStatics {
  findByEmail(email: string): Promise<IUser | null>
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['admin', 'user'],
    default: 'user'
  },
  roles: [{
    type: Schema.Types.ObjectId,
    ref: 'Role'
  }],
  department: {
    type: String,
    trim: true,
    maxlength: [50, 'Department cannot be more than 50 characters']
  },
  position: {
    type: String,
    trim: true,
    maxlength: [50, 'Position cannot be more than 50 characters']
  },
  avatar: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone cannot be more than 20 characters']
  },
  website: {
    type: String,
    trim: true,
    maxlength: [100, 'Website cannot be more than 100 characters']
  },
  lastLogin: {
    type: Date
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  },
  emailVerificationToken: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id
      delete ret._id
      delete ret.__v
      delete ret.password
      delete ret.passwordResetToken
      delete ret.passwordResetExpires
      delete ret.emailVerificationToken
      return ret
    }
  },
  toObject: { virtuals: true }
})

// Indexes for efficient queries
UserSchema.index({ email: 1, isActive: 1 })
UserSchema.index({ isActive: 1 })
UserSchema.index({ role: 1 })
UserSchema.index({ name: 'text', email: 'text' })

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Only hash password if it's been modified
  if (!this.isModified('password') || !this.password) return next()
  
  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12)
    this.password = hashedPassword
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Instance method to check password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!candidatePassword || !this.password) return false
  return bcrypt.compare(candidatePassword, this.password)
}

// Instance method to generate password reset token
UserSchema.methods.createPasswordResetToken = function(): string {
  const resetToken = crypto.randomUUID()
  
  this.passwordResetToken = resetToken
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  
  return resetToken
}

// Static method to find user by email
UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase(), isActive: true })
}

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return this.name
})

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)