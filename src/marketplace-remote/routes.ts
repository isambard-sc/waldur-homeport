import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { translate } from '@waldur/i18n';

export const states: StateDeclaration[] = [
  {
    name: 'marketplace-organization-project-update-requests',
    url: 'marketplace-project-update-requests/',
    component: lazyComponent(() =>
      import('./OrganizationProjectUpdateRequestsList').then((module) => ({
        default: module.OrganizationProjectUpdateRequestsList,
      })),
    ),
    parent: 'organization',
    data: {
      breadcrumb: () => translate('Project updates'),
      skipBreadcrumb: true,
    },
  },
  {
    name: 'marketplace-project-update-requests',
    url: 'marketplace-project-update-requests/',
    component: lazyComponent(() =>
      import('./ProjectUpdateRequestsList').then((module) => ({
        default: module.ProjectUpdateRequestsList,
      })),
    ),
    parent: 'project',
    data: {
      breadcrumb: () => translate('Project updates'),
      skipBreadcrumb: true,
    },
  },
];
