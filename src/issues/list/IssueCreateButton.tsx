import { PlusCircle } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';

import { openIssueCreateDialog } from '../create/actions';
import { ISSUE_CREATION_FORM_ID } from '../create/constants';

interface IssueCreateButtonProps {
  scope: any;
  refetch: () => void;
}

export const IssueCreateButton: FunctionComponent<IssueCreateButtonProps> = ({
  scope,
  refetch,
}) => {
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(
      openIssueCreateDialog(
        { issue: { scope }, refetch },
        ISSUE_CREATION_FORM_ID,
      ),
    );
  };

  return (
    <ActionButton
      title={translate('Create')}
      action={handleClick}
      iconNode={<PlusCircle />}
      variant="primary"
    />
  );
};
