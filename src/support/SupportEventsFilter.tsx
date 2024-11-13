import { reduxForm } from 'redux-form';

import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { UserAutocomplete } from '@waldur/issues/feedback/UserAutocomplete';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { ProjectFilter } from '@waldur/marketplace/resources/list/ProjectFilter';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const PureSupportEventsFilter = () => (
  <>
    <TableFilterItem
      title={translate('Organization')}
      name="organization"
      badgeValue={(value) => value?.name}
    >
      <OrganizationAutocomplete reactSelectProps={REACT_SELECT_TABLE_FILTER} />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Project')}
      name="project"
      badgeValue={(value) => value?.name}
    >
      <ProjectFilter reactSelectProps={REACT_SELECT_TABLE_FILTER} />
    </TableFilterItem>
    <TableFilterItem
      title={translate('User')}
      name="user"
      badgeValue={(value) => value?.full_name}
    >
      <UserAutocomplete />
    </TableFilterItem>
  </>
);

const enhance = reduxForm({
  form: 'SupportEventsFilter',
  destroyOnUnmount: false,
});

export const SupportEventsFilter = enhance(PureSupportEventsFilter);
