import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n/translate';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';
import { useUser } from '@waldur/workspace/hooks';

const OrganizationImportDialog = lazyComponent(() =>
  import('./OrganizationImportDialog').then((module) => ({
    default: module.OrganizationImportDialog,
  })),
);

export const OrganizationImportButton: FC<{ refetch }> = ({ refetch }) => {
  const user = useUser();
  const dispatch = useDispatch();

  if (!user.is_staff) return null;

  return (
    <ActionButton
      title={translate('Bulk import')}
      action={() =>
        dispatch(
          openModalDialog(OrganizationImportDialog, {
            size: 'lg',
            formId: 'BulkImportOrganizations',
            resolve: {
              refetch,
            },
          }),
        )
      }
      iconNode={<DownloadSimpleIcon weight="bold" />}
    />
  );
};
