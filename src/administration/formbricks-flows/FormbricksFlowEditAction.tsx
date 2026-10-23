import { FC } from 'react';
import { FormbricksFlow } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { EditAction } from '@/form/EditAction';
import { useModal } from '@/modal/actions';

const FormbricksFlowFormDialog = lazyComponent(() =>
  import('./FormbricksFlowFormDialog').then((module) => ({
    default: module.FormbricksFlowFormDialog,
  })),
);

export const FormbricksFlowEditAction: FC<{
  row: FormbricksFlow;
  refetch(): void;
}> = ({ row, refetch }) => {
  const { openDialog } = useModal();

  return (
    <EditAction
      action={() =>
        openDialog(FormbricksFlowFormDialog, {
          size: 'xl',
          resolve: { row, refetch },
        })
      }
    />
  );
};
