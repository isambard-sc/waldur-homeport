import { Trash } from '@phosphor-icons/react';
import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { removeHook } from './api';
interface HookRemoveButtonProps {
  refetch();
  url: string;
}

export const HookRemoveButton: FC<HookRemoveButtonProps> = (props) => {
  const [removing, setRemoving] = useState(false);
  const dispatch = useDispatch();

  const action = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Hook removal'),
        translate('Are you sure you would like to delete the hook?'),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      setRemoving(true);
      await removeHook(props.url);
      await props.refetch();
      dispatch(showSuccess(translate('Hook has been removed.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to remove hook.')));
    }
    setRemoving(false);
  };

  return (
    <ActionItem
      title={translate('Remove')}
      action={action}
      disabled={removing}
      iconNode={<Trash />}
      size="sm"
      className="text-danger"
      iconColor="danger"
    />
  );
};
