import { IconProps } from '@phosphor-icons/react';
import classNames from 'classnames';
import { ComponentType, FC } from 'react';
import { Variant } from 'react-bootstrap/types';

interface RadarIconProps {
  IconComponent: ComponentType<IconProps>;
  variant?: Variant;
  size?: 'sm';
  className?: string;
}

export const RadarIcon: FC<RadarIconProps> = ({
  IconComponent,
  variant = 'success',
  size,
  className,
}) => (
  <div
    className={classNames(
      'radar-icon icon-' + variant,
      size && `radar-icon-${size}`,
      className,
    )}
  >
    <div>
      <IconComponent
        size={size === 'sm' ? 15 : 20}
        weight="bold"
        className={'text-' + variant}
      />
    </div>
  </div>
);
