import { FunctionComponent } from 'react';

import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { translate } from '@waldur/i18n';
import { GoogleCalendarLink } from '@waldur/marketplace/offerings/details/GoogleCalendarLink';
import { CopyToClipboard } from '@waldur/marketplace/offerings/service-providers/shared/CopyToClipboard';
import { ReferralDetailsButton } from '@waldur/marketplace/referral/ReferralDetailsButton';
import { Offering } from '@waldur/marketplace/types';
import './PublicOfferingAttributesSection.scss';

interface PublicOfferingAttributesSectionProps {
  offering: Offering;
}

export const PublicOfferingAttributesSection: FunctionComponent<
  PublicOfferingAttributesSectionProps
> = ({ offering }) => (
  <div className="bordered publicOfferingAttributesSection mb-2">
    {offering.datacite_doi && (
      <div>
        <b>{translate('Datacite DOI')}:</b>
        <span className="ms-2 m-r">{offering.datacite_doi}</span>
        <CopyToClipboard value={offering.datacite_doi} />
      </div>
    )}
    {offering.citation_count >= 0 && (
      <div className="publicOfferingAttributesSection__referralCount">
        <div>
          <b>{translate('Referral count')}:</b>
          <span className="ms-2">{offering.citation_count}</span>
        </div>
        {offering.citation_count > 0 && (
          <ReferralDetailsButton offering={offering} />
        )}
      </div>
    )}
    {offering.google_calendar_link &&
      offering.type === OFFERING_TYPE_BOOKING && (
        <GoogleCalendarLink link={offering.google_calendar_link} />
      )}
  </div>
);
