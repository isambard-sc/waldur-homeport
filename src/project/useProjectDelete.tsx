import { useRouter } from '@uirouter/react';
import { useDispatch, useSelector } from 'react-redux';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import {
  refreshCurrentCustomer,
  setCurrentProject,
} from '@waldur/workspace/actions';
import { getCustomer, getProject, getUser } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

import { deleteProject } from './api';

export const useProjectDelete = ({
  project,
  refetch,
}: {
  project: Project;
  refetch?: () => void;
}) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const user = useSelector(getUser);
  const currentCustomer = useSelector(getCustomer);
  const currentProject = useSelector(getProject);

  const isCurrentProject = project.uuid === currentProject.uuid;
  const canDelete =
    hasPermission(user, {
      permission: PermissionEnum.DELETE_PROJECT,
      customerId: currentCustomer.uuid,
    }) ||
    hasPermission(user, {
      permission: PermissionEnum.DELETE_PROJECT,
      projectId: project.uuid,
    });

  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Project removal'),
        translate(
          'Are you sure you would like to delete project {projectName}?',
          {
            projectName: <strong>{project.name}</strong>,
          },
          formatJsxTemplate,
        ),
        true,
      );
    } catch {
      return;
    }
    try {
      await deleteProject(project.uuid);
      if (refetch) {
        await refetch();
      }
      dispatch(refreshCurrentCustomer());
      if (isCurrentProject) {
        router.stateService.go('organization.projects', {
          uuid: project.customer_uuid,
        });
        dispatch(setCurrentProject(undefined));
      }
      dispatch(
        showSuccess(
          translate(
            'Project {project} from {organization} was successfully removed',
            {
              project: project.name,
              organization: project.customer_name,
            },
          ),
        ),
      );
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          translate('An error occurred on project removal.'),
        ),
      );
    }
  };
  return { canDelete, callback };
};
