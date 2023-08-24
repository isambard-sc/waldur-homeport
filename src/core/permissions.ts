import { ENV } from '@waldur/configs/default';
import { User } from '@waldur/workspace/types';

import {
  CUSTOMER_OWNER_ROLE,
  CUSTOMER_SERVICE_MANAGER_ROLE,
  CUSTOMER_SUPPORT_ROLE,
  PROJECT_ADMIN_ROLE,
  PROJECT_MANAGER_ROLE,
  PROJECT_MEMBER_ROLE,
} from './constants';

export interface PermissionRequest {
  permission: string;
  projectId?: string;
  customerId?: string;
  offeringId?: string;
}

export const hasPermission = (user: User, request: PermissionRequest) => {
  if (user.is_staff) {
    return true;
  }
  let permissions = [];
  if (request.projectId) {
    const projectPermission = user.project_permissions.find(
      ({ project_uuid }) => project_uuid === request.projectId,
    );
    if (projectPermission) {
      if (projectPermission.role === PROJECT_ADMIN_ROLE) {
        permissions = ENV.permissions[RoleEnum.PROJECT_ADMIN];
      } else if (projectPermission.role === PROJECT_MANAGER_ROLE) {
        permissions = ENV.permissions[RoleEnum.PROJECT_MANAGER];
      } else if (projectPermission.role === PROJECT_MEMBER_ROLE) {
        permissions = ENV.permissions[RoleEnum.PROJECT_MEMBER];
      }
    }
  } else if (request.customerId) {
    const customerPermission = user.customer_permissions.find(
      ({ customer_uuid }) => customer_uuid === request.customerId,
    );
    if (customerPermission) {
      if (customerPermission.role === CUSTOMER_OWNER_ROLE) {
        permissions = ENV.permissions[RoleEnum.CUSTOMER_OWNER];
      } else if (customerPermission.role === CUSTOMER_SERVICE_MANAGER_ROLE) {
        permissions = ENV.permissions[RoleEnum.CUSTOMER_MANAGER];
      } else if (customerPermission.role === CUSTOMER_SUPPORT_ROLE) {
        permissions = ENV.permissions[RoleEnum.CUSTOMER_SUPPORT];
      }
    }
  }
  return permissions.includes(request.permission);
};

export const RoleEnum = {
  CUSTOMER_OWNER: 'CUSTOMER.OWNER',
  CUSTOMER_SUPPORT: 'CUSTOMER.SUPPORT',
  CUSTOMER_MANAGER: 'CUSTOMER.MANAGER',

  PROJECT_ADMIN: 'PROJECT.ADMIN',
  PROJECT_MANAGER: 'PROJECT.MANAGER',
  PROJECT_MEMBER: 'PROJECT.MEMBER',

  OFFERING_MANAGER: 'OFFERING.MANAGER',
};

export const PermissionEnum = {
  REGISTER_SERVICE_PROVIDER: 'SERVICE_PROVIDER.REGISTER',

  UPDATE_OFFERING_THUMBNAIL: 'OFFERING.UPDATE_THUMBNAIL',
  UPDATE_OFFERING: 'OFFERING.UPDATE',
  UPDATE_OFFERING_ATTRIBUTES: 'OFFERING.UPDATE_ATTRIBUTES',
  UPDATE_OFFERING_LOCATION: 'OFFERING.UPDATE_LOCATION',
  UPDATE_OFFERING_DESCRIPTION: 'OFFERING.UPDATE_DESCRIPTION',
  UPDATE_OFFERING_OVERVIEW: 'OFFERING.UPDATE_OVERVIEW',
  UPDATE_OFFERING_OPTIONS: 'OFFERING.UPDATE_OPTIONS',
  UPDATE_OFFERING_SECRET_OPTIONS: 'OFFERING.UPDATE_SECRET_OPTIONS',
  ADD_OFFERING_ENDPOINT: 'OFFERING.ADD_ENDPOINT',
  DELETE_OFFERING_ENDPOINT: 'OFFERING.DELETE_ENDPOINT',
  UPDATE_OFFERING_COMPONENTS: 'OFFERING.UPDATE_COMPONENTS',
  PAUSE_OFFERING: 'OFFERING.PAUSE',
  UNPAUSE_OFFERING: 'OFFERING.UNPAUSE',
  ARCHIVE_OFFERING: 'OFFERING.ARCHIVE',
  DRY_RUN_OFFERING_SCRIPT: 'OFFERING.DRY_RUN_SCRIPT',
  MANAGE_CAMPAIGN: 'OFFERING.MANAGE_CAMPAIGN',
  MANAGE_OFFERING_USER_GROUP: 'OFFERING.MANAGE_USER_GROUP',

  APPROVE_ORDER: 'ORDER.APPROVE',
  APPROVE_PRIVATE_ORDER: 'ORDER.APPROVE_PRIVATE',
  REJECT_ORDER: 'ORDER.REJECT',

  APPROVE_ORDER_ITEM: 'ORDER_ITEM.APPROVE',
  REJECT_ORDER_ITEM: 'ORDER_ITEM.REJECT',
  DESTROY_ORDER_ITEM: 'ORDER_ITEM.DESTROY',
  TERMINATE_ORDER_ITEM: 'ORDER_ITEM.TERMINATE',

  TERMINATE_RESOURCE: 'RESOURCE.TERMINATE',
  LIST_IMPORTABLE_RESOURCES: 'RESOURCE.LIST_IMPORTABLE',
  SET_RESOURCE_END_DATE: 'RESOURCE.SET_END_DATE',
  SET_RESOURCE_USAGE: 'RESOURCE.SET_USAGE',
  SWITCH_RESOURCE_PLAN: 'RESOURCE.SET_PLAN',
  UPDATE_RESOURCE_LIMITS: 'RESOURCE.SET_LIMITS',
  SET_RESOURCE_BACKEND_ID: 'RESOURCE.SET_BACKEND_ID',
  SUBMIT_RESOURCE_REPORT: 'RESOURCE.SUBMIT_REPORT',
  LIST_RESOURCE_USERS: 'RESOURCE.LIST_USERS',
  COMPLETE_RESOURCE_DOWNSCALING: 'RESOURCE.COMPLETE_DOWNSCALING',
  ACCEPT_BOOKING_REQUEST: 'RESOURCE.ACCEPT_BOOKING_REQUEST',
  REJECT_BOOKING_REQUEST: 'RESOURCE.REJECT_BOOKING_REQUEST',
};
