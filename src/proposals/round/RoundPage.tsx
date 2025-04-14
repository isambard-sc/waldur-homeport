import { FunctionComponent } from 'react';
import { ProtectedRound } from 'waldur-js-client';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { InvalidRoutePage } from '@waldur/error/InvalidRoutePage';
import { translate } from '@waldur/i18n';

import { Call } from '../types';

interface OwnProps {
  call: Call;
  round: ProtectedRound;
  refetch;
  isLoading;
  isRefetching;
  error;
  tabSpec;
}

export const RoundPage: FunctionComponent<OwnProps> = (props) => {
  return props.isLoading ? (
    <LoadingSpinner />
  ) : props.error ? (
    <h3>{translate('Unable to load call round.')}</h3>
  ) : props.round && props.call ? (
    <props.tabSpec.component
      round={props.round}
      call={props.call}
      refetch={props.refetch}
      loading={props.isRefetching}
    />
  ) : (
    <InvalidRoutePage />
  );
};
