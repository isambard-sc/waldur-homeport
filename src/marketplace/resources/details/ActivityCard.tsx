import { useCurrentStateAndParams } from '@uirouter/react';

import { Link } from '@waldur/core/Link';
import { EventTypesButton } from '@waldur/events/EventTypesButton';
import { translate } from '@waldur/i18n';
import { ResourceEvents } from '@waldur/resource/tabs/ResourceEvents';

export const ActivityCard = ({ resource }) => {
  const { state } = useCurrentStateAndParams();
  return (
    <ResourceEvents
      title={translate('Audit logs')}
      id="activity"
      initialPageSize={5}
      marketplaceResource={resource}
      actions={
        <>
          <Link
            state={state.name}
            params={{ tab: 'events' }}
            label={translate('See all')}
            className="btn btn-light"
          />
          <EventTypesButton />
        </>
      }
    />
  );
};
