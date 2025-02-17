import { ENV } from '@waldur/configs/default';
import { ROLE_TYPES } from '@waldur/permissions/constants';

import { RoleEnum } from './enums';
import { RoleType } from './types';

export const getRoles = (types: RoleType[]) =>
  ENV.roles
    .filter((role) => types.includes(role.content_type) && role.is_active)
    .sort((a, b) => a.content_type.localeCompare(b.content_type));

export const getProjectRoles = () => getRoles(['project']);

export const getCustomerRoles = () => getRoles(['customer']);

const ROLE_MAP = {
  owner: RoleEnum.CUSTOMER_OWNER,
  service_manager: RoleEnum.CUSTOMER_MANAGER,
  manager: RoleEnum.PROJECT_MANAGER,
  admin: RoleEnum.PROJECT_ADMIN,
  member: RoleEnum.PROJECT_MEMBER,
  // these are used in event context
  Owner: RoleEnum.CUSTOMER_OWNER,
  Manager: RoleEnum.PROJECT_MANAGER,
  Administrator: RoleEnum.PROJECT_ADMIN,
  Member: RoleEnum.PROJECT_MEMBER,
};

export const formatRole = (name: string) => {
  const roleName = ROLE_MAP[name] || name;
  const role = ENV.roles.find((role) => role.name === roleName);
  return role?.description || role?.name;
};

export const formatRoleType = (content_type: RoleType) =>
  ROLE_TYPES.find(({ value }) => value === content_type)?.label || content_type;
