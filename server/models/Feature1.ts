import mongoose, { Schema, Document } from 'mongoose'

export interface IFeature1 extends Document {
  code: number
  title: string
  description: string
  displayMode: string
  icon: string
  color: string
  type: string
  startDate: string
  endDate: string
  images: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy?: mongoose.Types.ObjectId
  updatedBy?: mongoose.Types.ObjectId
}

const Feature1Schema = new Schema<IFeature1>({
  code: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  displayMode: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
})

Feature1Schema.index({ type: 1 })
Feature1Schema.index({ isActive: 1 })
Feature1Schema.index({ startDate: 1, endDate: 1 })

export const Feature1 = mongoose.models.Feature1 || mongoose.model<IFeature1>('Feature1', Feature1Schema)

export async function getNextFeature1Code(): Promise<number> {
  const lastFeature = await Feature1.findOne().sort({ code: -1 }).select('code')

  if (!lastFeature) {
    return 100001
  }

  return lastFeature.code + 1
}
