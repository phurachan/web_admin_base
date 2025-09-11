import mongoose, { Document, Schema } from 'mongoose'

export interface IRole extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  description: string
  permissions: string[]
  isActive: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

const RoleSchema = new Schema<IRole>({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Role name cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  permissions: [{
    type: String,
    required: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    required: true
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
RoleSchema.index({ isActive: 1 })
RoleSchema.index({ createdAt: -1 })

export default mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema)