import { FunctionComponent } from 'react';
import { Accordion } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { ReactComponent } from './BackupScheduleWarning.md';

export const BackupScheduleWarning: FunctionComponent = () => (
  <Accordion id="backup-schedule-message">
    <Accordion.Item eventKey="0">
      <Accordion.Header>
        <i className="fa fa-warning" />{' '}
        {translate('VM snapshot schedule caveats')}
      </Accordion.Header>
      <Accordion.Body>
        <ReactComponent />
      </Accordion.Body>
    </Accordion.Item>
  </Accordion>
);
