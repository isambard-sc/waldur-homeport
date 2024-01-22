import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n/translate';

export const ProposalCallEditButton = ({ row }) => {
  return (
    <Link
      state="protected-call-update"
      params={{ call_uuid: row.uuid }}
      className="btn btn-primary"
    >
      <i className="fa fa-edit" />
      <span>{translate('Edit')}</span>
    </Link>
  );
};
