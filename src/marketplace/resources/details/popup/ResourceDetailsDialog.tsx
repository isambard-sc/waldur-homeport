import { CopySimple } from '@phosphor-icons/react';
import { FC } from 'react';
import { Tab, Tabs } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { MetronicModalDialog } from '@waldur/modal/MetronicModalDialog';
import { ActionDialogProps } from '@waldur/resource/actions/types';

import { ResourceDetailsTable } from './ResourceDetailsTable';

export const ResourceDetailsDialog: FC<ActionDialogProps> = ({
  resolve: { resource },
}) => {
  return (
    <MetronicModalDialog
      title={translate('Resource details')}
      subtitle={translate('Key information about the resource.')}
      closeButton
      iconNode={<CopySimple weight="bold" />}
      iconColor="success"
      bodyClassName="min-h-350px"
    >
      <Tabs defaultActiveKey={1} unmountOnExit={true} className="nav-line-tabs">
        <Tab eventKey={1} title={translate('Details')}>
          <ResourceDetailsTable resource={resource} />
        </Tab>
      </Tabs>
    </MetronicModalDialog>
  );
};
