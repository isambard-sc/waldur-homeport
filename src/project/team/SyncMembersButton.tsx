import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { Project, projectsSyncUserRoles } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';
import { isStaff as isStaffSelector } from '@waldur/workspace/selectors';

interface SyncMembersButtonProps {
  project: Project;
  refetch: () => void;
}

export const SyncMembersButton = ({
  project,
  refetch,
}: SyncMembersButtonProps) => {
  const dispatch = useDispatch();
  const isStaff = useSelector(isStaffSelector);
  const handleSync = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Synchronise members'),
        translate(
          'This action will send an event requesting to synchronise membership information to all Waldur site agents connected with resources in this project.',
        ),
        {
          positiveButton: translate('Synchronise'),
          positiveButtonVariant: 'primary',
        },
      );
    } catch {
      return;
    }

    try {
      await projectsSyncUserRoles({
        path: { uuid: project.uuid },
      });

      dispatch(
        showSuccess(
          translate('Project members have been synchronised successfully.'),
        ),
      );

      await refetch();
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          translate('Unable to synchronise project members.'),
        ),
      );
    }
  };
  if (!isStaff) {
    return null;
  }
  return (
    <ActionButton
      title={translate('Synchronise members')}
      action={handleSync}
      iconNode={<ArrowsClockwiseIcon />}
    />
  );
};
