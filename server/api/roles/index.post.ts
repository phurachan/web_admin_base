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

    // Check if user has permission to create roles (admin only)
    if (currentUser.role !== 'admin') {
      throw createPredefinedError('FORBIDDEN')
    }

    const body = await readBody(event)
    const { name, description, permissions, createdBy } = body

    // Validate required fields
    if (!name || !description || !createdBy) {
      throw createPredefinedError('MISSING_REQUIRED_FIELDS', {
        details: [VALIDATION_DETAILS.FIELD_NAME_REQUIRED, VALIDATION_DETAILS.FIELD_DESCRIPTION_REQUIRED, VALIDATION_DETAILS.FIELD_NAME_REQUIRED]
      })
    }

    // Check if role already exists
    const existingRole = await Role.findOne({ name })
    if (existingRole) {
      throw createPredefinedError('ALREADY_EXISTS')
    }

    // Create new role
    const role = new Role({
      name,
      description,
      permissions: permissions || [],
      createdBy,
      isActive: true
    })

    await role.save()

    return createSuccessResponseWithMessages({
      data: role
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
      const fieldErrors = Object.keys(error.errors)
      throw createPredefinedError('VALIDATION_ERROR', {
        details: fieldErrors
      })
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      throw createPredefinedError('ALREADY_EXISTS')
    }

    // Log unexpected errors
    throw createPredefinedError('INTERNAL_ERROR')
  }
})