import { get, post } from '@waldur/core/api';

import { Invitation } from './types';

interface CreateGroupInvitationPayload {
  scope: string;
  role: string;
}

class InvitationServiceClass {
  createInvitation(payload) {
    return post('/user-invitations/', payload);
  }

  createGroupInvitation(payload: CreateGroupInvitationPayload) {
    return post('/user-group-invitations/', payload);
  }

  check(invitation_uuid) {
    return this.executeAction(invitation_uuid, 'check');
  }

  accept(invitation_uuid) {
    return this.executeAction(invitation_uuid, 'accept');
  }

  submitRequest(uuid) {
    return post(`/user-group-invitations/${uuid}/request/`, {});
  }

  cancel(invitation_uuid) {
    return this.executeAction(invitation_uuid, 'cancel');
  }

  resend(invitation_uuid) {
    return this.executeAction(invitation_uuid, 'send');
  }

  delete(invitation_uuid) {
    return this.executeAction(invitation_uuid, 'delete');
  }

  approve(token) {
    return post(`/user-invitations/approve/`, {
      token,
    });
  }

  reject(token) {
    return post(`/user-invitations/reject/`, {
      token,
    });
  }

  details(invitation_uuid) {
    return get<Invitation>(`/user-invitations/${invitation_uuid}/details/`);
  }

  fetchUserGroupInvitationById(invitation_uuid) {
    return get<Invitation>(`/user-group-invitations/${invitation_uuid}/`);
  }

  executeAction(invitation_uuid, action, data?) {
    return post(`/user-invitations/${invitation_uuid}/${action}/`, data);
  }
}

export const InvitationService = new InvitationServiceClass();
