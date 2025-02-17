import React from 'react';
import { reduxForm } from 'redux-form';

import { REACT_MULTI_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const PureProjectsListFilter = () => (
  <TableFilterItem
    title={translate('Organization')}
    name="organization"
    getValueLabel={(option) => option.name}
  >
    <OrganizationAutocomplete
      reactSelectProps={{ ...REACT_MULTI_SELECT_TABLE_FILTER }}
    />
  </TableFilterItem>
);

export const ProjectsListFilter = reduxForm({
  form: 'affiliationProjectsListFilter',
  destroyOnUnmount: false,
})(PureProjectsListFilter) as React.ComponentType;
