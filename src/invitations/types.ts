import { RoleType } from '@waldur/permissions/types';
export { Invitation } from 'waldur-js-client';

export interface GenericInvitationContext {
  scope?: { url: string; uuid: string };
  roleTypes?: RoleType[];
  roles?: string[];
}
