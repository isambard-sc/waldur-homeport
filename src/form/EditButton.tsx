import { PencilSimple } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FunctionComponent } from 'react';
import { ButtonProps } from 'react-bootstrap';
import { Variant } from 'react-bootstrap/esm/types';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';

interface EditButtonProps extends ButtonProps {
  disabled?: boolean;
  label?: string;
  state?: string;
  params?: any;
  iconRight?: boolean;
  variant?: Variant;
  size?: 'sm' | 'lg';
  btnIcon?: boolean;
}

export const EditButton: FunctionComponent<EditButtonProps> = (props) => {
  const {
    label = translate('Edit'),
    onClick,
    state,
    params,
    iconRight = true,
    variant = 'primary',
    size,
    btnIcon,
    className,
    ...rest
  } = props;

  return state ? (
    <Link
      state={state}
      params={params}
      className={classNames(
        `btn btn-${variant}`,
        btnIcon && 'btn-icon',
        size && `btn-${size}`,
        iconRight && 'btn-icon-right',
        className,
      )}
      {...rest}
    >
      {!btnIcon && iconRight && label}
      <span className={`svg-icon svg-icon-${size === 'sm' ? '4' : '2'}`}>
        <PencilSimple weight="bold" />
      </span>
      {!btnIcon && !iconRight && label}
    </Link>
  ) : (
    <ActionButton
      action={onClick}
      iconNode={<PencilSimple weight="bold" />}
      title={!btnIcon && label}
      size={size}
      variant={variant}
      iconRight={iconRight}
      className={className}
      {...rest}
    />
  );
};
