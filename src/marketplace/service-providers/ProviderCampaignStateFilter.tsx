import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { REACT_SELECT_TABLE_FILTER, Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

export const getCampaignStateOptions = () => [
  { value: 'draft', label: translate('Draft') },
  { value: 'active', label: translate('Active') },
  { value: 'terminated', label: translate('Terminated') },
];

export const ProviderCampaignStateFilter: FunctionComponent<{}> = () => (
  <Field
    name="state"
    component={(fieldProps) => (
      <Select
        placeholder={translate('Select state...')}
        options={getCampaignStateOptions()}
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        isClearable={true}
        isMulti={true}
        {...REACT_SELECT_TABLE_FILTER}
      />
    )}
  />
);
