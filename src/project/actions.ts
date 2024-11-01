import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';
import { createFormAction } from '@waldur/redux-form-saga';
import { Project } from '@waldur/workspace/types';

const ProjectRemoveDialog = lazyComponent(
  () => import('./ProjectRemoveDialog'),
  'ProjectRemoveDialog',
);

export const createProject = createFormAction('waldur/project/CREATE');
export const updateProject = createFormAction('waldur/project/UPDATE');
export const moveProject = createFormAction('waldur/project/MOVE');

export const DELETE_PROJECT = 'waldur/project/DELETE';

export const deleteProject = (project: Project) => ({
  type: DELETE_PROJECT,
  payload: { project },
});

export const showProjectRemoveDialog = (
  action: () => void,
  projectName: string,
) =>
  openModalDialog(ProjectRemoveDialog, {
    resolve: { action, projectName },
  });
