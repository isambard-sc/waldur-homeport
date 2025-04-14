import { Field } from 'redux-form';
import { rolesList } from 'waldur-js-client';

import { parseSelectData } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';
import {
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const roleAutocomplete = async (query: string, prevOptions, { page }) => {
  const response = await rolesList({
    query: {
      name: query,
      page: page,
      page_size: ENV.pageSize,
      field: ['uuid', 'name', 'description'],
    },
  });
  return returnReactSelectAsyncPaginateObject(
    parseSelectData(response),
    prevOptions,
    page,
  );
};

export const InvitationRoleFilter = () => (
  <TableFilterItem
    title={translate('Role')}
    name="role"
    badgeValue={(value) => value?.description || value?.name}
  >
    <Field
      name="role"
      component={(fieldProps) => (
        <AsyncPaginate
          placeholder={translate('Select role...')}
          loadOptions={roleAutocomplete}
          getOptionValue={(option) => option.uuid}
          getOptionLabel={(option) => option.description || option.name}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          isClearable={true}
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);
