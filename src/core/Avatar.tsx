import classNames from 'classnames';
import { FC } from 'react';

interface AvatarProps {
  name: string;
  size?: number;
  className?: string;
  labelClassName?: string;
}
const Avatar: FC<AvatarProps> = ({
  size = 35,
  name,
  className,
  labelClassName,
}) => {
  const acronym = name
    ? name
        ?.split(' ')
        .map((item) => item.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : name;

  return (
    <div
      className={classNames(
        className,
        'd-flex align-items-center justify-content-center',
      )}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <div className={classNames('symbol-label', labelClassName)}>
        {acronym}
      </div>
    </div>
  );
};

export default Avatar;
