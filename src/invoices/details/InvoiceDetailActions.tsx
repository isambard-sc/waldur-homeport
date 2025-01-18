import { FC } from 'react';

import { Invoice } from '../types';

import { InvoiceEventsButton } from './InvoiceEventsButton';
import { InvoicePayButton } from './InvoicePayButton';
import { PrintInvoiceButton } from './PrintInvoiceButton';

interface InvoiceDetailActionsProps {
  invoice: Invoice;
}

export const InvoiceDetailActions: FC<InvoiceDetailActionsProps> = ({
  invoice,
}) => (
  <>
    <PrintInvoiceButton />
    <InvoiceEventsButton invoice={invoice} />
    <InvoicePayButton row={invoice} asButton />
  </>
);
