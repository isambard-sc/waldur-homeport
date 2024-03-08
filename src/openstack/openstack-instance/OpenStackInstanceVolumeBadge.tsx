import { Badge } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { Tip } from '@waldur/core/Tooltip';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { usePublicResourceState } from '@waldur/marketplace/resources/list/PublicResourceLink';
import { Field } from '@waldur/resource/summary';
import { Volume } from '@waldur/resource/types';
import { getCustomer } from '@waldur/workspace/selectors';

const openstackIcon = require('@waldur/images/appstore/icon-openstack.png');

interface VolumeBadgeProps {
  volume: Volume;
  resourceName?: string;
}

const VolumeBadgeTipView = ({ volume, resourceName }: VolumeBadgeProps) => {
  const customer = useSelector(getCustomer);
  const stateAndParams = usePublicResourceState(
    { ...volume, uuid: volume.marketplace_resource_uuid },
    customer,
  );
  return (
    <div className="text-start p-2">
      <Field label={translate('Attached to')} value={resourceName} isStuck />
      <Field
        label={translate('Volume type')}
        value={volume.type_name}
        isStuck
      />
      <Field
        label={translate('Size')}
        value={formatFilesize(volume.size)}
        isStuck
      />
      <Field label={translate('Mount')} value={volume.device} isStuck hasCopy />
      {volume.marketplace_resource_uuid && (
        <Link
          state={stateAndParams.state}
          params={stateAndParams.params}
          className="btn btn-sm btn-dark mt-2"
        >
          {translate('Go to detail view')}
        </Link>
      )}
    </div>
  );
};

export const OpenStackInstanceVolumeBadge = ({
  volume,
  resourceName,
}: VolumeBadgeProps) => {
  return (
    <Tip
      label={<VolumeBadgeTipView volume={volume} resourceName={resourceName} />}
      id={`volume-${volume.uuid}`}
      placement="bottom"
      trigger="click"
      autoWidth
      rootClose
    >
      <Badge bg="light" text="dark" className="cursor-pointer me-3 mb-1">
        <img src={openstackIcon} alt="openstack" width={15} className="me-2" />
        {volume.name} ({formatFilesize(volume.size)}, {volume.type_name})
      </Badge>
    </Tip>
  );
};
