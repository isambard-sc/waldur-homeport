import { FC } from 'react';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';

import { Invoice } from '../types';

import { InvoiceItemsTable } from './InvoiceItemsTable';

interface BillingRecordDetailsProps {
  invoice: Invoice;
  refreshInvoiceItems(): void;
}

export const BillingRecordDetails: FC<BillingRecordDetailsProps> = ({
  invoice,
  refreshInvoiceItems,
}) => {
  return (
    <InvoiceItemsTable
      invoice={invoice}
      refreshInvoiceItems={refreshInvoiceItems}
      showPrice={true}
      showVat={false}
      footer={
        <table className="table bg-gray-50 border-top border-bottom align-middle">
          <tbody>
            <tr className="fs-6 fw-bold">
              <td className="text-end text-dark">
                <span>{translate('Total')}</span>{' '}
                <small>{translate('(VAT is not included)')}</small>:
              </td>
              <td
                width="12%"
                className="text-end text-dark text-nowrap min-w-150px"
              >
                {defaultCurrency(invoice.price)}
              </td>
            </tr>
          </tbody>
        </table>
      }
    />
  );
};
