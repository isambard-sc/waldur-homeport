import { BookOpenText } from '@phosphor-icons/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';
import { ActionButton } from '@waldur/table/ActionButton';

const CustomerCreditHistoryLogDialog = lazyComponent(() =>
  import('./CustomerCreditHistoryLogDialog').then((module) => ({
    default: module.CustomerCreditHistoryLogDialog,
  })),
);

export const CustomerCreditHistoryLogButton = () => {
  const { openDialog } = useModal();
  return (
    <ActionButton
      title={translate('History log')}
      action={() =>
        openDialog(CustomerCreditHistoryLogDialog, {
          size: 'xl',
        })
      }
      iconNode={<BookOpenText />}
    />
  );
};
