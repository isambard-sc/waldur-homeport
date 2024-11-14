import { FC } from 'react';
import { Validator } from 'redux-form';

import { useTheme } from '@waldur/theme/useTheme';

import { MonacoEditor } from './MonacoEditor';

interface MonacoFieldProps {
  name?: string;
  label?: string;
  required?: boolean;
  description?: string;
  validate?: Validator;
  input?: { value; onChange };
  diff?: boolean;
  language?: string;
  height?: number;
  width?: number;
  original?: string;
  options?: any;
  readOnly?: boolean;
}

const getTheme = (): string => {
  const { theme } = useTheme();
  return theme === 'dark' ? 'vs-dark' : 'vs-light';
};

export const MonacoField: FC<MonacoFieldProps> = ({
  height = 600,
  ...props
}) => (
  <MonacoEditor
    language={props.language}
    value={props.input.value}
    onChange={props.input.onChange}
    readOnly={props.readOnly}
    theme={getTheme()}
    height={height}
  />
);
