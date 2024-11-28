import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

export const OrderTablePlaceholderActions = () => (
  <Link
    state="public.marketplace-landing"
    className="btn btn-success btn-md w-175px mw-350px"
  >
    {translate('Go to marketplace')}
  </Link>
);
