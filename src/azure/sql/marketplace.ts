import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { OfferingConfiguration } from '@waldur/marketplace/common/types';

const AzureSQLServerDetails = lazyComponent(
  () => import('./AzureSQLServerDetails'),
  'AzureSQLServerDetails',
);
const AzureSQLServerForm = lazyComponent(
  () => import('./AzureSQLServerForm'),
  'AzureSQLServerForm',
);

export const AzureSQLServerOffering: OfferingConfiguration = {
  type: 'Azure.SQLServer',
  get label() {
    return translate('Azure PostgreSQL database server');
  },
  orderFormComponent: AzureSQLServerForm,
  detailsComponent: AzureSQLServerDetails,
  providerType: 'Azure',
  allowToUpdateService: true,
};
