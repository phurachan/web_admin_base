import bcrypt from 'bcryptjs'
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

    // Check if user has permission to update users (admin)
    if (currentUser.role !== 'admin') {
      throw createPredefinedError('FORBIDDEN')
    }

    // Get user ID from route params
    const userId = getRouterParam(event, 'id')

    if (!userId) {
      throw createPredefinedError('INVALID_INPUT', {
        details: [VALIDATION_DETAILS.USER_ID_INVALID]
      })
    }

    // Get request body
    const body = await readBody(event)
    const { name, email, department, position, isActive, password } = body

    // Validation
    const errors: Record<string, string> = {}

    if (!name || !name.trim()) {
      errors.name = VALIDATION_DETAILS.FIELD_NAME_REQUIRED
    }

    if (!email || !email.trim()) {
      errors.email = VALIDATION_DETAILS.FIELD_EMAIL_REQUIRED
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = VALIDATION_DETAILS.EMAIL_INVALID_FORMAT
    }

    if (password && password.length < 6) {
      errors.password = VALIDATION_DETAILS.PASSWORD_MIN_6
    }

    // Check if email already exists (excluding current user)
    if (email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: userId }
      })

      if (existingUser) {
        errors.email = VALIDATION_DETAILS.USER_EMAIL_DUPLICATE
      }
    }

    if (Object.keys(errors).length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation failed',
        data: { errors }
      })
    }

    // Find the user to update
    const userToUpdate = await User.findById(userId)

    if (!userToUpdate) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      })
    }

    // Prepare update data
    const updateData: any = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      department: department?.trim() || '',
      position: position?.trim() || '',
      isActive: isActive !== false, // Default to true if not specified
      updatedAt: new Date()
    }

    // Hash password if provided
    if (password && password.trim()) {
      updateData.password = await bcrypt.hash(password.trim(), 12)
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      {
        new: true,
        runValidators: true,
        select: '_id name email role department position avatar lastLogin emailVerified isActive'
      }
    ).populate('roles', 'name description isActive')

    if (!updatedUser) {
      throw createPredefinedError('USER_NOT_FOUND')
    }

    // Transform user data for response
    const transformedUser = {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      department: updatedUser.department,
      position: updatedUser.position,
      avatar: updatedUser.avatar,
      lastLogin: updatedUser.lastLogin,
      emailVerified: updatedUser.emailVerified,
      isActive: updatedUser.isActive,
      roles: updatedUser.roles || []
    }

    return createSuccessResponseWithMessages({
      data: transformedUser
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

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors: Record<string, string> = {}
      for (const field in error.errors) {
        errors[field] = error.errors[field].message
      }
      throw createPredefinedError('VALIDATION_ERROR', {
        details: errors
      })
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      throw createPredefinedError('ALREADY_EXISTS')
    }

    // Log unexpected errors
    console.error('Update user error:', error)

    throw createPredefinedError('INTERNAL_ERROR')
  }
})