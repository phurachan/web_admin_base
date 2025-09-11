// Standardized error handler for server API responses

export interface APIError {
  statusCode: number
  statusMessage: string
  data?: any
  stack?: string
  message?: string | MultiLangMessage
}

// Common HTTP Status Codes
export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
} as const

// Predefined error messages with multi-language support
export const API_ERROR_MESSAGES = {
  // Authentication & Authorization
  INVALID_CREDENTIALS: {
    th: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
    en: 'Invalid email or password'
  },
  UNAUTHORIZED: {
    th: 'จำเป็นต้องเข้าสู่ระบบ',
    en: 'Authentication required'
  },
  FORBIDDEN: {
    th: 'การเข้าถึงถูกปฏิเสธ ไม่มีสิทธิ์เพียงพอ',
    en: 'Access denied. Insufficient permissions'
  },
  TOKEN_EXPIRED: {
    th: 'โทเค็นการยืนยันตัวตนหมดอายุแล้ว',
    en: 'Authentication token has expired'
  },
  ACCOUNT_DEACTIVATED: {
    th: 'บัญชีถูกปิดการใช้งาน',
    en: 'Account has been deactivated'
  },

  // Validation
  VALIDATION_ERROR: {
    th: 'การตรวจสอบข้อมูลล้มเหลว',
    en: 'Validation failed'
  },
  MISSING_REQUIRED_FIELDS: {
    th: 'ข้อมูลจำเป็นขาดหายไป',
    en: 'Required fields are missing'
  },
  INVALID_INPUT: {
    th: 'ข้อมูลที่ป้อนไม่ถูกต้อง',
    en: 'Invalid input provided'
  },

  // Resource Management
  NOT_FOUND: {
    th: 'ไม่พบข้อมูลที่ร้องขอ',
    en: 'Resource not found'
  },
  ALREADY_EXISTS: {
    th: 'ข้อมูลมีอยู่แล้ว',
    en: 'Resource already exists'
  },

  // Server Errors
  INTERNAL_ERROR: {
    th: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    en: 'Internal server error'
  },
  DATABASE_ERROR: {
    th: 'การดำเนินการฐานข้อมูลล้มเหลว',
    en: 'Database operation failed'
  },

  // Success Messages
  SUCCESS: {
    th: 'เสำเร็จ',
    en: 'successful'
  },
  LOGIN_SUCCESS: {
    th: 'เข้าสู่ระบบสำเร็จ',
    en: 'Login successful'
  },
  LOGOUT_SUCCESS: {
    th: 'ออกจากระบบสำเร็จ',
    en: 'Logout successful'
  },
  REGISTER_SUCCESS: {
    th: 'ลงทะเบียนสำเร็จ',
    en: 'Registration successful'
  },

  // User Management
  USER_NOT_FOUND: {
    th: 'ไม่พบผู้ใช้งาน',
    en: 'User not found'
  },
  USER_ALREADY_EXISTS: {
    th: 'ผู้ใช้งานมีอยู่แล้ว',
    en: 'User already exists'
  },
  INVALID_USER_ID: {
    th: 'รหัสผู้ใช้งานไม่ถูกต้อง',
    en: 'Invalid user ID'
  },
  PASSWORD_RESET_SUCCESS: {
    th: 'รีเซ็ตรหัสผ่านสำเร็จ',
    en: 'Password reset successful'
  },

  // Role Management
  ROLE_NOT_FOUND: {
    th: 'ไม่พบบทบาท',
    en: 'Role not found'
  },
  ROLE_ALREADY_EXISTS: {
    th: 'บทบาทมีอยู่แล้ว',
    en: 'Role already exists'
  },
  INVALID_ROLE_ID: {
    th: 'รหัสบทบาทไม่ถูกต้อง',
    en: 'Invalid role ID'
  },
  ROLE_IN_USE: {
    th: 'บทบาทนี้กำลังถูกใช้งาน ไม่สามารถลบได้',
    en: 'Role is currently in use and cannot be deleted'
  },

  // Permission Management
  PERMISSION_NOT_FOUND: {
    th: 'ไม่พบสิทธิ์การใช้งาน',
    en: 'Permission not found'
  },
  PERMISSION_ALREADY_EXISTS: {
    th: 'สิทธิ์การใช้งานมีอยู่แล้ว',
    en: 'Permission already exists'
  },
  INVALID_PERMISSION_ID: {
    th: 'รหัสสิทธิ์การใช้งานไม่ถูกต้อง',
    en: 'Invalid permission ID'
  },
  PERMISSION_IN_USE: {
    th: 'สิทธิ์การใช้งานนี้กำลังถูกใช้งาน ไม่สามารถลบได้',
    en: 'Permission is currently in use and cannot be deleted'
  },

  // Operation Status
  UPDATE_SUCCESS: {
    th: 'อัพเดทข้อมูลสำเร็จ',
    en: 'Update successful'
  },
  CREATE_SUCCESS: {
    th: 'สร้างข้อมูลสำเร็จ',
    en: 'Create successful'
  },
  DELETE_SUCCESS: {
    th: 'ลบข้อมูลสำเร็จ',
    en: 'Delete successful'
  },

  DATA_USED: {
    th: 'ข้อมูลถูกใช้งาน',
    en: 'Data is used'
  }
} as const

