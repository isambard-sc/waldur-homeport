import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';
import { Project } from '@waldur/workspace/types';

import { DeleteAction } from './DeleteAction';
import { MoveProjectAction } from './MoveProjectAction';

const ActionsList = [DeleteAction, MoveProjectAction];

interface ProjectsListActionsProps {
  project: Project;
  refetch;
}

export const ProjectsListActions: FC<ProjectsListActionsProps> = ({
  project,
  refetch,
}) => (
  <ActionsDropdownComponent title={translate('Actions')}>
    {ActionsList.map((ActionComponent, index) => (
      <ActionComponent key={index} project={project} refetch={refetch} />
    ))}
  </ActionsDropdownComponent>
);
