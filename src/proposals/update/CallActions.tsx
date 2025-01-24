import { useQuery } from '@tanstack/react-query';
import { FC, useCallback } from 'react';
import { DropdownButton, Dropdown, Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { RoleEnum } from '@waldur/permissions/enums';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { getAllCallUsers, updateCallState } from '../api';
import { CALL_REVIEWERS_QUERY_KEY } from '../constants';
import { Call } from '../types';
import { getCallStateActions } from '../utils';

interface CallActionsProps {
  call: Call;
  refetch?(): void;
  className?: string;
}

export const CallActions: FC<CallActionsProps> = ({
  call,
  refetch,
  className,
}) => {
  const { data: reviewers, isLoading: isLoadingReviewers } = useQuery(
    [CALL_REVIEWERS_QUERY_KEY, call.uuid],
    () => getAllCallUsers(call.uuid, RoleEnum.CALL_REVIEWER),
    { staleTime: 3 * 60 * 1000 },
  );

  const dispatch = useDispatch();
  const hasReviewers = reviewers?.length > 0;
  const hasRounds = call.rounds.length > 0;

  const editCallState = useCallback(
    async (state, label: string) => {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Confirmation'),
          translate('Are you sure you want to {action} this call?', {
            action: label.toLowerCase(),
          }),
        );
        await updateCallState(state, call.uuid);
        dispatch(showSuccess(translate('Call state updated.')));
        refetch();
      } catch (er) {
        if (!er) return;
        dispatch(
          showErrorResponse(er, translate('Unable to update call state.')),
        );
      }
    },
    [dispatch, call, refetch],
  );

  const tooltipMessage = !hasRounds
    ? translate('Call must have a round to be activated.')
    : !hasReviewers
      ? translate('Call must have reviewers to be activated.')
      : null;

  if (isLoadingReviewers) {
    return <LoadingSpinner />;
  }

  if (call.state === 'draft') {
    return (
      <DropdownButton title={translate('Actions')} className={className}>
        {getCallStateActions()
          .filter((state) => state.value !== call.state)
          .map((state, i) => {
            const isDisabled =
              state.action === 'activate' && (!hasRounds || !hasReviewers);

            return (
              <Tip
                key={state.value}
                label={state.action === 'activate' ? tooltipMessage : null}
                id={`tooltip-${state.value}`}
                placement="top"
              >
                <Dropdown.Item
                  eventKey={i + 1}
                  onClick={() => editCallState(state.action, state.label)}
                  disabled={isDisabled}
                >
                  {state.label}
                </Dropdown.Item>
              </Tip>
            );
          })}
      </DropdownButton>
    );
  }

  if (call.state === 'archived') {
    return (
      <Tip label={tooltipMessage} id="tooltip-activate" placement="top">
        <Button
          variant="primary"
          onClick={() => editCallState('activate', translate('Activate'))}
          className={className}
          disabled={!hasRounds || !hasReviewers}
        >
          {translate('Activate')}
        </Button>
      </Tip>
    );
  }

  return (
    <Button
      variant="primary"
      onClick={() => editCallState('archive', translate('Archive'))}
      className={className}
    >
      {translate('Archive')}
    </Button>
  );
};
