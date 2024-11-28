import { Warning } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Accordion } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { ReactComponent } from './BackupScheduleWarning.md';

export const BackupScheduleWarning: FunctionComponent = () => (
  <Accordion id="backup-schedule-message">
    <Accordion.Item eventKey="0">
      <Accordion.Header>
        <span className="svg-icon svg-icon-2">
          <Warning />
        </span>{' '}
        {translate('VM snapshot schedule caveats')}
      </Accordion.Header>
      <Accordion.Body>
        <ReactComponent />
      </Accordion.Body>
    </Accordion.Item>
  </Accordion>
);
