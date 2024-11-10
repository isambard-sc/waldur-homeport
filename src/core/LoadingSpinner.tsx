import { Spinner } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

export const LoadingSpinnerIcon = ({ className }: { className? }) => (
  <Spinner
    className={'animation-spin ' + (className || '')}
    data-testid="spinner"
  />
);

export const LoadingSpinner: FunctionComponent = () => (
  <h1 className="text-center">
    <LoadingSpinnerIcon />
  </h1>
);
