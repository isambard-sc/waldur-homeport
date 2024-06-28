import { ENV } from '@waldur/configs/default';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { translate } from '@waldur/i18n';
import { isOwnerOrStaff } from '@waldur/workspace/selectors';

const BillingDetails = lazyComponent(
  () => import('./details/BillingDetails'),
  'BillingDetails',
);
const BillingTabs = lazyComponent(
  () => import('./list/BillingTabs'),
  'BillingTabs',
);

export const states: StateDeclaration[] = [
  {
    name: 'organization.billing',
    url: 'billing/',
    component: BillingTabs,
    data: {
      breadcrumb: () =>
        ENV.accountingMode === 'accounting'
          ? translate('Accounting')
          : translate('Billing'),
      permissions: [isOwnerOrStaff],
      priority: 135,
    },
  },

  {
    name: 'billingDetails',
    url: 'billing/:invoice_uuid/?status',
    component: BillingDetails,
    parent: 'organization',
    data: {
      breadcrumb: () =>
        ENV.accountingMode === 'accounting'
          ? translate('Accounting record')
          : translate('Invoice'),
      skipBreadcrumb: true,
    },
  },
];
