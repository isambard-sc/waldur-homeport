import { EventGroup } from '@waldur/events/types';
import { getCustomerContext } from '@waldur/events/utils';
import { gettext } from '@waldur/i18n';

import { CustomersEnum } from '../EventsEnums';

export const OrganizationEvents: EventGroup = {
  title: gettext('Organization events'),
  context: getCustomerContext,
  events: [
    {
      key: CustomersEnum.customer_creation_succeeded,
      title: gettext('Organization {customer_link} has been created.'),
    },
    {
      key: CustomersEnum.customer_deletion_succeeded,
      title: gettext('Organization {customer_name} has been deleted.'),
    },
    {
      key: CustomersEnum.customer_update_succeeded,
      title: gettext('Organization {customer_link} has been updated.'),
    },
  ],
};
