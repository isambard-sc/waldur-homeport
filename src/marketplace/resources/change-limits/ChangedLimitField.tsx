import { FunctionComponent } from 'react';

interface ChangedLimitFieldProps {
  changedLimit: number;
}

export const ChangedLimitField: FunctionComponent<ChangedLimitFieldProps> = ({
  changedLimit,
}) => (
  <span
    style={{
      color: changedLimit < 0 ? 'red' : changedLimit > 0 ? 'green' : 'inherit',
    }}
  >
    {changedLimit}
  </span>
);
