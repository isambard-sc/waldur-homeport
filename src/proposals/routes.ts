import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { fetchCustomer } from '@waldur/customer/workspace/CustomerWorkspace';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { ANONYMOUS_LAYOUT_ROUTE_CONFIG } from '@waldur/marketplace/constants';

export const states: StateDeclaration[] = [
  {
    name: 'call-management',
    url: '/call-management/:uuid/',
    parent: 'layout',
    component: lazyComponent(() =>
      import('@waldur/organization/OrganizationUIView').then((module) => ({
        default: module.OrganizationUIView,
      })),
    ),
    abstract: true,
    data: {
      auth: true,
      title: () => translate('Call management'),
    },
    resolve: [
      {
        token: 'fetchCustomer',
        resolveFn: fetchCustomer,
        deps: ['$transition$'],
      },
    ],
  },
  {
    name: 'call-management.dashboard',
    url: 'dashboard/',
    component: lazyComponent(() =>
      import('./call-management/CallManagementDashboard').then((module) => ({
        default: module.CallManagementDashboard,
      })),
    ),
    data: {
      breadcrumb: () => translate('Dashboard'),
      priority: 100,
      feature: MarketplaceFeatures.show_call_management_functionality,
    },
  },
  {
    name: 'call-management.call-list',
    url: 'calls/?{state}',
    component: lazyComponent(() =>
      import('./call-management/CallManagementPage').then((module) => ({
        default: module.CallManagementPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Calls'),
    },
  },
  {
    name: 'call-management.proposal-list',
    url: 'proposals/?{state}',
    component: lazyComponent(() =>
      import('./proposal/CustomerProposalsList').then((module) => ({
        default: module.CustomerProposalsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Proposals'),
    },
  },
  {
    name: 'call-management.review-list',
    url: 'reviews/?{state}',
    component: lazyComponent(() =>
      import('./review/CustomerReviewsList').then((module) => ({
        default: module.CustomerReviewsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Reviews'),
    },
  },
  {
    name: 'call-management.proposal-details',
    url: 'proposals/:proposal_uuid/',
    component: lazyComponent(() =>
      import('./proposal/ProposalDetailsContainer').then((module) => ({
        default: module.ProposalDetailsContainer,
      })),
    ),
  },
  {
    name: 'protected-call',
    url: '/call/:call_uuid/',
    abstract: true,
    component: UIView,
    parent: 'layout',
  },
  {
    name: 'protected-call.main',
    url: 'edit/?tab',
    component: lazyComponent(() =>
      import('./update/CallUpdateContainer').then((module) => ({
        default: module.CallUpdateContainer,
      })),
    ),
  },

  {
    name: 'protected-call-round',
    url: '',
    abstract: true,
    parent: 'protected-call',
    component: lazyComponent(() =>
      import('./round/RoundUIView').then((module) => ({
        default: module.RoundUIView,
      })),
    ),
  },
  {
    name: 'protected-call-round.details',
    url: 'round/:round_uuid/?tab',
    component: lazyComponent(() =>
      import('./round/RoundPage').then((module) => ({
        default: module.RoundPage,
      })),
    ),
  },
  {
    name: 'proposal-review',
    url: 'review/:review_uuid/',
    component: lazyComponent(() =>
      import('./proposal/create-review/ProposalReviewCreatePage').then(
        (module) => ({ default: module.ProposalReviewCreatePage }),
      ),
    ),
    parent: 'call-management',
  },

  {
    name: 'proposal-review-view',
    url: 'review/:review_uuid/view/',
    component: lazyComponent(() =>
      import('./proposal/create-review/ProposalReviewCreatePage').then(
        (module) => ({ default: module.ProposalReviewCreatePage }),
      ),
    ),
    parent: 'reviews',
  },

  // Public calls
  {
    name: 'calls-for-proposals',
    url: '/calls-for-proposals/',
    abstract: true,
    parent: 'public',
    component: UIView,
    data: {
      title: () => translate('Calls for proposals'),
    },
  },
  {
    name: 'proposals',
    url: '/proposals/',
    abstract: true,
    parent: 'layout',
    component: UIView,
    data: {
      title: () => translate('Proposals'),
    },
  },
  {
    name: 'reviews',
    url: '/reviews/',
    abstract: true,
    parent: 'layout',
    component: UIView,
    data: {
      title: () => translate('Reviews'),
    },
  },

  {
    name: 'calls-for-proposals-dashboard',
    url: '',
    parent: 'calls-for-proposals',
    component: lazyComponent(() =>
      import('./CallsForProposals').then((module) => ({
        default: module.CallsForProposals,
      })),
    ),
    data: {
      breadcrumb: () => translate('Dashboard'),
      priority: 100,
    },
  },
  {
    name: 'calls-for-proposals-all-calls',
    url: 'all-calls/?:offering_uuid/',
    parent: 'calls-for-proposals',
    component: lazyComponent(() =>
      import('./PublicCallsPage').then((module) => ({
        default: module.PublicCallsPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('All calls'),
    },
  },
  {
    name: 'proposals-all-proposals',
    url: '',
    parent: 'proposals',
    component: lazyComponent(() =>
      import('./proposal/UserProposalsList').then((module) => ({
        default: module.UserProposalsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('All proposals'),
      priority: 100,
    },
  },
  {
    name: 'proposals-call-proposals',
    url: 'call/:call',
    parent: 'proposals',
    component: lazyComponent(() =>
      import('./proposal/UserProposalsList').then((module) => ({
        default: module.UserProposalsList,
      })),
    ),
  },
  {
    name: 'reviews-all-reviews',
    url: '',
    parent: 'reviews',
    component: lazyComponent(() =>
      import('./review/UserReviewsList').then((module) => ({
        default: module.UserReviewsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('All reviews'),
      priority: 100,
    },
  },
  {
    name: 'calls-for-proposals-all-available-offerings',
    url: 'all-available-offerings/',
    parent: 'calls-for-proposals',
    component: lazyComponent(() =>
      import('./CallsAvailableOfferingsPage').then((module) => ({
        default: module.CallsAvailableOfferingsPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Available offerings'),
    },
  },
  {
    name: 'public-calls',
    url: '/calls/',
    abstract: true,
    component: UIView,
    parent: 'public',
  },
  {
    name: 'public-calls.list-public',
    url: '',
    component: lazyComponent(() =>
      import('./PublicCallsPage').then((module) => ({
        default: module.PublicCallsPage,
      })),
    ),
    data: {
      ...ANONYMOUS_LAYOUT_ROUTE_CONFIG,
    },
  },
  {
    name: 'public-call',
    url: ':call_uuid/',
    abstract: true,
    component: lazyComponent(() =>
      import('./details/PublicCallDetailsContainer').then((module) => ({
        default: module.PublicCallDetailsContainer,
      })),
    ),
    parent: 'public-calls',
  },
  {
    name: 'public-call.details',
    url: '?tab',
    component: lazyComponent(() =>
      import('./details/PublicCallDetails').then((module) => ({
        default: module.PublicCallDetails,
      })),
    ),
    data: {
      ...ANONYMOUS_LAYOUT_ROUTE_CONFIG,
    },
  },
  {
    name: 'proposals.manage-proposal',
    url: ':proposal_uuid/',
    component: lazyComponent(() =>
      import('./proposal/create/ProposalManagePage').then((module) => ({
        default: module.ProposalManagePage,
      })),
    ),
    data: {},
  },
];
