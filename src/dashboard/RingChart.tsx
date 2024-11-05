import { FC, useMemo } from 'react';

import { EChart } from '@waldur/core/EChart';
import { useTheme } from '@waldur/store/hooks';

import { getRingChartOptions } from './chart';
import { RingChartOption } from './types';

interface RingChartProps {
  option: RingChartOption;
  height?: string;
  width?: string;
  className?: string;
}

export const RingChart: FC<RingChartProps> = ({
  option,
  height = '150px',
  width = '150px',
  className,
}) => {
  const theme = useTheme();
  const options = useMemo(
    () => getRingChartOptions(option, theme),
    [option, theme],
  );
  return (
    <EChart
      options={options}
      height={height}
      width={width}
      className={className}
    />
  );
};
