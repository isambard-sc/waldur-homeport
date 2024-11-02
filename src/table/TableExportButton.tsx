import { Export } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { TableProps } from './types';
import { useExportDialog } from './useExportDialog';

export const TableExportButton: FunctionComponent<TableProps> = (props) => {
  const openExportDialog = useExportDialog();
  return (
    <Button
      variant="outline-default"
      className="btn-outline"
      onClick={() => openExportDialog(props.table, 'clipboard', props)}
      disabled={props.rows?.length === 0}
    >
      <span className="svg-icon svg-icon-1">
        <Export weight="bold" />
      </span>
      {translate('Export')}
    </Button>
  );
};
