import Markdown from 'markdown-to-jsx';
import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { BroadcastMessage } from 'waldur-js-client';

export const BroadcastTemplateExpandableRow: FunctionComponent<{
  row: BroadcastMessage;
}> = ({ row }) => (
  <Row>
    <Col sm={8}>
      <Markdown>{row.body}</Markdown>
    </Col>
  </Row>
);
