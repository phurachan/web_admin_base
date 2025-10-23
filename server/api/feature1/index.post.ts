import { connectDB } from '~/server/utils/mongodb'
import { Feature1, getNextFeature1Code } from '~/server/models/Feature1'
import { extractTokenFromHeader, verifyToken } from '~/server/utils/jwt'
import { User } from '~/server/models/User'
import { API_RESPONSE_CODES, createPredefinedError, createSuccessResponse, VALIDATION_DETAILS } from '~/server/utils/responseHandler'

export default defineEventHandler(async (event: any) => {
  await connectDB()

  try {
    // Get token from Authorization header
    const authHeader = getHeader(event, 'authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      throw createPredefinedError(API_RESPONSE_CODES.UNAUTHORIZED)
    }

    // Verify and decode token
    const decoded = verifyToken(token)

    // Find current user
    const currentUser = await User.findById(decoded.userId)

    if (!currentUser || !currentUser.isActive) {
      throw createPredefinedError(API_RESPONSE_CODES.USER_NOT_FOUND)
    }

    const body = await readBody(event)

    // Validate required fields
    if (!body.title || !body.description || !body.displayMode || !body.icon || !body.color || !body.type || !body.startDate || !body.endDate) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS, {
        details: [VALIDATION_DETAILS.FIELD_TITLE_REQUIRED, VALIDATION_DETAILS.FIELD_DESCRIPTION_REQUIRED]
      })
    }

    const code = await getNextFeature1Code()

    const feature = await Feature1.create({
      code,
      title: body.title.trim(),
      description: body.description.trim(),
      displayMode: body.displayMode.trim(),
      icon: body.icon.trim(),
      color: body.color.trim(),
      type: body.type.trim(),
      startDate: body.startDate,
      endDate: body.endDate,
      images: body.images || [],
      isActive: body.isActive !== undefined ? body.isActive : true,
      createdBy: currentUser._id,
      updatedBy: currentUser._id
    })

    const populatedFeature = await Feature1.findById(feature._id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean()

    return createSuccessResponse(populatedFeature)

  } catch (error: any) {
    console.error('Feature1 create error:', error)

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

    // Handle duplicate key errors
    if (error.code === 11000) {
      throw createPredefinedError(API_RESPONSE_CODES.ALREADY_EXISTS)
    }

    // Log unexpected errors
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
