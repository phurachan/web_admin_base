import mongoose, { Document, Schema } from 'mongoose'

export interface IPermission extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  description: string
  module: string
  action: string
  resource: string
  type: 'menu' | 'action' | 'input'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const PermissionSchema = new Schema<IPermission>({
  name: {
    type: String,
    required: [true, 'Permission name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Permission name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  module: {
    type: String,
    required: [true, 'Module is required'],
    trim: true,
    maxlength: [50, 'Module cannot be more than 50 characters']
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: ['create', 'read', 'update', 'delete', 'access', 'hr_view', 'approve', 'reject', 'balance_manage', 'export', 'submit', 'reports'],
    trim: true
  },
  resource: {
    type: String,
    required: [true, 'Resource is required'],
    trim: true,
    maxlength: [50, 'Resource cannot be more than 50 characters']
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: ['menu', 'action', 'input'],
    default: 'action'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id.toString()
      delete ret._id
      delete ret.__v
      return ret
    }
  }
})

// Add indexes for better performance (name index automatically created by unique: true)
PermissionSchema.index({ module: 1 })
PermissionSchema.index({ action: 1 })
PermissionSchema.index({ resource: 1 })
PermissionSchema.index({ type: 1 })
PermissionSchema.index({ isActive: 1 })

export default mongoose.models.Permission || mongoose.model<IPermission>('Permission', PermissionSchema)