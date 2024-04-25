import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues, reduxForm } from 'redux-form';

import { getInitialValues, syncFiltersToURL } from '@waldur/core/filters';
import { translate } from '@waldur/i18n';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { CategoryFilter } from './CategoryFilter';
import { SUPPORT_RESOURCES_FILTER_FORM_ID } from './constants';
import { ProjectFilter } from './ProjectFilter';
import { getStates, ResourceStateFilter } from './ResourceStateFilter';

const organizationSelector = (state) =>
  getFormValues(SUPPORT_RESOURCES_FILTER_FORM_ID)(state)['organization'];

const PureSupportResourcesFilter: FunctionComponent = () => {
  const organizationValue = useSelector(organizationSelector);
  return (
    <>
      <TableFilterItem
        title={translate('Offering')}
        name="offering"
        badgeValue={(value) => value?.name}
      >
        <OfferingAutocomplete />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Client organization')}
        name="organization"
        badgeValue={(value) => value?.name}
      >
        <OrganizationAutocomplete />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Project')}
        name="project"
        badgeValue={(value) => value?.name}
      >
        <ProjectFilter customer_uuid={organizationValue?.uuid} />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Category')}
        name="category"
        badgeValue={(value) => value?.title}
      >
        <CategoryFilter />
      </TableFilterItem>
      <TableFilterItem title={translate('State')} name="state">
        <ResourceStateFilter reactSelectProps={{ isMulti: true }} />
      </TableFilterItem>
    </>
  );
};

export const NON_TERMINATED_STATES = getStates().filter(
  (state) => state.value !== 'Terminated',
);
const enhance = reduxForm({
  form: SUPPORT_RESOURCES_FILTER_FORM_ID,
  onChange: syncFiltersToURL,
  initialValues: getInitialValues({
    state: NON_TERMINATED_STATES,
  }),
  destroyOnUnmount: false,
});

export const SupportResourcesFilter = enhance(PureSupportResourcesFilter);
