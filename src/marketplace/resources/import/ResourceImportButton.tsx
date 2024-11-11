import { DownloadSimple } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const ResourceImportDialog = lazyComponent(
  () => import('./ResourceImportDialog'),
  'ResourceImportDialog',
);

interface ResourceImportButtonProps {
  category_uuid?: string;
}

export const ResourceImportButton: React.FC<ResourceImportButtonProps> = (
  props,
) => {
  const dispatch = useDispatch();

  const openDialog = () => {
    dispatch(
      openModalDialog(ResourceImportDialog, {
        resolve: props,
        size: 'lg',
      }),
    );
  };

  return (
    <ActionButton
      title={translate('Import')}
      action={openDialog}
      iconNode={<DownloadSimple weight="bold" />}
    />
  );
};
