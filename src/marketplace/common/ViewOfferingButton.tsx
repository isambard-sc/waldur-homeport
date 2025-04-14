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
    <button className="btn text-gray-700 btn-active-light btn-sm" disabled>
      {translate('Details')}
    </button>
  ) : (
    <Link
      state="public-offering.marketplace-public-offering"
      params={{ uuid: offering.uuid }}
      className="btn btn-text-primary btn-active-secondary btn-sm"
    >
      {translate('Details')}
    </Link>
  );
