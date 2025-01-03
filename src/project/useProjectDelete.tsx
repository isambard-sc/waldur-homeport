import { useRouter } from '@uirouter/react';
import { useDispatch, useSelector } from 'react-redux';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import {
  getCustomer as getCustomerApi,
  deleteProject,
} from '@waldur/project/api';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import {
  setCurrentCustomer,
  setCurrentProject,
} from '@waldur/workspace/actions';
import { getProject, getUser } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

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
  const currentProject = useSelector(getProject);

  const isCurrentProject = project.uuid === currentProject?.uuid;
  const canDelete =
    hasPermission(user, {
      permission: PermissionEnum.DELETE_PROJECT,
      customerId: project.customer_uuid,
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
      const newCustomer = await getCustomerApi(project.customer_uuid);
      dispatch(setCurrentCustomer(newCustomer));
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
