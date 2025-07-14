import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

import { SafeMarkdown } from '@waldur/core/SafeMarkdown';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

export const ProjectClassExpandableRow: FunctionComponent<{
  row: any;
}> = ({ row }) => (
  <ExpandableContainer>
    <Row>
      <Col sm={8}>
        <SafeMarkdown text={row.name} />
      </Col>
    </Row>
  </ExpandableContainer>
);
