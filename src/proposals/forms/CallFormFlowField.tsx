import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  formFlowsList,
  proposalFormCallsRetrieve,
  proposalFormCallsUpdate,
} from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { EditFieldProvider, SelectEditField } from '@/form/editFields';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { isProposalFormsEnabled } from './proposalForms';

const BUILT_IN_FORM = translate('Built-in proposal form');

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

  const options = useMemo(
    () => [
      { value: null, label: BUILT_IN_FORM },
      ...(flows ?? []).map((flow) => ({ value: flow.uuid, label: flow.name })),
    ],
    [flows],
  );

  const { mutateAsync: saveFlow } = useManagedMutation({
    mutationFn: ({ flow }: { flow: string | null }) =>
      proposalFormCallsUpdate({ path: { uuid: callUuid }, body: { flow } }),
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

  return (
    <EditFieldProvider
      scope={{ flow: callFlow?.flow ?? null }}
      callback={saveFlow}
      readOnlyReason={readOnlyReason}
    >
      <SelectEditField
        name="flow"
        label={translate('Application form')}
        description={translate(
          'Applicants either fill in the built-in proposal form or answer a form flow: a chain of Formbricks surveys. Cannot be changed once the call has proposals.',
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
    </EditFieldProvider>
  );
};
