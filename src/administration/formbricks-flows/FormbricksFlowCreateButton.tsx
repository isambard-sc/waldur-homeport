import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const FormbricksFlowFormDialog = lazyComponent(() =>
  import('./FormbricksFlowFormDialog').then((module) => ({
    default: module.FormbricksFlowFormDialog,
  })),
);

export const FormbricksFlowCreateButton: FC<{ refetch(): void }> = ({
  refetch,
}) => {
  const { openDialog } = useModal();

  return (
    <BaseButton
      label={translate('Add flow')}
      variant="primary"
      iconNode={<PlusCircleIcon weight="bold" />}
      onClick={() =>
        openDialog(FormbricksFlowFormDialog, {
          size: 'xl',
          resolve: { refetch },
        })
      }
      size="lg"
    />
  );
};
