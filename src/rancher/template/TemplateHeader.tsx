import Markdown from 'markdown-to-jsx';
import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';

export const TemplateHeader: FunctionComponent<any> = (props) => (
  <Row>
    <Col md={3}>
      <OfferingLogo src={props.template.icon} />
    </Col>
    <Col md={9}>
      <Markdown>{props.version.app_readme}</Markdown>
    </Col>
  </Row>
);
