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

  // DIAGNOSTIC LOGGING - Remove after debugging
  console.log(`  checkScope(${targetScopeType}, ${targetScopeId.substring(0, 8)}..., ${targetPerm}):`, {
    userRoles: userRoles?.map(r => ({
      role_name: r.role_name,
      scope_type: r.scope_type,
      scope_uuid: r.scope_uuid.substring(0, 8) + '...',
    })),
  });

  // Check each role to see if any of them have the required permission
  if (userRoles && userRoles.length > 0) {
    for (const userRole of userRoles) {
      const role = ENV.roles.find(({ name }) => name === userRole.role_name);
      console.log(`    Checking role config for ${userRole.role_name}:`, {
        roleName: role?.name,
        hasPermission: role?.permissions.includes(targetPerm),
        rolePermissions: role?.permissions,
      });
      if (role && role.permissions.includes(targetPerm)) {
        console.log(`    ✅ Permission granted via ${userRole.role_name}`);
        return true;
      }
    }
  }

  return false;
}

export const hasPermission = (user: User, request: PermissionRequest) => {
  // DIAGNOSTIC LOGGING - Remove after debugging
  console.group('🔐 hasPermission Check');
  console.log('Request:', request);

  if (user?.is_staff) {
    console.log('✅ User is staff - granted');
    console.groupEnd();
    return true;
  }

  if (request.projectId) {
    console.log('Checking project scope...');
    if (checkScope(user, 'project', request.projectId, request.permission)) {
      console.log('✅ Granted via project scope');
      console.groupEnd();
      return true;
    }
  }
  if (request.customerId) {
    console.log('Checking customer scope...');
    if (checkScope(user, 'customer', request.customerId, request.permission)) {
      console.log('✅ Granted via customer scope');
      console.groupEnd();
      return true;
    }
  }
  if (request.callOrganizerId) {
    console.log('Checking call_organizer scope...');
    if (
      checkScope(
        user,
        'call_organizer',
        request.callOrganizerId,
        request.permission,
      )
    ) {
      console.log('✅ Granted via call_organizer scope');
      console.groupEnd();
      return true;
    }
  }
  if (request.scopeId) {
    console.log('Checking call/proposal scopes...');
    const callCheck = checkScope(user, 'call', request.scopeId, request.permission);
    const proposalCheck = checkScope(user, 'proposal', request.scopeId, request.permission);
    if (callCheck || proposalCheck) {
      console.log('✅ Granted via', callCheck ? 'call' : 'proposal', 'scope');
      console.groupEnd();
      return true;
    }
  }

  console.log('❌ Permission denied - no matching scope found');
  console.groupEnd();
  return false;
};
