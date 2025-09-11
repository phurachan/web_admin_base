import type { AuthLoginRequest } from '~/composables/store_models/auth'
import { signToken } from '~/lib/jwt'
import { connectMongoDB } from '~/lib/mongodb'
import User from '~/models/User'
import { createPredefinedError, createSuccessResponseWithMessages } from '~/server/utils/responseHandler'

export default defineEventHandler(async (event) => {
  await connectMongoDB()

  try {
    const body: AuthLoginRequest = await readBody(event)
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      throw createPredefinedError('MISSING_REQUIRED_FIELDS', {
        details: ['email', 'password'],
      })
    }

    // Find user by email and populate roles
    const user = await User.findOne({ email }).populate('roles', 'name description permissions isActive')

    if (!user) {
      throw createPredefinedError('INVALID_CREDENTIALS')
    }

    // Check if user is active
    if (!user.isActive) {
      throw createPredefinedError('ACCOUNT_DEACTIVATED')
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
      throw createPredefinedError('INVALID_CREDENTIALS')
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate JWT token
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    })

    // Set cookies server-side
    setCookie(event, 'token', token, {
      secure: false,
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax'
    })

    setCookie(event, 'user', JSON.stringify({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
      avatar: user.avatar,
      roles: user.roles || []
    }), {
      secure: false,
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax'
    })

    // Return user data and token
    return createSuccessResponseWithMessages({
      data: {
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          position: user.position,
          avatar: user.avatar,
          roles: user.roles || []
        }
      }
    }, 'LOGIN_SUCCESS')
  } catch (error: any) {
    // If it's already a createError, throw it as is
    if (error.statusCode) {
      throw error
    }

    // Log unexpected errors
    console.error('Login error:', error)

    throw createPredefinedError('INTERNAL_ERROR')
  }
})