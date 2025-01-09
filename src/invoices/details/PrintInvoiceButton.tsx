import { Printer } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';

export const PrintInvoiceButton: FunctionComponent = () => (
  <Button variant="secondary" onClick={() => window.print()}>
    <span className="svg-icon svg-icon-2">
      <Printer weight="bold" />
    </span>{' '}
    {ENV.accountingMode === 'accounting'
      ? translate('Print record')
      : translate('Print invoice')}
  </Button>
);
