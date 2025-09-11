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
      throw createPredefinedError('UNAUTHORIZED')
    }

    // Check if user has permission to delete users (admin only)
    if (currentUser.role !== 'admin') {
      throw createPredefinedError('FORBIDDEN')
    }

    // Get user ID from params
    const userId = getRouterParam(event, 'id')

    if (!userId) {
      throw createPredefinedError('INVALID_REQUEST', 'User ID is required')
    }

    // Prevent deleting self
    if (userId === currentUser._id.toString()) {
      throw createPredefinedError('INVALID_REQUEST', 'Cannot delete your own account')
    }

    // Find user to delete
    const userToDelete = await User.findById(userId)

    if (!userToDelete) {
      throw createPredefinedError('NOT_FOUND', 'User not found')
    }

    // Soft delete - set isActive to false
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        isActive: false,
        deletedAt: new Date(),
        deletedBy: currentUser._id
      },
      { new: true }
    ).select('_id name email isActive')

    return createSuccessResponseWithMessages({
      data: {
        id: updatedUser?._id.toString(),
        name: updatedUser?.name,
        email: updatedUser?.email,
        isActive: updatedUser?.isActive
      },
      message: 'User deleted successfully'
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
    console.error('Delete user error:', error)

    throw createPredefinedError('INTERNAL_ERROR')
  }
})