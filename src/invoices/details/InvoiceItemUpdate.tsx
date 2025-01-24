import { PencilSimple } from '@phosphor-icons/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

const InvoiceItemUpdateDialog = lazyComponent(() =>
  import('./InvoiceItemUpdateDialog').then((module) => ({
    default: module.InvoiceItemUpdateDialog,
  })),
);

export const InvoiceItemUpdate = ({ item, refreshInvoiceItems }) => (
  <DialogActionItem
    title={translate('Edit item')}
    iconNode={<PencilSimple weight="bold" />}
    modalComponent={InvoiceItemUpdateDialog}
    resource={item}
    extraResolve={{ refreshInvoiceItems }}
  />
);
