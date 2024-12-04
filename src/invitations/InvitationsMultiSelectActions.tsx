import { DropdownButton } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { useUser } from '@waldur/workspace/hooks';

import { MultiCancelAction } from './MultiCancelAction';
import { MultiDeleteAction } from './MultiDeleteAction';
import { MultiResendAction } from './MultiResendAction';
import { Invitation } from './types';

export const InvitationsMultiSelectActions = ({
  rows,
  refetch,
}: {
  rows: Invitation[];
  refetch(): void;
}) => {
  const user = useUser();
  return (
    <DropdownButton variant="primary" title={translate('All actions')}>
      <MultiResendAction rows={rows} refetch={refetch} />
      <MultiCancelAction rows={rows} refetch={refetch} />
      {user.is_staff && <MultiDeleteAction rows={rows} refetch={refetch} />}
    </DropdownButton>
  );
};
