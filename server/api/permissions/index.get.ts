import Permission from '~/server/models/Permission'
import { connectMongoDB } from '~/server/utils/mongodb'
import { createPredefinedError, createSuccessResponseWithMessages } from '~/server/utils/responseHandler'
import { createPermissionFilterConfig } from '~/server/utils/filter_config/userManagement'
import { parseQueryAndBuildFilter } from '~/server/utils/queryParser'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()
    
    const query = getQuery(event)
    
    // Parse query and build MongoDB filter using global utilities
    const { parsedQuery, mongoFilter } = parseQueryAndBuildFilter(
      query, 
      createPermissionFilterConfig(),
      ['name', 'description', 'module', 'resource'] // Custom search fields for permissions
    )
    
    const { page, limit } = parsedQuery.pagination
    const filter = mongoFilter
    
    // Get total count
    const total = await Permission.countDocuments(filter)
    
    // Get permissions with pagination
    const permissions = await Permission.find(filter)
      .sort({ module: 1, action: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
    
    
    return createSuccessResponseWithMessages({
      data: permissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
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
    throw createPredefinedError('INTERNAL_ERROR')
  }
})