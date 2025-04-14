import { Props as SelectProps } from 'react-select';

import { Option } from '@waldur/marketplace/common/registry';

import { Select } from './themed-select';

export function SelectControl<OptionType = Option>(
  props: SelectProps<OptionType>,
) {
  return (
    <Select
      styles={{ menu: (base) => ({ ...base, zIndex: 9999 }) }}
      {...props}
    />
  );
}
