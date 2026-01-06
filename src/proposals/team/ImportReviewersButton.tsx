import { FileArrowUpIcon } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

interface ImportReviewersButtonProps {
  scope: { url: string; uuid: string };
  refetch(): void;
}

const ImportReviewersDialog = lazyComponent(() =>
  import('./ImportReviewersDialog').then((module) => ({
    default: module.ImportReviewersDialog,
  })),
);

export const ImportReviewersButton: React.FC<ImportReviewersButtonProps> = (
  props,
) => {
  const dispatch = useDispatch();

  return (
    <ActionItem
      title={translate('Import reviewers')}
      action={() => dispatch(openModalDialog(ImportReviewersDialog, props))}
      iconNode={<FileArrowUpIcon weight="bold" />}
    />
  );
};
