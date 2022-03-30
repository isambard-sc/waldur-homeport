import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { ORGANIZATION_WORKSPACE } from '@waldur/workspace/types';

const ProjectsList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ProjectsList" */ '@waldur/project/ProjectsList'
    ),
  'ProjectsList',
);
const ProjectCreateRequestsList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ProjectCreateRequestsList" */ '@waldur/marketplace-flows/ProjectCreateRequestsList'
    ),
  'ProjectCreateRequestsList',
);
const ResourceCreateRequestsList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ResourceCreateRequestsList" */ '@waldur/marketplace-flows/ResourceCreateRequestsList'
    ),
  'ResourceCreateRequestsList',
);
const ProjectCreateContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ProjectCreateContainer" */ '../project/ProjectCreateContainer'
    ),
  'ProjectCreateContainer',
);
const PaymentProfileCreateContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "PaymentProfileCreateContainer" */ '@waldur/customer/payment-profiles/PaymentProfileCreateContainer'
    ),
  'PaymentProfileCreateContainer',
);
const CustomerDashboard = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "CustomerDashboard" */ './dashboard/CustomerDashboard'
    ),
  'CustomerDashboard',
);
const CustomerManage = lazyComponent(
  () =>
    import(/* webpackChunkName: "CustomerManage" */ './details/CustomerManage'),
  'CustomerManage',
);
const CustomerTeam = lazyComponent(
  () => import(/* webpackChunkName: "CustomerTeam" */ './team/CustomerTeam'),
  'CustomerTeam',
);
const CustomerEventsView = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "CustomerEventsList" */ './workspace/CustomerEventsList'
    ),
  'CustomerEventsView',
);
const CustomerIssuesList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "CustomerIssuesList" */ './workspace/CustomerIssuesList'
    ),
  'CustomerIssuesList',
);
const CustomerWorkspace = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "CustomerWorkspace" */ './workspace/CustomerWorkspace'
    ),
  'CustomerWorkspace',
);

export const states: StateDeclaration[] = [
  {
    name: 'organization',
    url: '/organizations/:uuid/',
    abstract: true,
    data: {
      auth: true,
      workspace: ORGANIZATION_WORKSPACE,
    },
    component: CustomerWorkspace,
  },

  {
    name: 'organization.dashboard',
    url: 'dashboard/',
    component: CustomerDashboard,
  },

  {
    name: 'organization.details',
    url: 'events/',
    component: CustomerEventsView,
  },

  {
    name: 'organization.issues',
    url: 'issues/',
    component: CustomerIssuesList,
  },

  {
    name: 'organization.projects',
    url: 'projects/',
    component: ProjectsList,
  },

  {
    name: 'organization.project-requests',
    url: 'project-requests/',
    component: ProjectCreateRequestsList,
  },

  {
    name: 'organization.resource-requests',
    url: 'project-requests/',
    component: ResourceCreateRequestsList,
  },

  {
    name: 'organization.team',
    url: 'team/',
    component: CustomerTeam,
  },

  {
    name: 'organization.manage',
    url: 'manage/',
    component: CustomerManage,
  },

  {
    name: 'payment-profile-create',
    url: 'payment-profile-create/',
    parent: 'organization',
    component: PaymentProfileCreateContainer,
  },

  {
    name: 'organization.createProject',
    url: 'createProject/',
    component: ProjectCreateContainer,
  },
];
