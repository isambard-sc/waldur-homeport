import { WarningCircle } from '@phosphor-icons/react';
import { FC } from 'react';

import { ENV } from '@waldur/configs/default';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

interface PriceTooltipProps {
  estimated?: boolean;
}

export const PriceTooltip: FC<PriceTooltipProps> = ({ estimated }) => {
  // VAT is not included only when accounting mode is activated
  const parts = [];
  if (ENV.accountingMode === 'accounting') {
    parts.push(translate('VAT is not included.'));
  }

  if (estimated) {
    parts.push(translate('Price is estimated.'));
  }

  const message = parts.join(' ');

  if (!message) {
    return null;
  }

  return (
    <span className="ms-1 hidden-print">
      <Tip label={message} id="price-tooltip">
        <WarningCircle weight="bold" size={15} />
      </Tip>
    </span>
  );
};
