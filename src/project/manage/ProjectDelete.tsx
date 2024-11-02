import { Trash } from '@phosphor-icons/react';
import { FC } from 'react';
import { Button } from 'react-bootstrap';

import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
import { Project } from '@waldur/workspace/types';

import { useProjectDelete } from '../useProjectDelete';

interface ProjectDeleteProps {
  project: Project;
}

export const ProjectDelete: FC<ProjectDeleteProps> = ({ project }) => {
  const { canDelete, callback } = useProjectDelete({ project });

  return canDelete ? (
    <Panel
      title={translate('Delete project')}
      className="card-bordered"
      actions={
        <Button variant="light-danger" onClick={callback}>
          <span className="svg-icon svg-icon-2">
            <Trash weight="bold" />
          </span>
          {translate('Delete')}
        </Button>
      }
    >
      <ul className="text-gray-700">
        <li>
          {translate(
            'You can remove this project by pressing the button above.',
          )}
        </li>
        <li>
          {translate(
            'Only projects without existing resources can be removed.',
          )}
        </li>
        <li>{translate('Removed projects cannot be restored.')}</li>
      </ul>
    </Panel>
  ) : null;
};
