import { reduxForm } from 'redux-form';

import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { ProviderAutocomplete } from '@waldur/marketplace/orders/ProviderAutocomplete';
import { ProjectFilter } from '@waldur/marketplace/resources/list/ProjectFilter';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { INVOICE_ITEMS_FILTER_FORM } from '../constants';

export const InvoiceItemsFilter = reduxForm<any, { customerUuid? }>({
  form: INVOICE_ITEMS_FILTER_FORM,
  touchOnChange: true,
  destroyOnUnmount: false,
})((props) => {
  return (
    <>
      <TableFilterItem
        title={translate('Service provider')}
        name="provider"
        getValueLabel={(option) => option.customer_name}
      >
        <ProviderAutocomplete reactSelectProps={REACT_SELECT_TABLE_FILTER} />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Project')}
        name="project"
        badgeValue={(value) => value?.name}
      >
        <ProjectFilter
          reactSelectProps={REACT_SELECT_TABLE_FILTER}
          customer_uuid={props.customerUuid}
        />
      </TableFilterItem>
    </>
  );
});
