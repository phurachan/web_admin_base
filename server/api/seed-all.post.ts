import Permission from '~/server/models/Permission'
import Role from '~/server/models/Role'
import User from '~/server/models/User'
import { connectMongoDB } from '~/server/utils/mongodb'
import { API_RESPONSE_CODES, createPredefinedError, createSuccessResponse } from '~/server/utils/responseHandler'

export default defineEventHandler(async (event) => {
  await connectMongoDB()

  try {
    const results = {
      permissions: { created: 0, skipped: 0 },
      roles: { created: 0, skipped: 0 },
      users: { created: 0, skipped: 0 }
    }

    // ========================================
    // STEP 1: Seed Permissions
    // ========================================
    const initialPermissions = [
      // MENU PERMISSIONS
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
      // ACTION PERMISSIONS
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

    for (const permissionData of initialPermissions) {
      const existing = await Permission.findOne({ code: permissionData.code })
      if (!existing) {
        await Permission.create(permissionData)
        results.permissions.created++
      } else {
        results.permissions.skipped++
      }
    }

    // ========================================
    // STEP 2: Seed Roles
    // ========================================
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
      }
    ]

    for (const roleData of initialRoles) {
      const existingRole = await Role.findOne({ code: roleData.code })
      if (!existingRole) {
        await Role.create(roleData)
        results.roles.created++
      } else {
        results.roles.skipped++
      }
    }

    // ========================================
    // STEP 3: Seed Users with Roles
    // ========================================
    const adminRole = await Role.findOne({ code: 'admin' })
    const developerRole = await Role.findOne({ code: 'developer' })

    const defaultUsers = [
      {
        name: 'Admin User',
        email: 'admin@moonoi.com',
        password: 'admin123',
        role: 'admin',
        roleDoc: adminRole,
        department: '',
        position: '',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        isActive: true,
        emailVerified: false
      },
      {
        name: 'Developer',
        email: 'dev@moonoi.com',
        password: 'dev123',
        role: 'user',
        roleDoc: developerRole,
        department: '',
        position: 'Developer',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=developer',
        isActive: true,
        emailVerified: false
      }
    ]

    for (const userData of defaultUsers) {
      const existingUser = await User.findOne({ email: userData.email })
      if (!existingUser) {
        const { roleDoc, ...userDataWithoutRoleDoc } = userData
        const user = new User(userDataWithoutRoleDoc)

        // Assign role if exists
        if (roleDoc) {
          user.roles = [roleDoc._id]
        }

        await user.save()
        results.users.created++
      } else {
        results.users.skipped++
      }
    }

    // ========================================
    // Summary Response
    // ========================================
    return createSuccessResponse({
      summary: {
        permissions: {
          created: results.permissions.created,
          skipped: results.permissions.skipped,
          total: initialPermissions.length
        },
        roles: {
          created: results.roles.created,
          skipped: results.roles.skipped,
          total: initialRoles.length
        },
        users: {
          created: results.users.created,
          skipped: results.users.skipped,
          total: defaultUsers.length
        }
      },
      message: `Seeding completed! Created ${results.permissions.created} permissions, ${results.roles.created} roles, ${results.users.created} users.`
    })
  } catch (error: any) {
    // Log unexpected errors
    console.error('Seed all error:', error)

    // Handle validation errors
    if (error.name === API_RESPONSE_CODES.VALIDATION_ERROR_EXCEPTION_NAME) {
      const fieldErrors = Object.keys(error.errors || {})
      throw createPredefinedError(API_RESPONSE_CODES.VALIDATION_ERROR, {
        details: fieldErrors
      })
    }

    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
