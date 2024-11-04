import { useDispatch } from 'react-redux';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { deleteOfferingRole } from '@waldur/marketplace/common/api';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';

export const DeleteRoleButton = ({ role, refetch }) => {
  const dispatch = useDispatch();
  const handler = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete role {name}?',
          {
            name: <b>{role.name}</b>,
          },
          formatJsxTemplate,
        ),
        true,
      );
    } catch {
      return;
    }
    try {
      await deleteOfferingRole(role.uuid);
      dispatch(showSuccess(translate('Role has been removed.')));
      await refetch();
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to remove role.')));
    }
  };
  return (
    <RowActionButton
      title={translate('Delete')}
      action={handler}
      variant="light-danger"
      size="sm"
    />
  );
};
