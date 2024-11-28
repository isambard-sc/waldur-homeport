import { PublicCallsList } from '@waldur/proposals/PublicCallsList';

export const ProviderCallsTab = (props) => {
  return (
    <PublicCallsList provider_uuid={props.provider_uuid} offering_uuid={null} />
  );
};
