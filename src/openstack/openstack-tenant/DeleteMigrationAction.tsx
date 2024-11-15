import { Trash } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { RowActionButton } from '@waldur/table/ActionButton';

import { deleteMigration } from '../api';

export const DeleteMigrationAction = ({ resource, refetch }) => {
  const dispatch = useDispatch();
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate('Are you sure you want to delete the replication?'),
        true,
      );
    } catch {
      return;
    }
    await deleteMigration(resource.uuid);
    await refetch();
  };
  return (
    <RowActionButton
      title={translate('Remove')}
      action={openDialog}
      variant="outline-danger"
      iconNode={<Trash />}
      size="sm"
    />
  );
};
