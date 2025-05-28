import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { ProjectUsersList } from '@waldur/project/team/ProjectUsersList';

export const ResourceTeamDialog = ({ resolve }) => {
  return (
    <ModalDialog
      title={translate('Team')}
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      <ProjectUsersList
        hideTabs={true}
        projectUuid={resolve.resource?.project_uuid}
        customerUuid={resolve.resource?.customer_uuid}
      />
    </ModalDialog>
  );
};
