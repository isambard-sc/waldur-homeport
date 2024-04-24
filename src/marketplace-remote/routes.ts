import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { translate } from '@waldur/i18n';

const OrganizationProjectUpdateRequestsList = lazyComponent(
  () => import('./OrganizationProjectUpdateRequestsList'),
  'OrganizationProjectUpdateRequestsList',
);

const ProjectUpdateRequestListContainer = lazyComponent(
  () => import('./ProjectUpdateRequestListContainer'),
  'ProjectUpdateRequestListContainer',
);

export const states: StateDeclaration[] = [
  {
    name: 'marketplace-organization-project-update-requests',
    url: 'marketplace-project-update-requests/',
    component: OrganizationProjectUpdateRequestsList,
    parent: 'organization',
    data: {
      breadcrumb: () => translate('Project updates'),
      skipBreadcrumb: true,
    },
  },
  {
    name: 'marketplace-project-update-requests',
    url: 'marketplace-project-update-requests/',
    component: ProjectUpdateRequestListContainer,
    parent: 'project',
    data: {
      breadcrumb: () => translate('Project updates'),
      skipBreadcrumb: true,
    },
  },
];
