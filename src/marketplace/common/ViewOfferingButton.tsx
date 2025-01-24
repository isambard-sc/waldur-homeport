import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

import { Offering } from '../types';

export const ViewOfferingButton = ({
  offering,
  disabled,
}: {
  offering: Offering;
  disabled?: boolean;
}) =>
  disabled ? (
    <button className="btn text-gray-700 btn-active-light" disabled>
      {translate('View offering')}
    </button>
  ) : (
    <Link
      state="public-offering.marketplace-public-offering"
      params={{
        uuid: offering.uuid,
      }}
      className="btn text-gray-700 btn-active-light"
    >
      {translate('View offering')}
    </Link>
  );
