import { Pen } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';

import { translate } from '@waldur/i18n/translate';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { Project } from '@waldur/workspace/types';

export const ProjectEditAction = ({ project }: { project: Project }) => {
  const router = useRouter();
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
