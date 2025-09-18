import Permission from '~/server/models/Permission'
import { connectMongoDB } from '~/server/utils/mongodb'
import { createPredefinedError, createSuccessResponseWithMessages } from '~/server/utils/responseHandler'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()

    const body = await readBody(event)
    const { name, description, module, action, resource, type } = body

    // Validate required fields
    if (!name || !description || !module || !action || !resource) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name, description, module, action, and resource are required'
      })
    }

    // Check if permission already exists
    const existingPermission = await Permission.findOne({ name })
    if (existingPermission) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Permission with this name already exists'
      })
    }

    // Create new permission
    const permission = new Permission({
      name,
      description,
      module,
      action,
      resource,
      type: type || 'action', // Use provided type or default to 'action'
      isActive: true
    })

    await permission.save()

    return createSuccessResponseWithMessages({
      data: permission
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