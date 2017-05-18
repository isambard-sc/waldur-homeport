import customerCreateDialog from './customer-create-dialog';
import customerManage from './customer-manage';
import customerWorkspace from './customer-workspace';
import { CustomerWorkspaceController } from './customer-workspace';
import { customerPopover } from './customer-popover';
import customerAlerts from './customer-alerts';
import customerIssues from './customer-issues';
import customerEvents from './customer-events';
import {customerUsersDetailsList} from './customer-users-details-list';
import customerTeam from './customer-team';
import routes from './routes';
import PriceEstimatesService from './price-estimates-service';
import customerPolicies from './customer-policies';

export default module => {
  module.directive('customerCreateDialog', customerCreateDialog);
  module.component('customerManage', customerManage);
  module.controller('CustomerWorkspaceController', CustomerWorkspaceController);
  module.directive('customerWorkspace', customerWorkspace);
  module.component('customerPopover', customerPopover);
  module.component('customerAlerts', customerAlerts);
  module.component('customerIssues', customerIssues);
  module.component('customerEvents', customerEvents);
  module.component('customerUsersDetailsList', customerUsersDetailsList);
  module.component('customerTeam', customerTeam);
  module.component('customerPolicies', customerPolicies);
  module.service('priceEstimatesService', PriceEstimatesService);
  module.config(routes);
};
