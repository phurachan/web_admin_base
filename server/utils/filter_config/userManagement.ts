import { commonFieldHandlers, type FilterConfig } from '../queryParser'

/**
 * Create filter config for User model
 */
export const createUserFilterConfig = (): FilterConfig => ({
  isActive: commonFieldHandlers.boolean('isActive'),
  role: commonFieldHandlers.stringOrArray('role'),
  roles: commonFieldHandlers.objectIdOrArray('roles'),
  department: commonFieldHandlers.string('department'),
  position: commonFieldHandlers.string('position'),
  emailVerified: commonFieldHandlers.boolean('emailVerified')
})

/**
 * Create filter config for Role model
 */
export const createRoleFilterConfig = (): FilterConfig => ({
  isActive: commonFieldHandlers.boolean('isActive'),
  name: commonFieldHandlers.string('name'),
  module: commonFieldHandlers.stringOrArray('module')
})

/**
 * Create filter config for Permission model
 */
export const createPermissionFilterConfig = (): FilterConfig => ({
  isActive: commonFieldHandlers.boolean('isActive'),
  module: commonFieldHandlers.stringOrArray('module'),
  action: commonFieldHandlers.stringOrArray('action'),
  resource: commonFieldHandlers.string('resource'),
  type: commonFieldHandlers.stringOrArray('type')
})