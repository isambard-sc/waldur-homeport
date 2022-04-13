import { FunctionComponent } from 'react';
import { Col, Form } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { EnvironmentVariableAddButton } from './EnvironmentVariableAddButton';
import { EnvironmentVariablePanel } from './EnvironmentVariablePanel';

export const EnvironmentVariablesList: FunctionComponent<any> = (props) => (
  <Form.Group>
    <Col sm={{ span: 8, offset: 2 }} className="mb-2">
      <p>
        <strong>{translate('Environment variables')}</strong>
      </p>
    </Col>

    <Col smOffset={2} sm={8}>
      {props.fields.map((variable, index) => (
        <EnvironmentVariablePanel
          key={index}
          variable={variable}
          index={index}
          onRemove={props.fields.remove}
        />
      ))}
      <EnvironmentVariableAddButton onClick={() => props.fields.push({})} />
    </Col>
  </Form.Group>
);
