import { DropdownButton, DropdownDivider } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { getUser } from '@waldur/workspace/selectors';

import { Resource } from '../types';

import { MultiDestroyAction } from './MultiDestroyAction';
import { MultiMoveAction } from './MultiMoveAction';
import { MultiPullAction } from './MultiPullAction';
import { MultiRestartAction } from './MultiRestartAction';
import { MultiSetErredAction } from './MultiSetErredAction';
import { MultiStartAction } from './MultiStartAction';
import { MultiStopAction } from './MultiStopAction';
import { MultiUnlinkAction } from './MultiUnlinkAction';

export const ResourceMultiSelectAction = ({
  rows,
  refetch,
}: {
  rows: Resource[];
  refetch(): void;
}) => {
  const user = useSelector(getUser);
  return (
    <DropdownButton variant="primary" title={translate('All actions')}>
      <MultiStopAction rows={rows} refetch={refetch} />
      <MultiStartAction rows={rows} refetch={refetch} />
      <MultiRestartAction rows={rows} refetch={refetch} />
      <MultiPullAction rows={rows} refetch={refetch} />
      <MultiMoveAction rows={rows} refetch={refetch} />
      <DropdownDivider className="border-top m-0" />
      <MultiDestroyAction rows={rows} refetch={refetch} />
      {user.is_staff && (
        <>
          <DropdownDivider className="border-top m-0" />
          <MultiSetErredAction rows={rows} refetch={refetch} />
          <MultiUnlinkAction rows={rows} refetch={refetch} />
        </>
      )}
    </DropdownButton>
  );
};
