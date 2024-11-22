import { Pen } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n/translate';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { getUser } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

export const ProjectEditAction = ({ project }: { project: Project }) => {
  const router = useRouter();
  const user = useSelector(getUser);

  if (
    !hasPermission(user, {
      permission: PermissionEnum.UPDATE_PROJECT,
      projectId: project.uuid,
    }) &&
    !hasPermission(user, {
      permission: PermissionEnum.UPDATE_PROJECT,
      customerId: project.customer_uuid,
    })
  ) {
    return null;
  }
  return (
    <ActionItem
      title={translate('Edit')}
      action={() =>
        router.stateService.go('project-manage', { uuid: project.uuid })
      }
      iconNode={<Pen />}
    />
  );
};
