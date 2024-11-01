import { FC } from 'react';
import { useSelector } from 'react-redux';
import { Validator } from 'redux-form';

import { RootState } from '@waldur/store/reducers';

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
}

const getTheme = (): string => {
  const theme = useSelector((state: RootState) => state.theme?.theme);
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
    theme={getTheme()}
    height={height}
  />
);
