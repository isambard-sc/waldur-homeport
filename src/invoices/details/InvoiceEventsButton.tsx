import { BookOpenText } from '@phosphor-icons/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';
import { ActionButton } from '@waldur/table/ActionButton';

const InvoiceEventsDialog = lazyComponent(() =>
  import('./InvoiceEventsDialog').then((module) => ({
    default: module.InvoiceEventsDialog,
  })),
);

export const InvoiceEventsButton = ({ invoice }) => {
  const { openDialog } = useModal();
  return (
    <ActionButton
      title={translate('History log')}
      action={() =>
        openDialog(InvoiceEventsDialog, {
          size: 'xl',
          resolve: { invoice },
        })
      }
      iconNode={<BookOpenText />}
    />
  );
};
