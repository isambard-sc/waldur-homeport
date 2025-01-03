import { useSref } from '@uirouter/react';
import classNames from 'classnames';
import React, { FunctionComponent } from 'react';

interface LinkProps {
  label?: React.ReactNode;
  children?: React.ReactNode;
  state: string;
  params?: object;
  className?: string;
  target?: string;
  onClick?: (e?) => void;
}

export const Link: FunctionComponent<LinkProps> = ({
  state,
  params,
  children,
  label,
  onClick,
  target,
  className,
  ...rest
}) => {
  const sref = useSref(state, params);
  return (
    <a
      {...sref}
      target={target}
      onClick={(e) => {
        sref.onClick?.(e);
        onClick?.(e);
        e.preventDefault();
      }}
      className={classNames(
        className,
        typeof (label || children) === 'string' &&
          !(className || '').includes('btn') &&
          'text-anchor',
      )}
      onKeyPress={(e) => e.key === 'Enter' && onClick(e)}
      role={onClick ? 'button' : undefined}
      {...rest}
    >
      {label || children}
    </a>
  );
};
