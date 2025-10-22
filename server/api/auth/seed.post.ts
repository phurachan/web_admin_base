import User from '~/server/models/User'
import { connectMongoDB } from '~/server/utils/mongodb'
import { API_RESPONSE_CODES, createPredefinedError, createSuccessResponse } from '~/server/utils/responseHandler'

export default defineEventHandler(async (event) => {
  await connectMongoDB()

  try {
    // Check if users already exist
    const existingUsersCount = await User.countDocuments()

    if (existingUsersCount > 0) {
      return createSuccessResponse({
        count: existingUsersCount
      })
    }

    // Create default users (based on current database)
    const defaultUsers = [
      {
        name: 'Admin User',
        email: 'admin@moonoi.com',
        password: 'admin123',
        role: 'admin',
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
        department: '',
        position: 'Developer',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=developer',
        isActive: true,
        emailVerified: false
      }
    ]

    const createdUsers = []

    for (const userData of defaultUsers) {
      const user = new User(userData)
      // Create user without roles first (roles will be assigned after roles are seeded)
      user.roles = []
      await user.save()
      createdUsers.push(user)
    }

    return createSuccessResponse({
      count: createdUsers.length,
      users: createdUsers.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        position: user.position
      }))
    })
  } catch (error: any) {
    // Log unexpected errors
    console.error('Seed users error:', error)

    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})