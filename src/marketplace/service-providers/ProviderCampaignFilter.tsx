import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { ProviderAutocomplete } from '@waldur/marketplace/orders/ProviderAutocomplete';
import { ProviderCampaignStateFilter } from '@waldur/marketplace/service-providers/ProviderCampaignStateFilter';
import { ProviderCampaignTypeFilter } from '@waldur/marketplace/service-providers/ProviderCampaignTypeFilter';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const PureProviderCampaignFilter: FunctionComponent = () => {
  return (
    <>
      <TableFilterItem title={translate('Service provider')} name="provider">
        <ProviderAutocomplete />
      </TableFilterItem>
      <TableFilterItem title={translate('State')} name="state">
        <ProviderCampaignStateFilter reactSelectProps={{ isMulti: true }} />
      </TableFilterItem>
      <TableFilterItem title={translate('Discount type')} name="discount_type">
        <ProviderCampaignTypeFilter reactSelectProps={{ isMulti: true }} />
      </TableFilterItem>
    </>
  );
};

const enhance = reduxForm({
  form: 'ProviderCampaignFilter',
  destroyOnUnmount: false,
});

export const ProviderCampaignFilter = enhance(PureProviderCampaignFilter);
