import Role from '~/server/models/Role'
import User from '~/server/models/User'
import { extractTokenFromHeader, verifyToken } from '~/server/utils/jwt'
import { connectMongoDB } from '~/server/utils/mongodb'
import { API_RESPONSE_CODES, createPredefinedError, createSuccessResponse } from '~/server/utils/responseHandler'

export default defineEventHandler(async (event) => {
  await connectMongoDB()

  try {
    // Check if roles already exist
    const existingRolesCount = await Role.countDocuments()
    if (existingRolesCount > 0) {
      return createSuccessResponse({
        count: existingRolesCount
      }, { responseType: API_RESPONSE_CODES.ALREADY_EXISTS })
    }

    // Define initial roles (based on current database)
    const initialRoles = [
      {
        name: 'ผู้ดูแลระบบ',
        code: 'admin',
        description: 'มีสิทธิ์เข้าถึงระบบทั้งหมด / Full system access',
        permissions: [
          'dashboard.access',
          'user_management.access',
          'user_management.roles',
          'user_management.users',
          'user_management.permissions',
          'components.access',
          'demo.access'
        ],
        isActive: true,
        createdBy: 'system'
      },
      {
        name: 'ผู้พัฒนา',
        code: 'developer',
        description: 'developer',
        permissions: [
          'dashboard.access',
          'components.access',
          'demo.access',
          'user_management.roles',
          'user_management.permissions',
          'user_management.users'
        ],
        isActive: true,
        createdBy: 'system'
      },
    ]

    let created = 0
    let skipped = 0

    for (const roleData of initialRoles) {
      const existingRole = await Role.findOne({ name: roleData.name })

      if (!existingRole) {
        const role = new Role(roleData)
        await role.save()
        created++
      } else {
        skipped++
      }
    }

    return createSuccessResponse({
      created,
      skipped,
      total: created + skipped
    })
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

    // Log unexpected errors
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})