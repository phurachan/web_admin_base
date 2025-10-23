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

    const feature = await Feature1.findByIdAndDelete(id)

    if (!feature) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND)
    }

    return createSuccessResponse(null)

  } catch (error: any) {
    console.error('Feature1 delete error:', error)

    // If it's already a createError, throw it as is
    if (error.statusCode) {
      throw error
    }

    // Handle JWT errors
    if (error.message === API_RESPONSE_CODES.INVALID_OR_EXPIRED_TOKEN) {
      throw createPredefinedError(API_RESPONSE_CODES.TOKEN_EXPIRED)
    }

    // Log unexpected errors
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
