import { Trash } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FunctionComponent, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import { ENV } from '@waldur/configs/default';
import { CancelButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { createIssue } from '@waldur/issues/api';
import { ISSUE_IDS } from '@waldur/issues/types/constants';
import { useModal } from '@waldur/modal/hooks';
import { MetronicModalDialog } from '@waldur/modal/MetronicModalDialog';
import { useNotify } from '@waldur/store/hooks';

interface UserRemovalMessageDialogProps {
  resolve: {
    userName: string;
  };
}

export const UserRemovalMessageDialog: FunctionComponent<
  UserRemovalMessageDialogProps
> = (props) => {
  const {
    resolve: { userName },
  } = props;
  const router = useRouter();
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();
  const [reason, setReason] = useState('');
  const handleSubmit = async () => {
    try {
      const issue = await createIssue({
        type: ISSUE_IDS.CHANGE_REQUEST,
        description: reason,
        summary: translate('Account deletion'),
        is_reported_manually: true,
      });
      showSuccess(translate('Request for account deletion has been created.')),
        router.stateService.go('support.detail', { uuid: issue.uuid });
      closeDialog();
    } catch (e) {
      showErrorResponse(e, translate('Unable to create request.'));
    }
  };

  return ENV.plugins.WALDUR_SUPPORT.ENABLED ? (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      <MetronicModalDialog
        title={translate('Account deletion')}
        subtitle={translate(
          'Why would you want to go away? Help us become better please!',
        )}
        iconNode={<Trash weight="bold" />}
        iconColor="danger"
        bodyClassName="text-grey-500 pt-2"
        footer={
          <>
            <Button
              variant="outline btn-outline-default"
              className="flex-equal"
              onClick={closeDialog}
            >
              {translate('Cancel')}
            </Button>
            <Button variant="light-danger" className="flex-equal" type="submit">
              {translate('Delete')}
            </Button>
          </>
        }
      >
        <Form.Group className="my-5">
          <Form.Control
            as="textarea"
            className="form-control-solid"
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </Form.Group>
      </MetronicModalDialog>
    </form>
  ) : (
    <MetronicModalDialog
      title={translate('Request account removal for {userName}.', {
        userName,
      })}
      iconNode={<Trash weight="bold" />}
      iconColor="danger"
      bodyClassName="text-grey-500 pt-2"
      footer={<CancelButton label={translate('OK')} />}
    >
      <p>
        {translate('To remove account, please send a request to {support}.', {
          support: ENV.plugins.WALDUR_CORE.SITE_EMAIL || translate('support'),
        })}
      </p>
      <p>
        {translate(
          'Please note that request should specify user name and provide a reason.',
        )}
      </p>
    </MetronicModalDialog>
  );
};
