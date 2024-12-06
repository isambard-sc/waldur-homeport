import { FunctionComponent } from 'react';
import { Button, ButtonProps } from 'react-bootstrap';

import { useModal } from '@waldur/modal/hooks';

interface CancelButtonProps extends ButtonProps {
  disabled?: boolean;
  label: string;
  onClick?(): void;
}

export const CancelButton: FunctionComponent<CancelButtonProps> = (props) => {
  const { label, onClick, ...rest } = props;
  const { closeDialog } = useModal();
  const handleClose = () => {
    if (onClick) {
      onClick();
    } else {
      closeDialog();
    }
  };

  return (
    <Button variant="link" type="button" onClick={handleClose} {...rest}>
      {label}
    </Button>
  );
};
