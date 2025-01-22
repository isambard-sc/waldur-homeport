import { UIView } from '@uirouter/react';

import { ENV } from '@waldur/configs/default';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { isFeatureVisible } from '@waldur/features/connect';
import { CustomerFeatures, MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { getActivePaymentProfile } from '@waldur/invoices/details/utils';
import { hasSupport } from '@waldur/issues/hooks';
import { PermissionEnum } from '@waldur/permissions/enums';
import { isOwnerOrStaff, isStaff } from '@waldur/workspace/selectors';

import { userHasCustomerPermission } from './utils';
import { fetchCustomer } from './workspace/fetchCustomer';

export const states: StateDeclaration[] = [
  {
    name: 'organization',
    url: '/organizations/:uuid/',
    abstract: true,
    data: {
      auth: true,
      title: () => translate('Organization'),
    },
    parent: 'layout',
    component: lazyComponent(() =>
      import('@waldur/organization/OrganizationUIView').then((module) => ({
        default: module.OrganizationUIView,
      })),
    ),
    resolve: [
      {
        token: 'fetchCustomer',
        resolveFn: fetchCustomer,
        deps: ['$transition$'],
      },
    ],
  },

  {
    name: 'organization-resources',
    parent: 'organization',
    url: 'marketplace-resources/',
    component: lazyComponent(() =>
      import('../marketplace/resources/list/OrganizationResourcesAllList').then(
        (module) => ({ default: module.OrganizationResourcesAllList }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Resources'),
      priority: 110,
      permissions: [userHasCustomerPermission(PermissionEnum.LIST_RESOURCES)],
    },
  },
  {
    name: 'organization-orders',
    parent: 'organization',
    url: 'marketplace-orders/',
    component: lazyComponent(() =>
      import('./orders/CustomerOrdersList').then((module) => ({
        default: module.CustomerOrdersList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Orders'),
      priority: 120,
      permissions: [
        userHasCustomerPermission(PermissionEnum.LIST_ORDERS),
        () => !isFeatureVisible(MarketplaceFeatures.catalogue_only),
      ],
    },
  },
  {
    name: 'organization-team',
    abstract: true,
    parent: 'organization',
    component: UIView,
    url: '',
    data: {
      breadcrumb: () => translate('Team'),
      priority: 130,
      permissions: [userHasCustomerPermission(PermissionEnum.LIST_INVITATIONS)],
    },
  },

  {
    name: 'organization.dashboard',
    url: 'dashboard/',
    component: lazyComponent(() =>
      import('./dashboard/CustomerDashboard').then((module) => ({
        default: module.CustomerDashboard,
      })),
    ),
    data: {
      breadcrumb: () => translate('Organization dashboard'),
      priority: 100,
    },
  },
  {
    name: 'organization.events',
    url: 'events/',
    component: lazyComponent(() =>
      import('./workspace/CustomerEventsList').then((module) => ({
        default: module.CustomerEventsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Audit logs'),
      priority: 180,
    },
  },

  {
    name: 'organization.issues',
    url: 'issues/',
    component: lazyComponent(() =>
      import('./workspace/CustomerIssuesList').then((module) => ({
        default: module.CustomerIssuesList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Issues'),
      skipBreadcrumb: true,
      permissions: [hasSupport],
    },
  },

  {
    name: 'organization.projects',
    url: 'projects/',
    component: lazyComponent(() =>
      import('@waldur/project/ProjectsList').then((module) => ({
        default: module.ProjectsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Projects'),
      skipBreadcrumb: true,
    },
  },

  {
    name: 'organization-users',
    url: 'users/',
    component: lazyComponent(() =>
      import('./team/CustomerUsersTab').then((module) => ({
        default: module.CustomerUsersTab,
      })),
    ),
    parent: 'organization-team',
    data: {
      breadcrumb: () => translate('Users'),
      permissions: [isOwnerOrStaff],
    },
  },

  {
    name: 'organization-invitations',
    url: 'invitations/',
    component: lazyComponent(() =>
      import('../invitations/InvitationsList').then((module) => ({
        default: module.InvitationsList,
      })),
    ),
    parent: 'organization-team',
    data: {
      breadcrumb: () => translate('Invitations'),
    },
  },

  {
    name: 'organization-group-invitations',
    url: 'group-invitations/',
    component: lazyComponent(() =>
      import('../invitations/GroupInvitationsList').then((module) => ({
        default: module.GroupInvitationsList,
      })),
    ),
    parent: 'organization-team',
    data: {
      breadcrumb: () => translate('Group invitations'),
      permissions: [() => !ENV.plugins.WALDUR_CORE.INVITATION_USE_WEBHOOKS],
    },
  },

  {
    name: 'organization-permissions-log',
    url: 'permissions-log/',
    component: lazyComponent(() =>
      import('./team/CustomerPermissionsLogList').then((module) => ({
        default: module.CustomerPermissionsLogList,
      })),
    ),
    parent: 'organization-team',
    data: {
      breadcrumb: () => translate('Permission log'),
    },
  },

  {
    name: 'organization-permissions-reviews',
    url: 'permissions-reviews/',
    component: lazyComponent(() =>
      import('./team/CustomerPermissionsReviewList').then((module) => ({
        default: module.CustomerPermissionsReviewList,
      })),
    ),
    parent: 'organization-team',
    data: {
      breadcrumb: () => translate('Reviews'),
      feature: CustomerFeatures.show_permission_reviews,
    },
  },

  {
    name: 'organization-manage-container',
    url: '',
    abstract: true,
    parent: 'organization',
    component: lazyComponent(() =>
      import('./details/CustomerManageContainer').then((module) => ({
        default: module.CustomerManageContainer,
      })),
    ),
  },
  {
    name: 'organization-manage',
    url: 'manage/?tab',
    component: lazyComponent(() =>
      import('./details/CustomerManage').then((module) => ({
        default: module.CustomerManage,
      })),
    ),
    parent: 'organization-manage-container',
    data: {
      breadcrumb: () => translate('Settings'),
      skipBreadcrumb: true,
    },
  },

  {
    name: 'organization-billing',
    abstract: true,
    parent: 'organization',
    component: UIView,
    url: '',
    data: {
      breadcrumb: () => translate('Accounting'),
      priority: 140,
      permissions: [isOwnerOrStaff],
    },
  },

  {
    name: 'organization-payment-profiles',
    url: 'payment-profiles/',
    parent: 'organization-billing',
    component: lazyComponent(() =>
      import('./payment-profiles/PaymentProfilesPanel').then((module) => ({
        default: module.PaymentProfilesPanel,
      })),
    ),
    data: {
      breadcrumb: () => translate('Payment profiles'),
      permissions: [
        (state) => {
          if (isFeatureVisible(CustomerFeatures.payments_for_staff_only)) {
            return isStaff(state);
          }
          return true;
        },
      ],
    },
  },

  {
    name: 'organization-payment-list',
    url: 'payments/',
    parent: 'organization-billing',
    component: lazyComponent(() =>
      import('./details/CustomerPayments').then((module) => ({
        default: module.CustomerPayments,
      })),
    ),
    data: {
      breadcrumb: () => translate('Payments list'),
      permissions: [
        (state) => {
          if (isFeatureVisible(CustomerFeatures.payments_for_staff_only)) {
            if (!isStaff(state)) {
              return false;
            }
          }
          if (!state.workspace.customer) {
            return true;
          }
          const activePaymentProfile = getActivePaymentProfile(
            state.workspace.customer.payment_profiles,
          );
          return !!activePaymentProfile;
        },
      ],
    },
  },

  {
    name: 'organization-cost-policies',
    url: 'cost-policies/',
    parent: 'organization-billing',
    component: lazyComponent(() =>
      import('./cost-policies/CostPoliciesList').then((module) => ({
        default: module.CostPoliciesList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Cost policies'),
      permissions: [isOwnerOrStaff],
      priority: 135,
    },
  },

  {
    name: 'project-credit-management',
    url: 'credit-management/',
    parent: 'organization-billing',
    component: lazyComponent(() =>
      import('./credits/ProjectCreditsList').then((module) => ({
        default: module.ProjectCreditsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Credit management'),
      permissions: [
        isOwnerOrStaff,
        (state) =>
          !state.workspace.customer || Boolean(state.workspace.customer.credit),
      ],
      priority: 137,
    },
  },

  {
    name: 'organization.checklists',
    url: 'checklists/',
    component: lazyComponent(() =>
      import('../marketplace-checklist/CustomerChecklistOverview').then(
        (module) => ({ default: module.CustomerChecklistOverview }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Checklists'),
      feature: MarketplaceFeatures.show_experimental_ui_components,
      priority: 130,
    },
  },
];
