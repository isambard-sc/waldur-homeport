import { FC } from 'react';
import { components } from 'react-select';

import { organizationGroupAutocomplete } from '@waldur/customer/list/api';
import { RIGHT_ARROW_HTML } from '@waldur/customer/list/constants';
import { translate } from '@waldur/i18n';

export const OrganizationGroupFieldOption: FC<any> = (props) => (
  <components.Option {...props}>
    {props.data.parent_name ? (
      <>
        {props.data.parent_name} {RIGHT_ARROW_HTML}{' '}
      </>
    ) : null}
    {props.data.name}
  </components.Option>
);

export const OrganizationGroupFieldSingleValue: FC<any> = (props) => {
  const parent_name: string = props.data.name.split(' ')[0];
  const name: string = props.data.name.split(' ')[2];
  return (
    <components.SingleValue {...props}>
      {parent_name === 'undefined' ? name : props.data.name}
    </components.SingleValue>
  );
};

export const commonAsyncPaginateProps = {
  placeholder: translate('Select organization group...'),
  loadOptions: organizationGroupAutocomplete,
  defaultOptions: true,
  getOptionValue: (option) => option.url,
  getOptionLabel: (option) => option.name,
  noOptionsMessage: () => translate('No organization groups'),
  isClearable: true,
};
