import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { Variant } from 'react-bootstrap/types';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

import { FieldErrorMessage } from './FieldError';
import { FloatingButton } from './FloatingButton';

interface OwnProps {
  label?: any;
  disabled?: boolean;
  submitting: boolean;
  errors?: Record<string, any>;
  variant?: Variant;
}

export const FloatingSubmitButton: FC<OwnProps> = ({
  label,
  disabled,
  submitting,
  errors,
  variant = 'primary',
}) => {
  const errorsExist = errors && Object.keys(errors).length > 0;
  return (
    <FloatingButton>
      <Tip
        label={errorsExist ? <FieldErrorMessage error={errors} center /> : null}
        id="floating-button-errors"
        autoWidth
        className="w-100"
        tipClassName="mw-225px"
      >
        <Button
          variant={variant}
          type="submit"
          disabled={disabled || submitting || errorsExist}
          className="w-100"
        >
          {submitting && <LoadingSpinnerIcon className="me-1" />}
          {label || translate('Submit')}
        </Button>
      </Tip>
    </FloatingButton>
  );
};
