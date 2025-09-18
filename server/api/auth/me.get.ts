import { extractTokenFromHeader, verifyToken } from '~/server/utils/jwt'
import { connectMongoDB } from '~/server/utils/mongodb'
import User from '~/server/models/User'
import { createPredefinedError } from '~/server/utils/responseHandler'

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

    // Find user by ID and populate roles
    const user = await User.findById(decoded.userId)
      .populate('roles', 'name description permissions isActive')

    if (!user || !user.isActive) {
      throw createPredefinedError('USER_NOT_FOUND')
    }

    // Return user data
    return createSuccessResponseWithMessages({
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        position: user.position,
        avatar: user.avatar,
        lastLogin: user.lastLogin,
        emailVerified: user.emailVerified,
        roles: user.roles || []
      }
    })
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
    console.error('Get user error:', error)

    throw createPredefinedError('INTERNAL_ERROR')
  }
})