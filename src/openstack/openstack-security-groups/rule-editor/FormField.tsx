import { Question } from '@phosphor-icons/react';
import { FC } from 'react';
import { Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { WrappedFieldProps } from 'redux-form';

export const FormField: FC<WrappedFieldProps & { tooltip?: string }> = ({
  input,
  meta: { error },
  tooltip,
  ...rest
}) => (
  <Form.Group as="td" style={{ position: 'relative' }}>
    <Form.Control
      value={input.value}
      onChange={input.onChange}
      {...rest}
      title={error}
      isInvalid={!!error}
    />
    {tooltip ? (
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id={input.name}>{tooltip}</Tooltip>}
      >
        <span style={{ position: 'absolute', right: 20, top: 20 }}>
          <Question />
        </span>
      </OverlayTrigger>
    ) : null}
  </Form.Group>
);
