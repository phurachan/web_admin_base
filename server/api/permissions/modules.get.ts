import { connectMongoDB } from '~/server/utils/mongodb'
import Permission from '~/server/models/Permission'
import { createPredefinedError, createSuccessResponseWithMessages } from '~/server/utils/responseHandler'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()

    // Get unique modules
    const modules = await Permission.distinct('module', { isActive: true })

    return createSuccessResponseWithMessages({
      data: modules.sort()
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