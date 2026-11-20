import { FC, useMemo } from 'react';
import { Field, useFormState } from 'react-final-form';
import {
  ProposalStatesEnum,
  proposalProtectedCallsList,
  proposalProtectedCallsRoundsList,
} from 'waldur-js-client';

import { Checkbox } from 'waldur-ui';

import { AsyncSelectGroup, BooleanGroup, FormGroup } from '@/form';
import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { formatProposalState } from '@/proposals/utils';

import { BroadcastFormData } from './types';
import { PROPOSAL_STATES } from './utils';

/** The rounds of one call, filtered by the text typed. */
const roundsOf = (callUuid: string) => async (query: string) => {
  const { data } = await proposalProtectedCallsRoundsList({
    path: { uuid: callUuid },
  });
  const text = (query || '').toLowerCase();
  return {
    options: data
      .filter((round) => round.name.toLowerCase().includes(text))
      .map((round) => ({ uuid: round.uuid, name: round.name })),
    hasMore: false,
  };
};

/**
 * Sends the message to proposal rounds: their proposals' teams, their
 * reviewers, or both, narrowed to proposals in some states (drafts, to
 * remind those who have not submitted). Rounds are picked a call at a time;
 * rounds of an earlier call stay picked when another is chosen.
 */
export const RoundTargetFields: FC = () => {
  const { values } = useFormState<BroadcastFormData>({
    subscription: { values: true },
  });
  const loadCalls = useMemo(
    () => createLoadOptions(proposalProtectedCallsList, 'name'),
    [],
  );
  const callUuid = values.round_call?.uuid;
  const loadRounds = useMemo(
    () => (callUuid ? roundsOf(callUuid) : undefined),
    [callUuid],
  );
  const hasRounds = Boolean(values.rounds?.length);

  return (
    <>
      <AsyncSelectGroup
        label={translate('Call')}
        description={translate('Pick a call to choose its rounds.')}
        name="round_call"
        placeholder={translate('Select call...')}
        loadOptions={loadCalls}
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.uuid}
        noOptionsMessage={() => translate('No calls found')}
      />
      <AsyncSelectGroup
        // Remounted per call, so its options are that call's rounds.
        key={callUuid || 'no-call'}
        label={translate('Proposal rounds')}
        description={translate('Send to the proposals of these rounds.')}
        name="rounds"
        placeholder={
          callUuid
            ? translate('Select rounds...')
            : translate('Select a call first')
        }
        loadOptions={loadRounds}
        isDisabled={!callUuid}
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.uuid}
        noOptionsMessage={() => translate('No rounds found')}
        isMulti={true}
      />
      {hasRounds && (
        <>
          <FormGroup
            label={translate('Proposal states')}
            description={translate(
              'Only proposals in these states. None ticked means all.',
            )}
          >
            <Field<ProposalStatesEnum[]> name="proposal_states">
              {({ input }) => (
                <div className="d-flex flex-column gap-8px">
                  {PROPOSAL_STATES.map((state) => {
                    const selected = input.value || [];
                    return (
                      <Checkbox
                        key={state}
                        label={formatProposalState(state)}
                        checked={selected.includes(state)}
                        onCheckedChange={(checked) =>
                          input.onChange(
                            checked
                              ? [...selected, state]
                              : selected.filter((item) => item !== state),
                          )
                        }
                      />
                    );
                  })}
                </div>
              )}
            </Field>
          </FormGroup>
          <BooleanGroup
            name="proposal_teams"
            label={translate('Proposal teams')}
            hideLabel
          />
          <BooleanGroup
            name="reviewers"
            label={translate('Reviewers of these proposals')}
            hideLabel
          />
        </>
      )}
    </>
  );
};
