import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { translate } from '@waldur/i18n';

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
    },
  },
];
