import classNames from 'classnames';
import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';

import './OfferingButton.scss';

interface OfferingButtonProps {
  icon: string;
  title: string;
  onClick?(): void;
  isActive?: boolean;
  flavor?: 'primary' | 'secondary' | 'ternary';
  disabled?: boolean;
  isAddingItem?: boolean;
  className?: string;
}

export const OfferingButton: FunctionComponent<OfferingButtonProps> = (
  props,
) => {
  const { flavor = 'ternary' } = props;
  if (flavor === 'primary') {
    return (
      <Button
        size="sm"
        variant="primary"
        disabled={props.disabled}
        onClick={props.onClick}
        className={props.className}
      >
        {props.isAddingItem && <i className="fa fa-spinner fa-spin me-1" />}
        <i className={props.icon} /> {props.title}
      </Button>
    );
  } else if (flavor === 'secondary') {
    return (
      <Tip
        label={props.title}
        id="offering-button"
        className={classNames('btn btn-sm btn-secondary', {
          disabled: props.disabled,
        })}
        onClick={props.onClick}
      >
        <i className={props.icon} />
      </Tip>
    );
  }
  return (
    <Tip
      label={props.title}
      id="offering-button"
      className={classNames('offering-button', {
        'offering-button-active': props.isActive,
      })}
      onClick={props.onClick}
    >
      <i className={props.icon} />
    </Tip>
  );
};
