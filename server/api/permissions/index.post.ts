import Permission from '~/server/models/Permission'
import { connectMongoDB } from '~/server/utils/mongodb'
import { API_RESPONSE_CODES, createPredefinedError, createSuccessResponse } from '~/server/utils/responseHandler'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()

    const body = await readBody(event)
    const { code, name, description, module, moduleName, action, resource, icon, path, type } = body

    // Validate required fields
    if (!code || !name || !description || !module || !moduleName || !action) {
      throw createPredefinedError(API_RESPONSE_CODES.INVALID_INPUT, {
        details: ['code', 'name', 'description', 'module', 'moduleName', 'action']
      })
    }

    // Check if permission code already exists
    const existingPermission = await Permission.findOne({ code })
    if (existingPermission) {
      throw createPredefinedError(API_RESPONSE_CODES.ALREADY_EXISTS, {
        details: ['code']
      })
    }

    // Create new permission
    const permission = new Permission({
      code,
      name,
      description,
      module,
      moduleName,
      action,
      resource,
      icon,
      path,
      type: type || 'action',
      isActive: true
    })

    await permission.save()

    return createSuccessResponse(permission)
  } catch (error: any) {
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

    // Handle duplicate key errors
    if (error.code === 11000) {
      throw createPredefinedError(API_RESPONSE_CODES.ALREADY_EXISTS)
    }

    // Log unexpected errors
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})