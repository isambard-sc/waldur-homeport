import { CaretDown, PlusCircle } from '@phosphor-icons/react';
import { Dropdown } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { InvitationCreateButton } from '@waldur/invitations/actions/create/InvitationCreateButton';
import { GroupInvitationCreateButton } from '@waldur/invitations/actions/GroupInvitationCreateButton';

import { UserAddButton } from './UserAddButton';

interface TeamDropdownActionsProps {
  refetch?(): void;
}

export const TeamDropdownActions = ({ refetch }: TeamDropdownActionsProps) => {
  return (
    <Dropdown placement="bottom-end">
      <Dropdown.Toggle variant="primary" className="no-arrow btn-icon-right">
        <span className="svg-icon svg-icon-2">
          <PlusCircle weight="bold" />
        </span>
        {translate('Add')}
        <span className="svg-icon svg-icon-2 rotate-180">
          <CaretDown weight="bold" />
        </span>
      </Dropdown.Toggle>
      <Dropdown.Menu flip>
        <InvitationCreateButton
          roleTypes={['customer', 'project']}
          refetch={refetch}
          enableBulkUpload={true}
        />
        <GroupInvitationCreateButton refetch={refetch} />
        <UserAddButton refetch={refetch} />
      </Dropdown.Menu>
    </Dropdown>
  );
};
