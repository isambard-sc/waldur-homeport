import { PencilSimple } from '@phosphor-icons/react';
import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { Variant } from 'react-bootstrap/types';

import { translate } from '@waldur/i18n';

interface RowEditButtonProps {
  onClick;
  title?: string;
  variant?: Variant;
  className?: string;
}

export const RowEditButton: FC<RowEditButtonProps> = ({
  title = translate('Edit'),
  variant,
  onClick,
  className,
}) => (
  <Button variant={variant} onClick={onClick} size="sm" className={className}>
    <span className="svg-icon svg-icon-2">
      <PencilSimple />
    </span>{' '}
    {title}
  </Button>
);
