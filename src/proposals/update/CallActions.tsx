import { FC, useCallback } from 'react';
import { DropdownButton, Dropdown, Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  proposalProtectedCallsActivate,
  proposalProtectedCallsArchive,
} from 'waldur-js-client';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

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
  const dispatch = useDispatch();
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
        if (state === 'activate') {
          proposalProtectedCallsActivate({ path: { uuid: call.uuid } });
        } else if (state === 'archive') {
          proposalProtectedCallsArchive({ path: { uuid: call.uuid } });
        }
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
    : null;

  if (call.state === 'draft') {
    return (
      <DropdownButton title={translate('Actions')} className={className}>
        {getCallStateActions()
          .filter((state) => state.value !== call.state)
          .map((state, i) => {
            const isDisabled = state.action === 'activate' && !hasRounds;

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
          disabled={!hasRounds}
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
