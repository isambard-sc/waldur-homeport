import { ArrowsInSimple, PauseCircle, XCircle } from '@phosphor-icons/react';
import { Resource } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { translate } from '@waldur/i18n';

export const ResourceFlags = ({ resource }: { resource: Resource }) => {
  return (
    <>
      {resource.restrict_member_access && (
        <Badge leftIcon={<XCircle />} variant="danger" outline pill>
          {translate('Access restricted')}
        </Badge>
      )}
      {resource.paused && (
        <Badge leftIcon={<PauseCircle />} variant="danger" outline pill>
          {translate('Paused')}
        </Badge>
      )}
      {resource.downscaled && (
        <Badge leftIcon={<ArrowsInSimple />} variant="danger" outline pill>
          {translate('Downscaled')}
        </Badge>
      )}
    </>
  );
};
