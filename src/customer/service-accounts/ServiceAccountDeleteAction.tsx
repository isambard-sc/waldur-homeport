import { Trash } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import {
  marketplaceCustomerServiceAccountsDestroy,
  marketplaceProjectServiceAccountsDestroy,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const ServiceAccountDeleteAction = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      if ('project' in row) {
        await marketplaceProjectServiceAccountsDestroy({
          path: { uuid: row.uuid },
        });
      } else {
        await marketplaceCustomerServiceAccountsDestroy({
          path: { uuid: row.uuid },
        });
      }
      dispatch(showSuccess(translate('Service account has been deleted.')));
      refetch();
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to delete service account.')),
      );
    }
  };
  return (
    <ActionItem
      action={callback}
      title={translate('Delete')}
      iconNode={<Trash weight="bold" />}
      className="text-danger"
      iconColor="danger"
    />
  );
};
