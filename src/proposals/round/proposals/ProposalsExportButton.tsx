import { FileXlsIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

const ProposalsExportDialog = lazyComponent(() =>
  import('./ProposalsExportDialog').then((module) => ({
    default: module.ProposalsExportDialog,
  })),
);

interface ProposalsExportButtonProps {
  roundUuid: string;
}

export const ProposalsExportButton: FC<ProposalsExportButtonProps> = ({
  roundUuid,
}) => {
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(
      openModalDialog(ProposalsExportDialog, {
        resolve: { roundUuid },
        size: 'md',
      }),
    );
  };

  return (
    <Button variant="secondary" onClick={handleClick}>
      <FileXlsIcon size={16} weight="bold" className="me-2" />
      {translate('Export to Excel')}
    </Button>
  );
};
