import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  formFlowsList,
  proposalFormCallsRetrieve,
  proposalFormCallsUpdate,
} from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import {
  EditFieldProvider,
  NumberEditField,
  SelectEditField,
} from '@/form/editFields';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { isProposalFormsEnabled } from './proposalForms';

const BUILT_IN_FORM = translate('Built-in proposal form only');
const NO_CLOSING_FORMS = translate("None (the site's, if it has one)");

/** A whole number of days, 0 or more. */
export const validateOpenDays = (value: any) => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0
    ? undefined
    : translate('Enter a whole number of days, 0 or more.');
};

export const callFormFlowQueryKey = (callUuid: string) => [
  'CallFormFlow',
  callUuid,
];

interface CallFormFlowFieldProps {
  callUuid: string;
  /** Why the call cannot be changed at all, if it cannot. */
  readOnlyReason?: string;
  refetch?(): void;
}

/**
 * The call's choice of form flow, as a row of the call's configuration.
 *
 * Saved through the call's own form-flow endpoint rather than with the rest
 * of the call, hence a provider of its own. Read-only once the call has
 * proposals: their answers belong to the flow they were given in. Shown only
 * while the site has form flows switched on.
 */
export const CallFormFlowField = (props: CallFormFlowFieldProps) =>
  isProposalFormsEnabled() ? <CallFormFlowSelect {...props} /> : null;

const CallFormFlowSelect = ({
  callUuid,
  readOnlyReason,
  refetch,
}: CallFormFlowFieldProps) => {
  const queryClient = useQueryClient();

  const { data: callFlow } = useQuery({
    queryKey: callFormFlowQueryKey(callUuid),
    queryFn: () =>
      proposalFormCallsRetrieve({ path: { uuid: callUuid } }).then(
        (response) => response.data,
      ),
  });

  const { data: flows } = useQuery({
    queryKey: ['FormFlows'],
    queryFn: () => getAllPages((page) => formFlowsList({ query: { page } })),
    refetchOnWindowFocus: false,
  });

  // Each picker offers only the flows made for it: the backend refuses
  // the others.
  const options = useMemo(
    () => [
      { value: null, label: BUILT_IN_FORM },
      ...(flows ?? [])
        .filter((flow) => (flow.purpose ?? 'application') === 'application')
        .map((flow) => ({ value: flow.uuid, label: flow.name })),
    ],
    [flows],
  );
  const closingOptions = useMemo(
    () => [
      { value: null, label: NO_CLOSING_FORMS },
      ...(flows ?? [])
        .filter((flow) => flow.purpose === 'closing')
        .map((flow) => ({ value: flow.uuid, label: flow.name })),
    ],
    [flows],
  );

  // A full update: whatever is not being changed is sent as it stands, so
  // saving one choice never clears another.
  const { mutateAsync: saveFlow } = useManagedMutation({
    mutationFn: (changes: {
      flow?: string | null;
      closing_flow?: string | null;
      closing_forms_open_days_before_end?: number | string;
    }) =>
      proposalFormCallsUpdate({
        path: { uuid: callUuid },
        body: {
          flow: 'flow' in changes ? changes.flow : (callFlow?.flow ?? null),
          closing_flow:
            'closing_flow' in changes
              ? changes.closing_flow
              : (callFlow?.closing_flow ?? null),
          closing_forms_open_days_before_end: Number(
            ('closing_forms_open_days_before_end' in changes
              ? changes.closing_forms_open_days_before_end
              : callFlow?.closing_forms_open_days_before_end) || 0,
          ),
        },
      }),
    successMessage: translate('The call has been updated.'),
    errorMessage: translate('Unable to change the application form.'),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: callFormFlowQueryKey(callUuid),
      });
      refetch?.();
    },
    closeModal: false,
  });

  const locked = Boolean(callFlow?.locked);
  const closingLocked = Boolean(callFlow?.closing_locked);

  return (
    <EditFieldProvider
      scope={{
        flow: callFlow?.flow ?? null,
        closing_flow: callFlow?.closing_flow ?? null,
        closing_forms_open_days_before_end:
          callFlow?.closing_forms_open_days_before_end ?? 0,
      }}
      callback={saveFlow}
      readOnlyReason={readOnlyReason}
    >
      <SelectEditField
        name="flow"
        label={translate('Application form')}
        description={translate(
          "Applicants fill in Waldur's proposal form, and with a form flow also its Formbricks forms. Cannot be changed once the call has proposals.",
        )}
        options={options}
        simpleValue
        isClearable={false}
        disabled={!callFlow || locked || Boolean(readOnlyReason)}
        tooltip={
          locked && !readOnlyReason
            ? translate(
                'The call has proposals, which were made with this form.',
              )
            : undefined
        }
        renderValue={() => callFlow?.flow_name || BUILT_IN_FORM}
      />
      <SelectEditField
        name="closing_flow"
        label={translate('End-of-project forms')}
        description={translate(
          "Forms the PI of each project granted through the call fills in near its end date. Without one, the site's end-of-project forms apply, if it has any. Cannot be changed once a project has started them.",
        )}
        options={closingOptions}
        simpleValue
        isClearable={false}
        disabled={!callFlow || closingLocked || Boolean(readOnlyReason)}
        tooltip={
          closingLocked && !readOnlyReason
            ? translate('A project of the call has started these forms.')
            : undefined
        }
        renderValue={() => callFlow?.closing_flow_name || NO_CLOSING_FORMS}
      />
      {callFlow?.closing_flow && (
        <NumberEditField
          name="closing_forms_open_days_before_end"
          label={translate('End-of-project forms open')}
          description={translate(
            "How many days before a project's end date its forms open; 0 is on the end date. They stay open afterwards.",
          )}
          disabled={Boolean(readOnlyReason)}
          validate={validateOpenDays}
          renderValue={(value) =>
            Number(value)
              ? translate('{days} days before the end date', { days: value })
              : translate('On the end date')
          }
        />
      )}
    </EditFieldProvider>
  );
};
