import bcrypt from 'bcryptjs'
import { connectMongoDB } from '~/lib/mongodb'
import User from '~/models/User'
import { createBadRequestError, createPredefinedError, createSuccessResponseWithMessages } from '~/server/utils/responseHandler'

export default defineEventHandler(async (event) => {
  
  await connectMongoDB()

  try {
    const body = await readBody(event)
    
    // Validate required fields
    if (!body.name || !body.email || !body.password) {
      throw createPredefinedError('MISSING_REQUIRED_FIELDS', {
        details: ['name', 'email', 'password']
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: body.email })
    if (existingUser) {
      throw createBadRequestError('User with this email already exists')
    }

    // Hash the password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(body.password, saltRounds)

    // Create user data
    const userData = {
      name: body.name.trim(),
      email: body.email.toLowerCase().trim(),
      password: hashedPassword,
      role: body.role || 'user', // Default to 'user' role
      department: body.department || '',
      position: body.position || '',
      isActive: body.isActive !== undefined ? body.isActive : true,
      avatar: body.avatar || null,
      roles: body.roles || [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Create new user
    const newUser = new User(userData)
    const savedUser = await newUser.save()

    // Populate roles if any
    await savedUser.populate('roles', 'name description permissions isActive')

    // Return user data without password
    const userResponse = {
      id: savedUser._id.toString(),
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      department: savedUser.department,
      position: savedUser.position,
      avatar: savedUser.avatar,
      isActive: savedUser.isActive,
      roles: savedUser.roles || [],
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt
    }

    return createSuccessResponseWithMessages({
      data: userResponse
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
      console.log(error);
      
      const fieldErrors = Object.keys(error.errors)
      throw createPredefinedError('VALIDATION_ERROR', {
        details: fieldErrors
      })
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      throw createPredefinedError('ALREADY_EXISTS')
    }

    // Log unexpected errors
    throw createPredefinedError('INTERNAL_ERROR')
  }
})