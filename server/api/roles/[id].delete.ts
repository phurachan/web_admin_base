import { extractTokenFromHeader, verifyToken } from '~/lib/jwt'
import { connectMongoDB } from '~/lib/mongodb'
import Role from '~/models/Role'
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

    // Check if user has permission to delete roles (admin only)
    if (currentUser.role !== 'admin') {
      throw createPredefinedError('FORBIDDEN')
    }

    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createPredefinedError('MISSING_REQUIRED_FIELDS', {
        details: [VALIDATION_DETAILS.INVALID_ROLE_ID]
      })
    }

    // Check if role exists
    const role = await Role.findById(id)
    if (!role) {
      throw createPredefinedError('NOT_FOUND')
    }

    // Check if role is assigned to any users
    const usersWithRole = await User.countDocuments({ roles: id })
    if (usersWithRole > 0) {
      throw createPredefinedError('INVALID_INPUT', {
        details: [VALIDATION_DETAILS.ROLE_IN_USE]
      })
    }

    // Delete the role
    await Role.findByIdAndDelete(id)

    return createSuccessResponseWithMessages({})
  } catch (error: any) {
    // If it's already a createError, throw it as is
    if (error.statusCode) {
      throw error
    }

    // Handle JWT errors
    if (error.message === 'Invalid or expired token') {
      throw createPredefinedError('TOKEN_EXPIRED')
    }

    // Log unexpected errors
    console.error('Error deleting role:', error)

    throw createPredefinedError('INTERNAL_ERROR')
  }
})