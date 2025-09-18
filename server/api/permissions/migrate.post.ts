import Permission from '~/server/models/Permission'
import { connectMongoDB } from '~/server/utils/mongodb'
import { createPredefinedError, createSuccessResponseWithMessages } from '~/server/utils/responseHandler'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()

    // Find all permissions that don't have the 'type' field or have it as null/undefined
    const permissionsWithoutType = await Permission.find({
      $or: [
        { type: { $exists: false } },
        { type: null },
        { type: undefined }
      ]
    })

    let updatedCount = 0

    // Update each permission to add the default 'type' field
    for (const permission of permissionsWithoutType) {
      await Permission.findByIdAndUpdate(
        permission._id,
        { 
          $set: { 
            type: 'action' // Set default value as 'action'
          } 
        },
        { runValidators: false } // Skip validation since we're just adding the missing field
      )
      updatedCount++
    }

    // Also check for any permissions that might have invalid type values
    const invalidTypePermissions = await Permission.find({
      type: { $nin: ['menu', 'action', 'input'] }
    })

    // Fix any invalid type values
    for (const permission of invalidTypePermissions) {
      await Permission.findByIdAndUpdate(
        permission._id,
        { 
          $set: { 
            type: 'action' // Set default value as 'action' for invalid types
          } 
        },
        { runValidators: false }
      )
      updatedCount++
    }

    // Get final count of all permissions for verification
    const totalPermissions = await Permission.countDocuments()
    const validTypeCount = await Permission.countDocuments({
      type: { $in: ['menu', 'action', 'input'] }
    })

    const migrationStatus = {
      updated: updatedCount,
      totalPermissions: totalPermissions,
      permissionsWithValidType: validTypeCount,
      migrationComplete: totalPermissions === validTypeCount
    }

    return createSuccessResponseWithMessages({
      message: `Migration completed successfully. Updated ${updatedCount} permissions with default type 'action'.`,
      data: migrationStatus
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

    // Log unexpected errors for debugging
    console.error('Migration error:', error)
    throw createPredefinedError('INTERNAL_ERROR')
  }
})