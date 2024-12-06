import { Trash } from '@phosphor-icons/react';
import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';

import { remove } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const UserAgreementDeleteButton: FC<{ row; refetch }> = ({
  row,
  refetch,
}) => {
  const [removing, setRemoving] = useState(false);
  const dispatch = useDispatch();

  const action = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Delete user agreement'),
        translate('Are you sure you would like to delete the user agreement?'),
        true,
      );
    } catch {
      return;
    }
    try {
      setRemoving(true);
      await remove(row.url);
      await refetch();
      dispatch(showSuccess(translate('User agreement has been deleted.')));
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to delete the user agreement.')),
      );
    }
    setRemoving(false);
  };

  return (
    <ActionItem
      title={translate('Delete')}
      action={action}
      iconNode={<Trash />}
      size="sm"
      disabled={removing}
      className="text-danger"
      iconColor="danger"
    />
  );
};
