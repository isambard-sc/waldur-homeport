import { Star, StarHalf } from '@phosphor-icons/react';
import { FC } from 'react';
import ReactStars from 'react-rating-stars-component';

import {
  RATING_STAR_ACTIVE_COLOR,
  RATING_STAR_INACTIVE_COLOR,
} from '@waldur/core/constants';

interface RateStarsProps {
  value: number;
  size?: number;
  className?: string;
}

export const RateStars: FC<RateStarsProps> = ({
  value,
  size = 20,
  className,
}) => (
  <ReactStars
    count={5}
    size={size}
    edit={false}
    isHalf={true}
    emptyIcon={<Star weight="fill" />}
    filledIcon={<Star weight="fill" />}
    halfIcon={<StarHalf weight="fill" />}
    color={RATING_STAR_INACTIVE_COLOR}
    activeColor={RATING_STAR_ACTIVE_COLOR}
    value={value}
    classNames={className}
  />
);
