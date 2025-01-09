import { FC } from 'react';

import { Invoice } from '../types';

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
    <InvoicePayButton row={invoice} asButton />
  </>
);
