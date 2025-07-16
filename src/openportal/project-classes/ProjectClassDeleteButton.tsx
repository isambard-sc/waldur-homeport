import { TrashIcon } from '@phosphor-icons/react';
import { useAsyncFn } from 'react-use';
import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { deleteProjectClass } from '../api';

export const ProjectClassDeleteButton: FC<{ row; refetch }> = ({
  row,
  refetch,
}) => {
  const dispatch = useDispatch();

  const action = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Delete project class'),
        translate('Are you sure you would like to delete this project class?'),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      await deleteProjectClass({ uuid: row.uuid });
      await refetch();
      dispatch(showSuccess(translate('Project class has been deleted.')));
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to delete this project class.')),
      );
    }
  };

  const [{ loading }, callback] = useAsyncFn(action);

  return (
    <ActionItem
      title={translate('Delete')}
      disabled={loading}
      action={callback}
      iconNode={<TrashIcon weight="bold" />}
      size="sm"
      className="text-danger"
      iconColor="danger"
    />
  );
};
