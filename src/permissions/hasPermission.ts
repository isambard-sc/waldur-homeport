import { User } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';

import { PermissionRequest, RoleType } from './types';

export function checkScope(
  user: User,
  targetScopeType: RoleType,
  targetScopeId,
  targetPerm,
) {
  if (!user) {
    return false;
  }
  if (user?.is_staff) {
    return true;
  }

  // FIX: Check ALL matching roles, not just the first one
  // A user can have multiple roles for the same scope (e.g., CALL.REVIEWER and CALL.MANAGER)
  const userRoles = user.permissions?.filter(
    ({ scope_uuid, scope_type }) =>
      scope_uuid === targetScopeId && scope_type === targetScopeType,
  );

  // Check each role to see if any of them have the required permission
  if (userRoles && userRoles.length > 0) {
    for (const userRole of userRoles) {
      const role = ENV.roles.find(({ name }) => name === userRole.role_name);
      if (role && role.permissions.includes(targetPerm)) {
        return true;
      }
    }
  }

  return false;
}

export const hasPermission = (user: User, request: PermissionRequest) => {
  if (user?.is_staff) {
    return true;
  }
  if (request.projectId) {
    if (checkScope(user, 'project', request.projectId, request.permission)) {
      return true;
    }
  }
  if (request.customerId) {
    if (checkScope(user, 'customer', request.customerId, request.permission)) {
      return true;
    }
  }
  if (request.callOrganizerId) {
    if (
      checkScope(
        user,
        'call_organizer',
        request.callOrganizerId,
        request.permission,
      )
    ) {
      return true;
    }
  }
  if (request.scopeId) {
    if (
      checkScope(user, 'call', request.scopeId, request.permission) ||
      checkScope(user, 'proposal', request.scopeId, request.permission)
    ) {
      return true;
    }
  }
};
