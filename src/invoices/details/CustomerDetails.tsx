import React from 'react';

import { translate } from '@waldur/i18n';
import { Customer } from '@waldur/workspace/types';

import { formatPhone } from './utils';

interface CustomerDetailsProps {
  customer: Customer;
}

export const CustomerDetails: React.FC<CustomerDetailsProps> = ({
  customer,
}) => (
  <address className="mb-0">
    <div>
      <strong>{customer.name}</strong>
    </div>

    {customer.address && <div>{customer.address}</div>}

    {customer.country && customer.postal && (
      <div>
        {customer.country}, {customer.postal}
      </div>
    )}

    {customer.phone_number && (
      <div>
        <abbr title={translate('Phone')}>P:</abbr>{' '}
        {formatPhone(customer.phone_number)}
      </div>
    )}

    {customer.bank_name && customer.bank_account && (
      <div>
        {customer.bank_name}, {customer.bank_account}
      </div>
    )}

    {customer.vat_code && (
      <div>
        <abbr>{translate('VAT')}:</abbr> {customer.vat_code}
      </div>
    )}

    {customer.email}
  </address>
);
