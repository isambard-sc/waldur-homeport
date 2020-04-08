import { connectAngularComponent } from '@waldur/store/connect';

import certificationsService from './certifications-service';
import projectBase from './project-base';
import projectDialog from './project-dialog';
import projectPolicies from './project-policies';
import projectTeam from './project-team';
import ProjectWorkspaceController from './project-workspace';
import projectCreate from './ProjectCreateContainer';
import ProjectDashboard from './ProjectDashboardContainer';
import projectDetailsButton from './ProjectDetailsButton';
import projectEvents from './ProjectEventsList';
import projectIssues from './ProjectIssuesList';
import projectRemoveDialog from './ProjectRemoveDialog';
import projectsService from './projects-service';
import { ProjectSidebar } from './ProjectSidebar';
import projectsList from './ProjectsList';
import projectDetails from './ProjectUpdateContainer';
import projectRoutes from './routes';

import './events';

export default module => {
  module.directive('projectBase', projectBase);
  module.component('projectSidebar', connectAngularComponent(ProjectSidebar));
  module.component('projectDashboard', ProjectDashboard);
  module.component('projectDetails', projectDetails);
  module.component('projectDetailsButton', projectDetailsButton);
  module.component('projectCreate', projectCreate);
  module.controller('ProjectWorkspaceController', ProjectWorkspaceController);
  module.component('projectPolicies', projectPolicies);
  module.component('projectDialog', projectDialog);
  module.component('projectIssues', projectIssues);
  module.component('projectEvents', projectEvents);
  module.component('projectsList', projectsList);
  module.component('projectTeam', projectTeam);
  module.component('projectRemoveDialog', projectRemoveDialog);
  module.service('projectsService', projectsService);
  module.service('certificationsService', certificationsService);
  module.config(projectRoutes);
};
