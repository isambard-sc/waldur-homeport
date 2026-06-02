import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { isFeatureVisible } from '@waldur/features/connect';
import { CustomerFeatures, ProjectFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import {
  isStaffOrSupport,
  isOwnerOrStaffOrReader,
  getUser,
  getProject,
} from '@waldur/workspace/selectors';

/**
 * Grants access to organisation owners, organisation viewers (readers),
 * staff, and support users.
 * Uses the current customer from workspace state, which is available in
 * both the 'organization' and 'project' route contexts.
 */
const isOrganisationMemberOrStaffOrSupport = (state) =>
  isOwnerOrStaffOrReader(state) || isStaffOrSupport(state);

const isCurrentProjectMember = (state) => {
  const user = getUser(state);
  const project = getProject(state);
  return !!user?.permissions?.some(
    (permission) =>
      permission.scope_type === 'project' &&
      permission.scope_uuid === project?.uuid,
  );
};

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
      breadcrumb: () => translate('Usage Report'),
      priority: 105,
      permissions: [
        (state) =>
          isOrganisationMemberOrStaffOrSupport(state) ||
          (isFeatureVisible(ProjectFeatures.show_openportal_accounting_pages) &&
            isCurrentProjectMember(state)),
      ],
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
      breadcrumb: () => translate('Usage Report'),
      priority: 105,
      permissions: [isOrganisationMemberOrStaffOrSupport],
    },
  },
  {
    name: 'organization-remote-projects',
    url: 'remote-projects/',
    parent: 'organization',
    component: lazyComponent(() =>
      import('./remote-projects/RemoteProjectsList').then((m) => ({
        default: m.RemoteProjectsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Remotes'),
      priority: 101,
      permissions: [
        isOwnerOrStaffOrReader,
        () => isFeatureVisible(CustomerFeatures.show_openportal_remote_projects),
      ],
    },
  },
  {
    name: 'support-openportal-usage',
    url: 'openportal-usage/',
    parent: 'support',
    component: lazyComponent(() =>
      import('./reports/SystemUsageTab').then((m) => ({
        default: m.SystemUsageTab,
      })),
    ),
    data: {
      breadcrumb: () => translate('Usage Report'),
      priority: 101,
      permissions: [isStaffOrSupport],
    },
  },
  {
    name: 'organization-remote-projects-audit',
    url: 'remote-projects/audit/',
    parent: 'organization',
    component: lazyComponent(() =>
      import('./remote-projects/AllRemoteProjectsAuditLog').then((m) => ({
        default: m.AllRemoteProjectsAuditLog,
      })),
    ),
    data: {
      breadcrumb: () => translate('Audit Log'),
      skipBreadcrumb: true,
      permissions: [
        isOwnerOrStaffOrReader,
        () => isFeatureVisible(CustomerFeatures.show_openportal_remote_projects),
      ],
    },
  },

  {
    name: 'organization-remote-project-detail',
    url: 'remote-projects/:remoteProjectUuid/',
    parent: 'organization',
    component: lazyComponent(() =>
      import('./remote-projects/RemoteProjectDetail').then((m) => ({
        default: m.RemoteProjectDetail,
      })),
    ),
    data: {
      breadcrumb: () => translate('Remote Project'),
      skipBreadcrumb: true,
      permissions: [
        isOwnerOrStaffOrReader,
        () => isFeatureVisible(CustomerFeatures.show_openportal_remote_projects),
      ],
    },
  },

  {
    name: 'organization-remote-project-audit',
    url: 'remote-projects/:remoteProjectUuid/audit/',
    parent: 'organization',
    component: lazyComponent(() =>
      import('./remote-projects/RemoteProjectAuditLog').then((m) => ({
        default: m.RemoteProjectAuditLog,
      })),
    ),
    data: {
      breadcrumb: () => translate('Audit Log'),
      skipBreadcrumb: true,
      permissions: [
        isOwnerOrStaffOrReader,
        () => isFeatureVisible(CustomerFeatures.show_openportal_remote_projects),
      ],
    },
  },
  {
    name: 'organization-openportal-allocation',
    url: 'openportal-allocation/',
    parent: 'organization',
    component: lazyComponent(() =>
      import('./reports/OrganisationAllocationTab').then((m) => ({
        default: m.OrganisationAllocationTab,
      })),
    ),
    data: {
      breadcrumb: () => translate('Allocation Summary'),
      priority: 106,
      permissions: [isOrganisationMemberOrStaffOrSupport],
    },
  },
];
