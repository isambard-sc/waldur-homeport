import { FC } from 'react';
import { Props as SelectProps } from 'react-select';
import { Field } from 'redux-form';

import {
  commonAsyncPaginateProps,
  OrganizationGroupFieldOption,
  OrganizationGroupFieldSingleValue,
} from '@waldur/administration/organizations/SelectOrganizationGroupFieldHelpers';
import { AsyncPaginate } from '@waldur/form/themed-select';

interface SelectFieldProps {
  reactSelectProps?: Partial<SelectProps>;
}

export const SelectOrganizationGroupFieldPure: FC<SelectFieldProps> = (
  props,
) => (
  <Field
    name="organization_group"
    component={(fieldProps) => (
      <AsyncPaginate
        {...commonAsyncPaginateProps}
        components={{
          OrganizationGroupFieldOption,
          OrganizationGroupFieldSingleValue,
        }}
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        {...props.reactSelectProps}
      />
    )}
  />
);
