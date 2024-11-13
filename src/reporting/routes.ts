import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { SupportFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { isStaffOrSupport } from '@waldur/workspace/selectors';

export const states: StateDeclaration[] = [
  {
    name: 'reporting',
    url: '/reporting/',
    abstract: true,
    parent: 'layout',
    component: UIView,
    data: {
      title: () => translate('Reporting'),
      permissions: [isStaffOrSupport],
    },
  },
  {
    name: 'reporting-dashboard',
    url: '',
    parent: 'reporting',
    component: lazyComponent(() =>
      import('./dashboard/ReportingDashboard').then((module) => ({
        default: module.ReportingDashboard,
      })),
    ),
    data: {
      breadcrumb: () => translate('Dashboard'),
      priority: 100,
    },
  },
  {
    name: 'reporting.organizations',
    url: 'organizations/',
    component: lazyComponent(() =>
      import('@waldur/customer/list/CustomerListContainer').then((module) => ({
        default: module.CustomerListContainer,
      })),
    ),
    data: {
      breadcrumb: () => translate('Monthly revenue'),
    },
  },
  {
    name: 'reporting.pricelist',
    url: 'pricelist/',
    component: lazyComponent(() =>
      import('@waldur/marketplace/offerings/PriceList').then((module) => ({
        default: module.PriceList,
      })),
    ),
    data: {
      feature: SupportFeatures.pricelist,
      breadcrumb: () => translate('Pricelist'),
    },
  },

  {
    name: 'invoicesGrowth',
    url: 'growth/',
    component: lazyComponent(() =>
      import('./invoices/GrowthContainer').then((module) => ({
        default: module.GrowthContainer,
      })),
    ),
    parent: 'reporting',
    data: {
      breadcrumb: () => translate('Growth'),
    },
  },

  {
    name: 'reporting.quotas',
    url: 'quotas/',
    component: lazyComponent(() =>
      import('./quotas/CustomerQuotasList').then((module) => ({
        default: module.CustomerQuotasList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Organization quotas'),
    },
  },
  {
    name: 'reporting.vm-type-overview',
    url: 'vm-type-overview/',
    component: lazyComponent(() =>
      import('./openstack/VmTypeOverviewContainer').then((module) => ({
        default: module.VmTypeOverviewContainer,
      })),
    ),
    data: {
      feature: SupportFeatures.vm_type_overview,
      breadcrumb: () => translate('VM type overview'),
    },
  },
  {
    name: 'marketplace-support-plan-usages',
    url: 'plan-usages/',
    component: lazyComponent(() =>
      import('./plan-usage/PlanUsageList').then((module) => ({
        default: module.PlanUsageList,
      })),
    ),
    parent: 'reporting',
    data: {
      breadcrumb: () => translate('Capacity'),
    },
  },
  {
    name: 'marketplace-support-usage-reports',
    url: 'usage/',
    component: lazyComponent(() =>
      import('./resource-usage/ResourceUsageList').then((module) => ({
        default: module.ResourceUsageList,
      })),
    ),
    parent: 'reporting',
    data: {
      breadcrumb: () => translate('Usage reports'),
    },
  },
];
