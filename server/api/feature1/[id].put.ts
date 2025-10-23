import { connectDB } from '~/server/utils/mongodb'
import { Feature1 } from '~/server/models/Feature1'
import { extractTokenFromHeader, verifyToken } from '~/server/utils/jwt'
import { User } from '~/server/models/User'
import { API_RESPONSE_CODES, createPredefinedError, createSuccessResponse } from '~/server/utils/responseHandler'

export default defineEventHandler(async (event) => {
  await connectDB()

  try {
    // Get token from Authorization header
    const authHeader = getHeader(event, 'authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      throw createPredefinedError(API_RESPONSE_CODES.UNAUTHORIZED)
    }

    // Verify and decode token
    const decoded = verifyToken(token)

    // Find current user
    const currentUser = await User.findById(decoded.userId)

    if (!currentUser || !currentUser.isActive) {
      throw createPredefinedError(API_RESPONSE_CODES.USER_NOT_FOUND)
    }

    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS)
    }

    const body = await readBody(event)

    const updateData: any = {
      updatedBy: currentUser._id
    }

    if (body.title !== undefined) updateData.title = body.title.trim()
    if (body.description !== undefined) updateData.description = body.description.trim()
    if (body.displayMode !== undefined) updateData.displayMode = body.displayMode.trim()
    if (body.icon !== undefined) updateData.icon = body.icon.trim()
    if (body.color !== undefined) updateData.color = body.color.trim()
    if (body.type !== undefined) updateData.type = body.type.trim()
    if (body.startDate !== undefined) updateData.startDate = body.startDate
    if (body.endDate !== undefined) updateData.endDate = body.endDate
    if (body.images !== undefined) updateData.images = body.images
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    const feature = await Feature1.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean()

    if (!feature) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND)
    }

    return createSuccessResponse(feature)

  } catch (error: any) {
    console.error('Feature1 update error:', error)

    // If it's already a createError, throw it as is
    if (error.statusCode) {
      throw error
    }

    // Handle JWT errors
    if (error.message === API_RESPONSE_CODES.INVALID_OR_EXPIRED_TOKEN) {
      throw createPredefinedError(API_RESPONSE_CODES.TOKEN_EXPIRED)
    }

    // Handle validation errors
    if (error.name === API_RESPONSE_CODES.VALIDATION_ERROR_EXCEPTION_NAME) {
      const fieldErrors = Object.keys(error.errors)
      throw createPredefinedError(API_RESPONSE_CODES.VALIDATION_ERROR, {
        details: fieldErrors
      })
    }

    // Log unexpected errors
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
