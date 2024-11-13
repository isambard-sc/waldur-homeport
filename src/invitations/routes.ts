import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';

export const states: StateDeclaration[] = [
  {
    name: 'invitation-accept',
    url: '/invitation/:uuid/',
    component: lazyComponent(() =>
      import('./InvitationAccept').then((module) => ({
        default: module.InvitationAccept,
      })),
    ),
  },

  {
    name: 'invitation-approve',
    url: '/invitation_approve/:token/',
    component: lazyComponent(() =>
      import('./InvitationApprove').then((module) => ({
        default: module.InvitationApprove,
      })),
    ),
  },

  {
    name: 'invitation-reject',
    url: '/invitation_reject/:token/',
    component: lazyComponent(() =>
      import('./InvitationReject').then((module) => ({
        default: module.InvitationReject,
      })),
    ),
  },

  {
    name: 'user-group-invitation',
    url: '/user-group-invitation/:token/',
    component: lazyComponent(() =>
      import('./UserGroupInvitation').then((module) => ({
        default: module.UserGroupInvitation,
      })),
    ),
    data: {
      auth: true,
    },
  },
];
