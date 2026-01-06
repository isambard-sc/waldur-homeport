import { FileArrowUpIcon } from '@phosphor-icons/react';
import React from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { ProtectedRound } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { Call } from '@waldur/proposals/types';

interface ImportAssignmentsButtonProps {
  round: ProtectedRound;
  call: Call;
  refetch(): void;
}

const ImportAssignmentsDialog = lazyComponent(() =>
  import('./ImportAssignmentsDialog').then((module) => ({
    default: module.ImportAssignmentsDialog,
  })),
);

export const ImportAssignmentsButton: React.FC<
  ImportAssignmentsButtonProps
> = (props) => {
  const dispatch = useDispatch();

  return (
    <Button
      variant="light"
      size="sm"
      onClick={() => dispatch(openModalDialog(ImportAssignmentsDialog, props))}
    >
      <span className="svg-icon svg-icon-2">
        <FileArrowUpIcon weight="bold" />
      </span>
      {translate('Import assignments')}
    </Button>
  );
};
