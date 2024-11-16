import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { translate } from '@waldur/i18n';
import { isStaffOrSupport } from '@waldur/workspace/selectors';

import { hasSupport } from './hooks';

export const states: StateDeclaration[] = [
  {
    name: 'support',
    url: '/support/',
    parent: 'layout',
    component: UIView,
    abstract: true,
    data: {
      auth: true,
      title: () => translate('Support'),
      permissions: [isStaffOrSupport],
    },
  },

  {
    name: 'support-dashboard',
    url: '',
    parent: 'support',
    component: lazyComponent(() =>
      import('@waldur/support/dashboard/SupportDashboard').then((module) => ({
        default: module.SupportDashboard,
      })),
    ),
    data: {
      breadcrumb: () => translate('Dashboard'),
      priority: 100,
    },
  },

  {
    name: 'support.detail',
    url: 'issue/:issue_uuid/',
    component: lazyComponent(() =>
      import('./IssueDetails').then((module) => ({
        default: module.IssueDetails,
      })),
    ),
    data: {
      permissions: [isStaffOrSupport, hasSupport],
    },
  },

  {
    name: 'support.list',
    url: 'list/?{status}',
    component: lazyComponent(() =>
      import('@waldur/issues/SupportIssues').then((module) => ({
        default: module.SupportIssues,
      })),
    ),
    data: {
      breadcrumb: () => translate('Issues'),
      permissions: [isStaffOrSupport, hasSupport],
      priority: 103,
    },
  },

  {
    name: 'supportFeedback',
    url: '/support/feedback/?token&evaluation',
    component: lazyComponent(() =>
      import('@waldur/issues/feedback/SupportFeedback').then((module) => ({
        default: module.SupportFeedback,
      })),
    ),
    data: {
      permissions: [hasSupport],
    },
  },

  {
    name: 'support.feedback',
    url: 'feedback/',
    component: lazyComponent(() =>
      import('@waldur/issues/feedback/SupportFeedbackList').then((module) => ({
        default: module.SupportFeedbackList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Feedback'),
      permissions: [isStaffOrSupport, hasSupport],
      priority: 102,
    },
  },

  {
    name: 'support.broadcast',
    url: 'broadcast/',
    component: lazyComponent(() =>
      import('../broadcasts/BroadcastList').then((module) => ({
        default: module.BroadcastList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Broadcast'),
      priority: 100,
    },
  },

  {
    name: 'support.broadcast-templates',
    url: 'broadcast-templates/',
    component: lazyComponent(() =>
      import('../broadcasts/BroadcastTemplateList').then((module) => ({
        default: module.BroadcastTemplateList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Broadcast templates'),
      priority: 101,
    },
  },

  {
    name: 'support.audit-logs',
    url: 'audit-logs/',
    component: lazyComponent(() =>
      import('@waldur/support/SupportEventsList').then((module) => ({
        default: module.SupportEventsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Audit logs'),
      priority: 105,
    },
  },
];
