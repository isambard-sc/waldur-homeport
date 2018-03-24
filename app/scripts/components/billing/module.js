import invoicesService from './invoices-service';
import BillingUtils from './billing-utils';
import billingDetails from './billing-details';
import invoiceHeader from './invoice-header';
import invoiceDetails from './invoice-details';
import invoicesList from './invoices-list';
import billingCustomerDetails from './CustomerDetails';
import billingRecordDetails from './billing-record-details';
import billingRecordHeader from './billing-record-header';
import billingRecordsList from './billing-records-list';
import billingTabs from './billing-tabs';
import PriceEstimateUtilsService from './price-estimate-utils-service';
import priceEstimateButton from './price-estimate-button';
import priceEstimateDialog from './PriceEstimateDialog';
import billingRoutes from './routes';
import eventsModule from './events/module';
import { formatPhone } from './filters';

export default module => {
  module.service('invoicesService', invoicesService);
  module.service('BillingUtils', BillingUtils);
  module.service('PriceEstimateUtilsService', PriceEstimateUtilsService);
  module.component('billingDetails', billingDetails);
  module.component('invoiceHeader', invoiceHeader);
  module.component('invoiceDetails', invoiceDetails);
  module.component('invoicesList', invoicesList);
  module.component('billingCustomerDetails', billingCustomerDetails);
  module.component('billingRecordDetails', billingRecordDetails);
  module.component('billingRecordHeader', billingRecordHeader);
  module.component('billingRecordsList', billingRecordsList);
  module.component('billingTabs', billingTabs);
  module.component('priceEstimateButton', priceEstimateButton);
  module.component('priceEstimateDialog', priceEstimateDialog);
  module.config(billingRoutes);
  eventsModule(module);
  module.filter('formatPhone', () => formatPhone);
};
