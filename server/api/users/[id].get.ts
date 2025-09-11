import { extractTokenFromHeader, verifyToken } from '~/lib/jwt'
import { connectMongoDB } from '~/lib/mongodb'
import User from '~/models/User'
import { createPredefinedError, createSuccessResponseWithMessages } from '~/server/utils/responseHandler'

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

    // Get user ID from route params
    const userId = getRouterParam(event, 'id')

    if (!userId) {
      throw createPredefinedError('INVALID_USER_ID')
    }

    // Check if user has permission to view users (admin or viewing own profile)
    if (currentUser.role !== 'admin' && currentUser._id.toString() !== userId) {
      throw createPredefinedError('FORBIDDEN')
    }

    // Find the user
    const user: any = await User.findById(userId)
      .populate('roles', 'name description isActive')
      .select('_id name email role department position avatar lastLogin emailVerified isActive roles createdAt updatedAt')
      .lean()

    if (!user) {
      throw createPredefinedError('USER_NOT_FOUND')
    }

    // Transform user data
    const transformedUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
      avatar: user.avatar,
      lastLogin: user.lastLogin,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      roles: user.roles || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }

    return createSuccessResponseWithMessages({data: transformedUser})

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