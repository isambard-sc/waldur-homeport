import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ServiceProvider } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n/translate';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionButton } from '@waldur/table/ActionButton';
import { getUser } from '@waldur/workspace/selectors';

const UserImportDialog = lazyComponent(() =>
  import('./UserImportDialog').then((module) => ({
    default: module.UserImportDialog,
  })),
);

interface UserImportButtonProps {
  provider?: ServiceProvider;
  refetch?;
}

export const UserImportButton: FC<UserImportButtonProps> = ({
  provider,
  refetch,
}) => {
  const user = useSelector(getUser);
  const dispatch = useDispatch();

  const canCreateOfferingUser = hasPermission(user, {
    permission: PermissionEnum.CREATE_OFFERING_USER,
    customerId: provider?.customer_uuid,
  });

  return (
    <ActionButton
      title={translate('Bulk import')}
      action={() =>
        dispatch(
          openModalDialog(UserImportDialog, {
            size: 'lg',
            formId: 'BulkImportOfferingUsers',
            resolve: { provider, refetch },
          }),
        )
      }
      iconNode={<DownloadSimpleIcon weight="bold" />}
      disabled={!canCreateOfferingUser}
      tooltip={
        !canCreateOfferingUser &&
        translate('You do not have permission to perform this action.')
      }
    />
  );
};
