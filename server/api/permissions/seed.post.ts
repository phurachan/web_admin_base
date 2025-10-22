import Permission from '~/server/models/Permission'
import { connectMongoDB } from '~/server/utils/mongodb'
import { API_RESPONSE_CODES, createPredefinedError, createSuccessResponse } from '~/server/utils/responseHandler'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()

    // Define initial permissions (based on current database)
    const initialPermissions = [
      // ========================================
      // MENU PERMISSIONS
      // ========================================
      {
        code: 'dashboard.access',
        name: 'หน้าหลัก',
        description: 'Access to dashboard page',
        module: 'dashboard',
        moduleName: 'หน้าหลัก',
        action: 'access',
        resource: 'dashboard',
        icon: 'home',
        path: '/admin',
        type: 'menu',
        isActive: true
      },
      {
        code: 'components.access',
        name: 'Components',
        description: 'Access to components page',
        module: 'developer',
        moduleName: 'นักพัฒนา',
        action: 'access',
        resource: 'developer',
        icon: 'stop',
        path: '/admin/components',
        type: 'menu',
        isActive: true
      },
      {
        code: 'demo.access',
        name: 'Demo',
        description: 'developer ใช้ในการทดสอบ components',
        module: 'developer',
        moduleName: 'นักพัฒนา',
        action: 'access',
        resource: 'developer',
        icon: 'computer-desktop',
        path: '/admin/demo',
        type: 'menu',
        isActive: true
      },
      {
        code: 'user_management.access',
        name: 'การจัดการสิทธิ์ผู้ใช้งาน',
        description: 'เข้าถึงโมดูลการตั้งค่า / Access to settings module',
        module: 'user_management',
        moduleName: 'การจัดการสิทธิ์ผู้ใช้งาน',
        action: 'access',
        resource: 'user_management',
        icon: 'wrench-screwdriver',
        path: '/admin/user_management',
        type: 'menu',
        isActive: true
      },

      // ========================================
      // ACTION PERMISSIONS
      // ========================================
      {
        code: 'user_management.users',
        name: 'ผู้ใช้ระบบ',
        description: 'Assign roles to users',
        module: 'user_management',
        moduleName: 'การจัดการสิทธิ์ผู้ใช้งาน',
        action: 'update',
        resource: 'users',
        type: 'action',
        isActive: true
      },
      {
        code: 'user_management.roles',
        name: 'บทบาท',
        description: 'จัดการ Role และสิทธิ์ / Manage roles and permissions',
        module: 'user_management',
        moduleName: 'การจัดการสิทธิ์ผู้ใช้งาน',
        action: 'update',
        resource: 'roles',
        type: 'action',
        isActive: true
      },
      {
        code: 'user_management.permissions',
        name: 'สิทธิ์การใช้งาน',
        description: 'จัดการสิทธิ์ / Manage permissions',
        module: 'user_management',
        moduleName: 'การจัดการสิทธิ์ผู้ใช้งาน',
        action: 'update',
        resource: 'permissions',
        type: 'action',
        isActive: true
      }
    ]

    // Insert permissions if they don't exist
    let createdCount = 0
    let skippedCount = 0

    for (const permissionData of initialPermissions) {
      const existing = await Permission.findOne({ code: permissionData.code })

      if (!existing) {
        await Permission.create(permissionData)
        createdCount++
      } else {
        skippedCount++
      }
    }

    return createSuccessResponse({
      created: createdCount,
      skipped: skippedCount,
      total: initialPermissions.length
    }, {
      additionalData: {
        message: `Permissions seeded successfully. Created: ${createdCount}, Skipped: ${skippedCount}`,
      }
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
