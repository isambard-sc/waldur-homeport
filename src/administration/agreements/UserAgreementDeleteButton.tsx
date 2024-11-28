import { Trash } from '@phosphor-icons/react';
import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';

import { remove } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';

export const UserAgreementDeleteButton: FC<{ userAgreement; refetch }> = ({
  userAgreement,
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
      await remove(userAgreement.url);
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
    <RowActionButton
      title={translate('Delete')}
      action={action}
      iconNode={<Trash />}
      size="sm"
      pending={removing}
    />
  );
};
