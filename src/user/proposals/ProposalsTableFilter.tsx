import { FunctionComponent } from 'react';
import { Field, reduxForm } from 'redux-form';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { CallAutocomplete } from '@waldur/proposals/CallAutocomplete';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { USER_PROPOSALS_FILTER_FORM_ID } from '../constants';

const states = [
  {
    label: translate('Draft'),
    value: 'Draft',
  },
  {
    label: translate('Submitted'),
    value: 'Submitted',
  },
  {
    label: translate('In review'),
    value: 'In review',
  },
  {
    label: translate('In revision'),
    value: 'In revision',
  },
  {
    label: translate('Accepted'),
    value: 'Accepted',
  },
  {
    label: translate('Rejected'),
    value: 'Rejected',
  },
  {
    label: translate('Cancelled'),
    value: 'Cancelled',
  },
];

const PureProposalsTableFilter: FunctionComponent<{}> = () => (
  <>
    <TableFilterItem title={translate('State')} name="state">
      <Field
        name="state"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Select state...')}
            options={states}
            value={fieldProps.input.value}
            onChange={(item) => fieldProps.input.onChange(item)}
            isMulti={true}
            isClearable={true}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Call')}
      name="call"
      badgeValue={(value) => value?.name}
    >
      <CallAutocomplete />
    </TableFilterItem>
  </>
);

const enhance = reduxForm({
  form: USER_PROPOSALS_FILTER_FORM_ID,
  destroyOnUnmount: false,
});

export const ProposalsTableFilter = enhance(PureProposalsTableFilter);
