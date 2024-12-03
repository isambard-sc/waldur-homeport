import { Link } from '@waldur/core/Link';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import openstackIcon from '@waldur/images/appstore/icon-openstack.png';

import { Resource } from '../types';

export const ParentResourceLink = ({ resource }: { resource: Resource }) =>
  resource.parent_uuid && resource.parent_name ? (
    <p>
      <i>
        <img src={openstackIcon} width={15} className="me-1" alt="openstack" />
        {translate(
          'Part of {resource}',
          {
            resource: (
              <Link
                state="marketplace-resource-details"
                params={{ resource_uuid: resource.parent_uuid }}
              >
                {resource.parent_name}
              </Link>
            ),
          },
          formatJsxTemplate,
        )}
      </i>
    </p>
  ) : (
    <p className="me-1"> </p>
  );
