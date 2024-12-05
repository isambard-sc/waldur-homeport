import { Wrench } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { Category } from '@waldur/marketplace/types';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

const CategoryManageColumnsDialog = lazyComponent(() =>
  import('./CategoryManageColumnsDialog').then((module) => ({
    default: module.CategoryManageColumnsDialog,
  })),
);

export const CategoryManageColumns = ({
  row,
  refetch,
}: {
  row: Category;
  refetch;
}) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(() => {
    dispatch(
      openModalDialog(CategoryManageColumnsDialog, {
        resolve: { category: row, refetch },
        size: 'xl',
      }),
    );
  }, [dispatch, refetch]);

  return (
    <ActionItem
      title={translate('Configure columns')}
      action={openFormDialog}
      iconNode={<Wrench />}
    />
  );
};
