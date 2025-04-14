import { FunctionComponent } from 'react';
import { Field, reduxForm } from 'redux-form';

import { REACT_SELECT_TABLE_FILTER, Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { AnnouncementTypeOptions } from '../utils';

const AnnouncementStatusOptions = [
  {
    label: translate('Active'),
    value: true,
  },
  {
    label: translate('Inactive'),
    value: false,
  },
];

const PureAnnouncementFilter: FunctionComponent = () => {
  return (
    <>
      <TableFilterItem title={translate('Type')} name="type">
        <Field
          name="type"
          component={(prop) => (
            <Select
              value={prop.input.value}
              onChange={(value) => prop.input.onChange(value)}
              options={AnnouncementTypeOptions}
              isClearable={true}
              {...REACT_SELECT_TABLE_FILTER}
            />
          )}
        />
      </TableFilterItem>
      <TableFilterItem title={translate('Status')} name="is_active">
        <Field
          name="is_active"
          component={(prop) => (
            <Select
              value={prop.input.value}
              onChange={(value) => prop.input.onChange(value)}
              options={AnnouncementStatusOptions}
              isClearable={true}
              {...REACT_SELECT_TABLE_FILTER}
            />
          )}
        />
      </TableFilterItem>
    </>
  );
};

const enhance = reduxForm<{}, {}>({
  form: 'AdminAnnouncementsFilter',
});

export const AnnouncementFilter = enhance(PureAnnouncementFilter);
