import { Trash } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

import { deleteAdminAnnouncement } from '../api';

export const AnnouncementDeleteAction = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate('Are you sure you want to delete the announcement?'),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    await deleteAdminAnnouncement(row.uuid);
    await refetch();
  };
  return (
    <ActionItem
      title={translate('Remove')}
      action={openDialog}
      iconNode={<Trash />}
      className="text-danger"
      iconColor="danger"
      size="sm"
    />
  );
};
