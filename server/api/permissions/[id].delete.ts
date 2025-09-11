import Permission from '~/models/Permission'
import Role from '~/models/Role'
import { connectMongoDB } from '~/lib/mongodb'
import { createPredefinedError, createSuccessResponseWithMessages } from '~/server/utils/responseHandler'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()

    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createPredefinedError('MISSING_REQUIRED_FIELDS', {
        details: ['id']
      })
    }

    // Check if permission exists
    const permission = await Permission.findById(id)
    if (!permission) {
      throw createPredefinedError('NOT_FOUND')
    }

    // Check if permission is assigned to any roles
    const rolesWithPermission = await Role.countDocuments({ permissions: permission.name })
    if (rolesWithPermission > 0) {
      throw createPredefinedError('DATA_USED')
    }

    // Delete the permission
    await Permission.findByIdAndDelete(id)

    return createSuccessResponseWithMessages({})
  } catch (error: any) {
    console.error('Error deleting permission:', error)
    if (error.statusCode) {
      throw error
    }

    // Handle JWT errors
    if (error.message === 'Invalid or expired token') {
      throw createPredefinedError('TOKEN_EXPIRED')
    }

    throw createPredefinedError('INTERNAL_ERROR')
  }
})