import { extractTokenFromHeader, verifyToken } from '~/lib/jwt'
import { connectMongoDB } from '~/lib/mongodb'
import User from '~/models/User'
import { createPredefinedError, createSuccessResponseWithMessages, VALIDATION_DETAILS } from '~/server/utils/responseHandler'

export default defineEventHandler(async (event) => {
  await connectMongoDB()

  try {
    // Get token from Authorization header
    const authHeader = getHeader(event, 'authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      throw createPredefinedError('UNAUTHORIZED')
    }

    // Verify and decode token
    const decoded = verifyToken(token)

    // Find current user to check permissions
    const currentUser = await User.findById(decoded.userId)

    if (!currentUser || !currentUser.isActive) {
      throw createPredefinedError('USER_NOT_FOUND')
    }

    // Check if user has permission to view user roles (admin)
    if (currentUser.role !== 'admin') {
      throw createPredefinedError('FORBIDDEN')
    }

    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createPredefinedError('MISSING_REQUIRED_FIELDS', {
        details: [VALIDATION_DETAILS.USER_ID_INVALID]
      })
    }

    const user: any = await User.findById(id)
      .populate('roles', 'name description permissions isActive')
      .lean()

    if (!user) {
      throw createPredefinedError('USER_NOT_FOUND')
    }

    return createSuccessResponseWithMessages({
      data: user.roles || []
    })
  } catch (error: any) {
    // If it's already a createError, throw it as is
    if (error.statusCode) {
      throw error
    }

    // Handle JWT errors
    if (error.message === 'Invalid or expired token') {
      throw createPredefinedError('UNAUTHORIZED')
    }

    // Log unexpected errors
    console.error('Error fetching user roles:', error)

    throw createPredefinedError('INTERNAL_ERROR')
  }
})