import { FunctionComponent } from 'react';

import { AttributesList } from '@waldur/marketplace/offerings/details/AttributesList';
import { PublicOfferingAttributesSection } from '@waldur/marketplace/offerings/details/PublicOfferingAttributesSection';
import {
  shouldRenderAttributesList,
  shouldRenderAttributesSection,
} from '@waldur/marketplace/offerings/details/utils';
import { Category, Offering } from '@waldur/marketplace/types';
import './PublicOfferingAttributes.scss';

interface PublicOfferingAttributesProps {
  offering: Offering;
  category: Category;
  googleCalendarLink: string;
}

export const PublicOfferingAttributes: FunctionComponent<PublicOfferingAttributesProps> = ({
  offering,
  category,
  googleCalendarLink,
}) =>
  shouldRenderAttributesSection(offering, googleCalendarLink) ||
  shouldRenderAttributesList(category.sections, offering.attributes) ? (
    <div className="publicOfferingAttributes bordered">
      <PublicOfferingAttributesSection
        offering={offering}
        googleCalendarLink={googleCalendarLink}
      />
      {shouldRenderAttributesList(category.sections, offering.attributes) && (
        <AttributesList
          attributes={offering.attributes}
          sections={category.sections}
        />
      )}
    </div>
  ) : null;
