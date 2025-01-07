import { Trash } from '@phosphor-icons/react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

import { removeKey } from './api';

export const KeyRemoveButton = ({ uuid, refetch }) => {
  const dispatch = useDispatch();
  const [pending, setPending] = useState(false);

  const action = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Key removal'),
        translate('Are you sure you would like to delete the key?'),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      setPending(true);
      await removeKey(uuid);
      await refetch();
      dispatch(showSuccess(translate('SSH key has been removed.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to remove SSH key.')));
    }
    setPending(false);
  };

  return (
    <ActionButton
      title={translate('Remove')}
      action={action}
      pending={pending}
      iconNode={<Trash />}
      disabled={pending}
    />
  );
};
