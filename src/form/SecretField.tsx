import classNames from 'classnames';
import React from 'react';
import { Form } from 'react-bootstrap';
import { useToggle } from 'react-use';

import { translate } from '@waldur/i18n';

import { FormField } from './types';

import './SecretField.scss';

interface SecretFieldProps extends FormField {
  placeholder?: string;
  maxLength?: number;
}

export const SecretField: React.FC<SecretFieldProps> = (props) => {
  const [showSecret, onToggle] = useToggle(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { input, label, validate, ...rest } = props;
  const iconClass = classNames('fa password-icon', {
    'fa-eye-slash': showSecret,
    'fa-eye': !showSecret,
  });

  return (
    <div className="has-password">
      <Form.Control
        {...props.input}
        type={showSecret ? 'text' : 'password'}
        autoComplete="new-password"
        placeholder={props.placeholder}
        className="form-control-solid"
        {...rest}
      />
      <a
        className={iconClass}
        title={showSecret ? translate('Hide') : translate('Show')}
        onClick={onToggle}
      />
    </div>
  );
};
