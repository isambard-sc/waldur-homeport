import { ArrowsOutCardinal } from '@phosphor-icons/react';
import { useSelector, useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { isStaff as isStaffSelector } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

const MoveProjectDialog = lazyComponent(() =>
  import('./MoveProjectDialog').then((module) => ({
    default: module.MoveProjectDialog,
  })),
);

export const MoveProjectAction = ({
  project,
  refetch,
}: {
  project: Project;
  refetch;
}) => {
  const dispatch = useDispatch();
  const isStaff = useSelector(isStaffSelector);

  const callback = () => {
    dispatch(
      openModalDialog(MoveProjectDialog, {
        resolve: { project, refetch },
      }),
    );
  };

  return (
    <ActionItem
      title={translate('Move project')}
      action={callback}
      disabled={!isStaff}
      iconNode={<ArrowsOutCardinal />}
    />
  );
};
