import { connectMongoDB } from '~/server/utils/mongodb'
import Role from '~/server/models/Role'
import User from '~/server/models/User'
import { createPredefinedError, createSuccessResponseWithMessages } from '~/server/utils/responseHandler'

export default defineEventHandler(async (event) => {
  await connectMongoDB()

  try {
    // Check if users already exist
    const existingUsersCount = await User.countDocuments()

    if (existingUsersCount > 0) {
      return createSuccessResponseWithMessages({
        data: {
          count: existingUsersCount
        }
      })
    }

    // Create default users
    const defaultUsers = [
      {
        name: 'System Administrator',
        email: 'admin@moonoi.com',
        password: 'admin123',
        role: 'admin',
        department: 'IT',
        position: 'System Administrator',
        isActive: true,
        emailVerified: true
      }
    ]

    // Get roles from database
    const adminRole = await Role.findOne({ name: 'Admin' })

    const createdUsers = []

    for (const userData of defaultUsers) {
      const user = new User(userData)

      // Assign appropriate roles based on user role
      if (userData.role === 'admin' && adminRole) {
        user.roles = [adminRole._id]
      }

      await user.save()
      createdUsers.push(user)
    }

    return createSuccessResponseWithMessages({
      data: {
        count: createdUsers.length,
        users: createdUsers.map(user => ({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          position: user.position
        }))
      }
    })
  } catch (error: any) {
    // Log unexpected errors
    console.error('Seed users error:', error)

    throw createPredefinedError('INTERNAL_ERROR')
  }
})