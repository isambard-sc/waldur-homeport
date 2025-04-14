import Markdown from 'markdown-to-jsx';
import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { UserAgreement } from 'waldur-js-client';

export const UserAgreementsExpandableRow: FunctionComponent<{
  row: UserAgreement;
}> = ({ row }) => (
  <Row>
    <Col sm={8}>
      <Markdown>{row.content}</Markdown>
    </Col>
  </Row>
);
