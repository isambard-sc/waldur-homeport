import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { translate } from '@waldur/i18n';
import { hasSupport } from '@waldur/issues/hooks';
import { WorkspaceType } from '@waldur/workspace/types';

import { loadProject } from './resolve';

export const states: StateDeclaration[] = [
  {
    name: 'project',
    url: '/projects/:uuid/',
    abstract: true,
    parent: 'layout',
    component: lazyComponent(() =>
      import('./ProjectContainer').then((module) => ({
        default: module.ProjectContainer,
      })),
    ),
    data: {
      auth: true,
      workspace: WorkspaceType.PROJECT,
      title: () => translate('Project'),
      skipInitWorkspace: true,
    },
    resolve: [
      {
        token: 'project',
        deps: ['$transition$'],
        resolveFn: loadProject,
      },
    ],
  },

  {
    name: 'project-team',
    abstract: true,
    parent: 'project',
    component: UIView,
    url: '',
    data: {
      breadcrumb: () => translate('Team'),
      skipInitWorkspace: true,
      priority: 120,
    },
  },

  {
    name: 'project.dashboard',
    url: '',
    component: lazyComponent(() =>
      import('./ProjectDashboard').then((module) => ({
        default: module.ProjectDashboard,
      })),
    ),
    data: {
      breadcrumb: () => translate('Project dashboard'),
      priority: 100,
    },
  },

  {
    name: 'project-manage-container',
    url: '',
    abstract: true,
    parent: 'project',
    component: lazyComponent(() =>
      import('./ProjectManageContainer').then((module) => ({
        default: module.ProjectManageContainer,
      })),
    ),
  },
  {
    name: 'project-manage',
    url: 'manage/?tab',
    parent: 'project-manage-container',
    component: lazyComponent(() =>
      import('./ProjectManage').then((module) => ({
        default: module.ProjectManage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Settings'),
      skipBreadcrumb: true,
    },
  },

  {
    name: 'project.resources',
    url: 'resources/',
    component: lazyComponent(() =>
      import('./ProjectResourcesPage').then((module) => ({
        default: module.ProjectResourcesPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Resources'),
      priority: 110,
    },
  },

  {
    name: 'project.issues',
    url: 'issues/',
    component: lazyComponent(() =>
      import('./ProjectIssuesList').then((module) => ({
        default: module.ProjectIssuesList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Issues'),
      permissions: [hasSupport],
      priority: 140,
    },
  },
  {
    name: 'project.issue-details',
    url: 'issue/:issue_uuid/',
    component: lazyComponent(() =>
      import('../issues/IssueDetails').then((module) => ({
        default: module.IssueDetails,
      })),
    ),
    data: {
      permissions: [hasSupport],
    },
  },

  {
    name: 'project.events',
    url: 'events/',
    component: lazyComponent(() =>
      import('./ProjectEventsList').then((module) => ({
        default: module.ProjectEventsView,
      })),
    ),
    data: {
      breadcrumb: () => translate('Audit logs'),
      priority: 130,
    },
  },
  {
    name: 'project-users',
    url: 'users/',
    component: lazyComponent(() =>
      import('./team/ProjectUsersList').then((module) => ({
        default: module.ProjectUsersList,
      })),
    ),
    parent: 'project-team',
    data: {
      breadcrumb: () => translate('Users'),
      skipInitWorkspace: true,
    },
  },
  {
    name: 'project-invitations',
    url: 'invitations/',
    component: lazyComponent(() =>
      import('./team/InvitationsList').then((module) => ({
        default: module.InvitationsList,
      })),
    ),
    parent: 'project-team',
    data: {
      breadcrumb: () => translate('Invitations'),
      skipInitWorkspace: true,
    },
  },
  {
    name: 'project-permissions-log',
    url: 'permissions-log/',
    component: lazyComponent(() =>
      import('./team/ProjectPermissionsLogList').then((module) => ({
        default: module.ProjectPermissionsLogList,
      })),
    ),
    parent: 'project-team',
    data: {
      breadcrumb: () => translate('Permissions log'),
      skipInitWorkspace: true,
    },
  },
];
