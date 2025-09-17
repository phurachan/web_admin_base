import Permission from '~/models/Permission'
import { connectMongoDB } from '~/lib/mongodb'
import { createPredefinedError, createSuccessResponseWithMessages, VALIDATION_DETAILS } from '~/server/utils/responseHandler'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()
    
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      throw createPredefinedError('MISSING_REQUIRED_FIELDS', {
        details: [VALIDATION_DETAILS.INVALID_PERMISSION_ID]
      })
    }
    
    const permission = await Permission.findById(id)
    
    if (!permission) {
      throw createPredefinedError('NOT_FOUND')
    }
    
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

    // Log unexpected errors
    throw createPredefinedError('INTERNAL_ERROR')
  }
})