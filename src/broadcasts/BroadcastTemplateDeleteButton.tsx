import { Trash } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { deleteBroadcastTemplate } from '@waldur/broadcasts/api';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

export const BroadcastTemplateDeleteButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete the template {template_name}?',
          {
            template_name: <strong>{row.name}</strong>,
          },
          formatJsxTemplate,
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    await deleteBroadcastTemplate(row.uuid);
    await refetch();
  };
  return (
    <ActionItem
      title={translate('Remove')}
      action={openDialog}
      iconNode={<Trash />}
      size="sm"
      iconColor="danger"
      className="text-danger"
    />
  );
};
