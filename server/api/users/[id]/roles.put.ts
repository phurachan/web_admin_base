import mongoose from 'mongoose'
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

    // Check if user has permission to update user roles (admin)
    if (currentUser.role !== 'admin') {
      throw createPredefinedError('FORBIDDEN')
    }

    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { roleIds } = body
    
    if (!id) {
      throw createPredefinedError('MISSING_REQUIRED_FIELDS')
    }

    // Check if user exists
    const user = await User.findById(id)
    if (!user) {
      throw createPredefinedError('USER_NOT_FOUND')
    }

    // Validate role IDs if provided
    if (roleIds && roleIds.length > 0) {
      // Filter out null/undefined values and convert string IDs to ObjectIds
      const validRoleIds = roleIds.filter((id: any) => id != null && id !== '')

      if (validRoleIds.length === 0) {
        // If no valid IDs after filtering, just clear the roles
        const updatedUser: any = await User.findByIdAndUpdate(
          id,
          { roles: [] },
          { new: true, runValidators: true }
        ).populate('roles', 'name description permissions isActive').lean()

        return createSuccessResponseWithMessages({
          data: updatedUser.roles || []
        })
      }

      const objectIds = validRoleIds.map((id: any) => {
        if (mongoose.Types.ObjectId.isValid(id)) {
          return new mongoose.Types.ObjectId(id)
        }
        throw createPredefinedError('INVALID_INPUT')
      })

      const validRoles = await Role.countDocuments({
        _id: { $in: objectIds },
        isActive: true
      })
      if (validRoles !== validRoleIds.length) {
        throw createPredefinedError('INVALID_INPUT')
      }

      // Update user roles with validated ObjectIds
      const updatedUser: any = await User.findByIdAndUpdate(
        id,
        { roles: objectIds },
        { new: true, runValidators: true }
      ).populate('roles', 'name description permissions isActive').lean()

      return createSuccessResponseWithMessages({
        data: updatedUser.roles || []
      })
    }

    // Update user roles (empty array if no roleIds provided)
    const rolesToAssign: any[] = []
    const updatedUser: any = await User.findByIdAndUpdate(
      id,
      { roles: rolesToAssign },
      { new: true, runValidators: true }
    ).populate('roles', 'name description permissions isActive').lean()

    return createSuccessResponseWithMessages({
      data: updatedUser.roles || []
    })
  } catch (error: any) {
    // If it's already a createPredefinedError, throw it as is
    if (error.statusCode) {
      throw error
    }

    // Handle JWT errors
    if (error.message === 'Invalid or expired token') {
      throw createPredefinedError('UNAUTHORIZED')
    }

    // Log unexpected errors
    console.error('Error updating user roles:', error)

    throw createPredefinedError('INTERNAL_ERROR')
  }
})