// Predefined error responses
export const API_ERRORS = {
  // Authentication & Authorization
  INVALID_CREDENTIALS: {
    statusCode: HTTP_STATUS.UNAUTHORIZED,
    statusMessage: 'Invalid email or password'
  },
  UNAUTHORIZED: {
    statusCode: HTTP_STATUS.UNAUTHORIZED,
    statusMessage: 'Authentication required'
  },
  FORBIDDEN: {
    statusCode: HTTP_STATUS.FORBIDDEN,
    statusMessage: 'Access denied. Insufficient permissions'
  },
  TOKEN_EXPIRED: {
    statusCode: HTTP_STATUS.UNAUTHORIZED,
    statusMessage: 'Authentication token has expired'
  },

  // Validation
  VALIDATION_ERROR: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    statusMessage: 'Validation failed'
  },
  MISSING_REQUIRED_FIELDS: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    statusMessage: 'Required fields are missing'
  },
  INVALID_INPUT: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    statusMessage: 'Invalid input provided'
  },

  // Resource Management
  NOT_FOUND: {
    statusCode: HTTP_STATUS.NOT_FOUND,
    statusMessage: 'Resource not found'
  },
  ALREADY_EXISTS: {
    statusCode: HTTP_STATUS.CONFLICT,
    statusMessage: 'Resource already exists'
  },
  DATA_USED: {
    statusCode: HTTP_STATUS.CONFLICT,
    statusMessage: 'Resource is used'
  },

  // Server Errors
  INTERNAL_ERROR: {
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    statusMessage: 'Internal server error'
  },
  DATABASE_ERROR: {
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    statusMessage: 'Database operation failed'
  },

  // User Management
  USER_NOT_FOUND: {
    statusCode: HTTP_STATUS.NOT_FOUND,
    statusMessage: 'User not found'
  },
  USER_ALREADY_EXISTS: {
    statusCode: HTTP_STATUS.CONFLICT,
    statusMessage: 'User already exists'
  },
  INVALID_USER_ID: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    statusMessage: 'Invalid user ID'
  },

  // Role Management
  ROLE_NOT_FOUND: {
    statusCode: HTTP_STATUS.NOT_FOUND,
    statusMessage: 'Role not found'
  },
  ROLE_ALREADY_EXISTS: {
    statusCode: HTTP_STATUS.CONFLICT,
    statusMessage: 'Role already exists'
  },
  INVALID_ROLE_ID: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    statusMessage: 'Invalid role ID'
  },
  ROLE_IN_USE: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    statusMessage: 'Role is currently in use and cannot be deleted'
  },

  // Permission Management
  PERMISSION_NOT_FOUND: {
    statusCode: HTTP_STATUS.NOT_FOUND,
    statusMessage: 'Permission not found'
  },
  PERMISSION_ALREADY_EXISTS: {
    statusCode: HTTP_STATUS.CONFLICT,
    statusMessage: 'Permission already exists'
  },
  INVALID_PERMISSION_ID: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    statusMessage: 'Invalid permission ID'
  },
  PERMISSION_IN_USE: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    statusMessage: 'Permission is currently in use and cannot be deleted'
  },

  // Account Status
  ACCOUNT_DEACTIVATED: {
    statusCode: HTTP_STATUS.UNAUTHORIZED,
    statusMessage: 'Account has been deactivated'
  }
} as const

