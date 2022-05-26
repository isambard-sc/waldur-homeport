import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { Layout } from '@waldur/navigation/Layout';
import { PROJECT_WORKSPACE } from '@waldur/workspace/types';

import { loadProject } from './resolve';

const ProjectDashboardContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ProjectDashboardContainer" */ './ProjectDashboardContainer'
    ),
  'ProjectDashboardContainer',
);
const ProjectEventsView = lazyComponent(
  () =>
    import(/* webpackChunkName: "ProjectEventsList" */ './ProjectEventsList'),
  'ProjectEventsView',
);
const ProjectIssuesList = lazyComponent(
  () =>
    import(/* webpackChunkName: "ProjectIssuesList" */ './ProjectIssuesList'),
  'ProjectIssuesList',
);
const ProjectTeam = lazyComponent(
  () => import(/* webpackChunkName: "team/ProjectTeam" */ './team/ProjectTeam'),
  'ProjectTeam',
);

export const states: StateDeclaration[] = [
  {
    name: 'project',
    url: '/projects/:uuid/',
    abstract: true,
    component: Layout,
    data: {
      auth: true,
      workspace: PROJECT_WORKSPACE,
    },
    resolve: [
      {
        token: 'project',
        deps: ['$transition$'],
        resolveFn: loadProject,
      },
    ],
  },

  {
    name: 'project.details',
    url: '',
    component: ProjectDashboardContainer,
  },

  {
    name: 'project.issues',
    url: 'issues/',
    component: ProjectIssuesList,
  },

  {
    name: 'project.events',
    url: 'events/',
    component: ProjectEventsView,
  },

  {
    name: 'project.team',
    url: 'team/',
    component: ProjectTeam,
  },
];
