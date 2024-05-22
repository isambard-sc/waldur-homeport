import { translate } from '@waldur/i18n';
import TwoDocumentsIllustration from '@waldur/images/table-placeholders/undraw_no_data_qbuo.svg';
import { ImageTablePlaceholder } from '@waldur/table/ImageTablePlaceholder';

export const OfferingRequestsListPlaceholder = () => (
  <ImageTablePlaceholder
    illustration={<TwoDocumentsIllustration />}
    title={translate('Nothing to see here')}
  />
);
