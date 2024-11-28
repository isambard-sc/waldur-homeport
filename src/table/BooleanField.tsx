import { Check, Minus } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

interface BooleanFieldProps {
  value: boolean;
}

export const BooleanField: FunctionComponent<BooleanFieldProps> = ({
  value,
}) => (
  <span className="svg-icon svg-icon-5">{value ? <Check /> : <Minus />}</span>
);
