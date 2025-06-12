import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { BroadcastMessage } from 'waldur-js-client';

import { SafeMarkdown } from '@waldur/core/SafeMarkdown';

export const BroadcastTemplateExpandableRow: FunctionComponent<{
  row: BroadcastMessage;
}> = ({ row }) => (
  <Row>
    <Col sm={8}>
      <SafeMarkdown text={row.body} />
    </Col>
  </Row>
);
