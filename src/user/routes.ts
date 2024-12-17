import { UIView } from '@uirouter/react';

import { ENV } from '@waldur/configs/default';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { UserFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { hasSupport } from '@waldur/issues/hooks';

import { UsersService } from './UsersService';

export const states: StateDeclaration[] = [
  {
    name: 'profile',
    url: '/profile/',
    parent: 'layout',
    abstract: true,
    data: {
      auth: true,
      title: () => UsersService.getCachedUser()?.full_name,
    },
    component: lazyComponent(() =>
      import('./UserDetails').then((module) => ({
        default: module.UserDetails,
      })),
    ),
  },

  {
    name: 'profile-credentials',
    abstract: true,
    parent: 'profile',
    component: UIView,
    url: '',
    data: {
      breadcrumb: () => translate('Credentials'),
      priority: 110,
    },
  },

  {
    name: 'profile.details',
    url: '',
    component: lazyComponent(() =>
      import('./dashboard/UserDashboard').then((module) => ({
        default: module.UserDashboard,
      })),
    ),
    data: {
      breadcrumb: () => translate('User dashboard'),
      priority: 100,
    },
  },
  {
    name: 'profile.events',
    url: 'events/',
    component: lazyComponent(() =>
      import('./dashboard/UserEventsWrapper').then((module) => ({
        default: module.UserEventsWrapper,
      })),
    ),
    data: {
      breadcrumb: () => translate('Audit logs'),
    },
  },
  {
    name: 'profile.issues',
    url: 'issues/',
    component: lazyComponent(() =>
      import('./UserIssuesList').then((module) => ({
        default: module.UserIssuesList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Issues'),
      permissions: [hasSupport],
    },
  },

  {
    name: 'profile-keys',
    url: 'keys/',
    component: lazyComponent(() =>
      import('./keys/MyKeysList').then((module) => ({
        default: module.MyKeysList,
      })),
    ),
    parent: 'profile-credentials',
    data: {
      feature: UserFeatures.ssh_keys,
      breadcrumb: () => translate('SSH keys'),
    },
  },
  {
    name: 'profile.notifications',
    url: 'notifications/',
    component: lazyComponent(() =>
      import('./hooks/HooksList').then((module) => ({
        default: module.HooksList,
      })),
    ),
    data: {
      feature: UserFeatures.notifications,
      breadcrumb: () => translate('Notifications'),
      priority: 120,
    },
  },
  {
    name: 'profile-manage-container',
    url: '',
    parent: 'profile',
    component: lazyComponent(() =>
      import('./PersonalManageContainer').then((module) => ({
        default: module.PersonalManageContainer,
      })),
    ),
    abstract: true,
  },
  {
    name: 'profile-manage',
    url: 'manage/?tab',
    parent: 'profile-manage-container',
    component: lazyComponent(() =>
      import('./UserManage').then((module) => ({ default: module.UserManage })),
    ),
    data: {
      breadcrumb: () => translate('Settings'),
      skipBreadcrumb: true,
    },
  },
  {
    name: 'profile-freeipa',
    url: 'freeipa-account/',
    component: lazyComponent(() =>
      import('@waldur/freeipa/FreeIPAAccount').then((module) => ({
        default: module.FreeIpaAccount,
      })),
    ),
    parent: 'profile-credentials',
    data: {
      breadcrumb: () => translate('FreeIPA account'),
      permissions: [() => ENV.plugins.WALDUR_FREEIPA?.ENABLED],
    },
  },
  {
    name: 'profile-remote-accounts',
    url: 'remote-accounts/',
    component: lazyComponent(() =>
      import('./UserOfferingList').then((module) => ({
        default: module.UserOfferingList,
      })),
    ),
    parent: 'profile-credentials',
    data: {
      breadcrumb: () => translate('Remote accounts'),
    },
  },
  {
    name: 'profile.permission-requests',
    url: 'permission-requests/',
    component: lazyComponent(() =>
      import('./UserPermissionRequestsList').then((module) => ({
        default: module.UserPermissionRequestsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Permission requests'),
      priority: 130,
    },
  },
  {
    name: 'profile-api-key',
    url: 'api-key/',
    component: lazyComponent(() =>
      import('./api-key/UserApiKey').then((module) => ({
        default: module.UserApiKey,
      })),
    ),
    parent: 'profile-credentials',
    data: {
      breadcrumb: () => translate('API token'),
    },
  },
  {
    name: 'projects',
    url: '/projects/',
    component: lazyComponent(() =>
      import('@waldur/user/affiliations/ProjectsList').then((module) => ({
        default: module.ProjectsList,
      })),
    ),
    parent: 'layout',
  },
  {
    name: 'organizations',
    url: '/organizations/',
    component: lazyComponent(() =>
      import('@waldur/user/affiliations/OrganizationsList').then((module) => ({
        default: module.OrganizationsList,
      })),
    ),
    parent: 'layout',
  },
  {
    name: 'user-email-change',
    url: '/user_email_change/:token/',
    component: lazyComponent(() =>
      import('./support/UserEmailChangeCallback').then((module) => ({
        default: module.UserEmailChangeCallback,
      })),
    ),
  },
  {
    name: 'category-resources',
    url: '/resources/:category_uuid/',
    component: lazyComponent(() =>
      import(
        '@waldur/marketplace/resources/list/CategoryResourcesContainer'
      ).then((module) => ({ default: module.CategoryResourcesContainer })),
    ),
    parent: 'layout',
  },
  {
    name: 'all-resources',
    url: '/all-resources/?offering',
    component: lazyComponent(() =>
      import('@waldur/marketplace/resources/list/AllResourcesList').then(
        (module) => ({ default: module.AllResourcesList }),
      ),
    ),
    parent: 'layout',
  },
];