/**
 * Create a standardized API error
 */
export function createAPIError(error: APIError) {
  console.log('Creating API error:', error);

  return createError({
    statusCode: error.statusCode,
    statusMessage: error.statusMessage,
    data: error.data
  })
}

/**
 * Create error from predefined error types
 */
export function createPredefinedError(errorType: keyof typeof API_ERRORS, additionalData?: any) {
  const error = API_ERRORS[errorType]
  return createAPIError({
    ...error,
    data: {
      messages: getMultiLangMessage(errorType),
      ...(additionalData || {})
    },
  })
}

/**
 * Create success response with multi-language message
 */
export function createSuccessResponseWithMessages<T>(
  data?: T,
  messageKey: keyof typeof API_ERROR_MESSAGES = 'SUCCESS'
): APIResponse<T> {
  if (messageKey && API_ERROR_MESSAGES[messageKey]) {
    return createSuccessResponse(data, API_ERROR_MESSAGES[messageKey])
  }

  return createSuccessResponse(data)
}

/**
 * Create multi-language message from key
 */
export function getMultiLangMessage(messageKey: keyof typeof API_ERROR_MESSAGES): MultiLangMessage {
  return API_ERROR_MESSAGES[messageKey] || { en: 'Unknown message', th: 'ข้อความไม่ทราบ' }
}

/**
 * Create validation error with field details
 */
export function createValidationError(fields: Record<string, string[]> | string) {
  const message = typeof fields === 'string' ? fields : 'Validation failed'
  const data = typeof fields === 'object' ? { errors: fields } : undefined

  return createAPIError({
    statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
    statusMessage: message,
    data
  })
}

/**
 * Create authentication error
 */
export function createAuthError(message?: string) {
  return createAPIError({
    statusCode: HTTP_STATUS.UNAUTHORIZED,
    statusMessage: message || 'Authentication required'
  })
}

/**
 * Create forbidden error
 */
export function createForbiddenError(message?: string) {
  return createAPIError({
    statusCode: HTTP_STATUS.FORBIDDEN,
    statusMessage: message || 'Access denied'
  })
}

/**
 * Create not found error
 */
export function createNotFoundError(resource?: string) {
  const message = resource ? `${resource} not found` : 'Resource not found'
  return createAPIError({
    statusCode: HTTP_STATUS.NOT_FOUND,
    statusMessage: message
  })
}

/**
 * Create bad request error
 */
export function createBadRequestError(message?: string) {
  return createAPIError({
    statusCode: HTTP_STATUS.BAD_REQUEST,
    statusMessage: message || 'Bad request'
  })
}

/**
 * Multi-language message interface
 */
export interface MultiLangMessage {
  th?: string
  en?: string
}

/**
 * Success response helper
 */
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  messages?: MultiLangMessage
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

/**
 * Create success response
 */
export function createSuccessResponse<T>(
  data?: T,
  message?: string | MultiLangMessage
): APIResponse<T> {
  if (typeof message === 'string') {
    return {
      success: true,
      ...(data || {}),
      message
    }
  } else if (message) {
    return {
      success: true,
      ...(data || {}),
      messages: message
    }
  }

  return {
    success: true,
    ...(data || {}),
  }
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number
    limit: number
    total: number
  },
  message?: string | MultiLangMessage
): APIResponse<T[]> {
  const totalPages = Math.ceil(pagination.total / pagination.limit)

  const response: APIResponse<T[]> = {
    success: true,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1
    }
  }

  if (typeof message === 'string') {
    response.message = message
  } else if (message) {
    response.messages = message
  }

  return response
}