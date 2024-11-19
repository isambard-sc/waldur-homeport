import { Trash } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { Panel } from '@waldur/core/Panel';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { isDescendantOf } from '@waldur/navigation/useTabs';
import { useNotify } from '@waldur/store/hooks';
import { UserDetails } from '@waldur/workspace/types';

import { deleteUser } from './api';
import { TermsOfService } from './TermsOfService';

export const UserDelete = ({ user }: { user: UserDetails }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { showErrorResponse, showSuccess } = useNotify();
  const [isLoading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleDeleteUser = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete {name}?',
          { name: <strong>{user.full_name}</strong> },
          formatJsxTemplate,
        ),
        true,
      );
    } catch {
      // swallow
      return;
    }
    try {
      setLoading(true);
      await deleteUser(user.uuid);
      queryClient.setQueryData(['UserDetails', user.uuid], undefined);
      showSuccess(translate('User has been deleted.'));
      if (isDescendantOf('marketplace-provider', router.globals.current)) {
        router.stateService.go('marketplace-provider-users');
      } else {
        router.stateService.go('admin-user-users');
      }
    } catch (error) {
      showErrorResponse(error, translate('Unable to delete user.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Panel
      title={translate('Delete account')}
      className="mb-5"
      cardBordered
      actions={
        <Button
          variant="light-danger"
          onClick={handleDeleteUser}
          disabled={isLoading}
        >
          <span className="svg-icon svg-icon-2">
            <Trash weight="bold" />
          </span>
          {translate('Delete')}
        </Button>
      }
    >
      <ul className="text-grey-500 mb-7">
        {user.agreement_date && (
          <li>
            <TermsOfService agreementDate={user.agreement_date} />
          </li>
        )}
        <li>{translate('Permanently delete user account.')}</li>
        <li>{translate('This action cannot be undone.')}</li>
      </ul>
    </Panel>
  );
};
