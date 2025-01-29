import classNames from 'classnames';
import { FunctionComponent } from 'react';
import { FormControl } from 'react-bootstrap';

import { FormField } from './types';

interface InputFieldProps extends FormField {
  className?: string;
  solid?: boolean;
}

export const InputField: FunctionComponent<InputFieldProps> = ({
  input,
  className,
  solid,
  ...props
}) => (
  <FormControl
    className={classNames(solid && 'form-control-solid', className)}
    placeholder="  "
    {...input}
    {...props}
  />
);
