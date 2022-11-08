import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import { CUSTOMER_USERS_LIST_FILTER_FORM_ID } from '@waldur/customer/team/constants';
import { OrganizationRoleSelectField } from '@waldur/customer/team/OrganizationRoleSelectField';
import { ProjectRoleSelectField } from '@waldur/customer/team/ProjectRoleSelectField';
import { translate } from '@waldur/i18n';
import { TableFilterFormContainer } from '@waldur/table/TableFilterFormContainer';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const PureCustomerUsersListFilter: FunctionComponent = () => (
  <TableFilterFormContainer form={CUSTOMER_USERS_LIST_FILTER_FORM_ID}>
    <TableFilterItem title={translate('Project role')} name="project_role">
      <ProjectRoleSelectField />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Organization role')}
      name="organization_role"
    >
      <OrganizationRoleSelectField />
    </TableFilterItem>
  </TableFilterFormContainer>
);

const enhance = reduxForm({
  form: CUSTOMER_USERS_LIST_FILTER_FORM_ID,
  destroyOnUnmount: false,
});

export const CustomerUsersListFilter = enhance(PureCustomerUsersListFilter);
