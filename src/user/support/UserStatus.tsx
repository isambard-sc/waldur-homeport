import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { usersPartialUpdate } from 'waldur-js-client';
import { User } from 'waldur-js-client';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { Panel } from '@waldur/core/Panel';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { useNotify } from '@waldur/store/hooks';

const getConfirmationText = (isActive, name) => {
  return isActive
    ? translate(
        'Are you sure you want to deactivate {name}?',
        { name: <strong>{name}</strong> },
        formatJsxTemplate,
      )
    : translate(
        'Are you sure you want to activate {name}?',
        { name: <strong>{name}</strong> },
        formatJsxTemplate,
      );
};

export const UserStatus = ({ user }: { user: User }) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { showErrorResponse, showSuccess } = useNotify();
  const [isActive, setIsActive] = useState(user.is_active);

  const toggleUserStatus = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        getConfirmationText(user.is_active, user.full_name),
        {
          type: 'danger',
          positiveButton: user.is_active
            ? translate('Deactivate')
            : translate('Activate'),
          negativeButton: translate('Cancel'),
        },
      );
    } catch {
      // swallow
      return;
    }
    try {
      setIsActive(!isActive);
      await usersPartialUpdate({
        path: { uuid: user.uuid },
        body: {
          is_active: !isActive,
        },
      });
      queryClient.setQueryData(['User', user.uuid], (user: User) => ({
        ...user,
        is_active: !isActive,
      }));
      if (isActive) {
        showSuccess(translate('User has been deactivated.'));
      } else {
        showSuccess(translate('User has been activated.'));
      }
    } catch (error) {
      showErrorResponse(error, translate('Unable to toggle user status.'));
    }
  };

  return (
    <Panel
      title={translate('Account status')}
      cardBordered
      actions={
        <AwesomeCheckbox
          value={!isActive}
          onChange={toggleUserStatus}
          label={isActive ? translate('Active') : translate('Deactivated')}
        />
      }
    >
      <ul className="text-gray-500">
        <li>{translate('Temporarily block account')}</li>
        <li>{translate('This action will disable account access')}</li>
        <li>
          {translate(
            'Blocked users are not visible to other non-operator roles',
          )}
        </li>
        <li>{translate('Blocked users cannot login into the system')}</li>
      </ul>
    </Panel>
  );
};
