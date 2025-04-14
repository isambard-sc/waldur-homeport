import { Field, reduxForm } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
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
      <TableFilterItem
        title={translate('Offering')}
        name="offering"
        badgeValue={(value) => value?.name}
      >
        <OfferingAutocomplete reactSelectProps={REACT_SELECT_TABLE_FILTER} />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Conceal compensation items')}
        name="conceal_compensation_items"
        badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
        ellipsis={false}
      >
        <Field
          name="conceal_compensation_items"
          component={(fieldProps) => (
            <AwesomeCheckbox
              label={translate('Conceal compensation items')}
              value={fieldProps.input.value}
              onChange={(value) => fieldProps.input.onChange(value)}
            />
          )}
        />
      </TableFilterItem>
    </>
  );
});
