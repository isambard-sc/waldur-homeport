import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { translate } from '@waldur/i18n';
import { isStaffOrSupport } from '@waldur/workspace/selectors';

export const states: StateDeclaration[] = [
  {
    name: 'project.openportal-reports',
    url: 'openportal-reports/',
    component: lazyComponent(() =>
      import('./reports/OpenPortalReportsTab').then((m) => ({
        default: m.OpenPortalReportsTab,
      })),
    ),
    data: {
      breadcrumb: () => translate('OpenPortal Reports'),
      priority: 200,
      permissions: [isStaffOrSupport],
    },
  },
  {
    name: 'organization-openportal-reports',
    url: 'openportal-reports/',
    parent: 'organization',
    component: lazyComponent(() =>
      import('./reports/OrganisationReportsTab').then((m) => ({
        default: m.OrganisationReportsTab,
      })),
    ),
    data: {
      breadcrumb: () => translate('OpenPortal Reports'),
      priority: 200,
      permissions: [isStaffOrSupport],
    },
  },
];
