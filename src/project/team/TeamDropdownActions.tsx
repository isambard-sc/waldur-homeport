import { CaretDown, PlusCircle } from '@phosphor-icons/react';
import { Dropdown } from 'react-bootstrap';
import { Project } from 'waldur-js-client';

import { ServiceAccountCreateButton } from '@waldur/customer/service-accounts/ServiceAccountCreateAction';
import { translate } from '@waldur/i18n';
import { InvitationCreateButton } from '@waldur/invitations/actions/create/InvitationCreateButton';

import { AddUserButton } from './AddUserButton';

interface TeamDropdownActionsProps {
  project: Project;
  refetch?(): void;
}

export const TeamDropdownActions = ({
  project,
  refetch,
}: TeamDropdownActionsProps) => {
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
          project={project}
          roleTypes={['project']}
          refetch={refetch}
          enableBulkUpload={true}
        />
        <AddUserButton project={project} refetch={refetch} />
        <ServiceAccountCreateButton
          context="project"
          scope={project}
          refetch={refetch}
        />
      </Dropdown.Menu>
    </Dropdown>
  );
};
