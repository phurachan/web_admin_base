import { connectDB } from '~/server/utils/mongodb'
import { Feature1 } from '~/server/models/Feature1'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const id = getRouterParam(event, 'id')

    if (!id) {
      return {
        success: false,
        message: 'Feature ID is required'
      }
    }

    const feature = await Feature1.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean()

    if (!feature) {
      return {
        success: false,
        message: 'Feature not found'
      }
    }

    return {
      success: true,
      data: feature
    }

  } catch (error: any) {
    console.error('Feature1 fetch error:', error)
    return {
      success: false,
      message: error.message || 'Failed to fetch feature'
    }
  }
})
