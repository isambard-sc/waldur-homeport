import { FunctionComponent } from 'react';
import { Field, reduxForm } from 'redux-form';

import {
  REACT_MULTI_SELECT_TABLE_FILTER,
  Select,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { getProposalStateOptions } from '@waldur/proposals/utils';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { PROPOSALS_FILTER_FORM_ID } from './constants';

const PureProposalsListFilter: FunctionComponent = () => (
  <TableFilterItem
    name="state"
    title={translate('State')}
    instantApply={false}
  >
    <Field
      name="state"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Select state...')}
          options={getProposalStateOptions()}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          isClearable={true}
          {...REACT_MULTI_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);

const enhance = reduxForm({
  form: PROPOSALS_FILTER_FORM_ID,
  destroyOnUnmount: false,
});

export const ProposalsListFilter = enhance(PureProposalsListFilter);
