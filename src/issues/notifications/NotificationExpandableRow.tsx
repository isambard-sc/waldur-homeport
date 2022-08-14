import { FunctionComponent } from 'react';

import { formatRole } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

const OptionsList = ({ label, list }) =>
  list ? (
    <p>
      <b>{label}: </b>
      {list.map((c) => c.name || c).join(', ')}
    </p>
  ) : null;

const RolesList = ({ label, list }) => (
  <OptionsList label={label} list={list?.map(formatRole)} />
);

export const NotificationExpandableRow: FunctionComponent<{ row }> = ({
  row,
}) => (
  <>
    <p>
      <b>{translate('Message')}: </b>
      {row.body}
    </p>
    <p>
      <b>{translate('Recipients')}: </b>
      {row.emails.join(', ')}
    </p>
    <OptionsList
      label={translate('Organizations')}
      list={row.query.customers}
    />
    <RolesList
      label={translate('Organization roles')}
      list={row.query.customer_roles}
    />
    <OptionsList label={translate('Projects')} list={row.query.projects} />
    <RolesList
      label={translate('Project roles')}
      list={row.query.project_roles}
    />
    <OptionsList label={translate('Offerings')} list={row.query.offerings} />
  </>
);
