import { extractTokenFromHeader, verifyToken } from '~/lib/jwt'
import { connectMongoDB } from '~/lib/mongodb'
import Role from '~/models/Role'
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
      throw createPredefinedError('USER_NOT_FOUND')
    }
    
    // Check if user has permission to seed roles (admin only)
    if (currentUser.role !== 'admin') {
      throw createPredefinedError('FORBIDDEN')
    }
    
    // Check if roles already exist
    const existingRolesCount = await Role.countDocuments()
    if (existingRolesCount > 0) {
      return createSuccessResponseWithMessages({
        message: 'Roles already exist',
        count: existingRolesCount
      }, 'ALREADY_EXISTS')
    }
    
    // Define initial roles
    const initialRoles = [
      {
        name: 'Admin',
        description: 'Full system access',
        permissions: [
          'dashboard.access',
          'components.access',
          'user_management.access',
          'user_management.users',
          'user_management.roles',
          'user_management.permissions',
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
    
    return createSuccessResponseWithMessages({
      message: `Roles seeded successfully. Created: ${created}, Skipped: ${skipped}`,
      data: {
        created,
        skipped,
        total: created + skipped
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
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const fieldErrors = Object.keys(error.errors)
      throw createPredefinedError('VALIDATION_ERROR', {
        details: fieldErrors
      })
    }
    
    // Log unexpected errors
    throw createPredefinedError('INTERNAL_ERROR')
  }
})