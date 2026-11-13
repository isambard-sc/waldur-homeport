import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { Badge } from 'waldur-ui';

import {
  HarnessConnection,
  PatchedHarnessConnectionRequest,
  fetchHarnessConnection,
  updateHarnessConnection,
} from '@/ai-reporting/harnessConnectionApi';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import {
  EditFieldProvider,
  SecretEditField,
  StringEditField,
} from '@/form/editFields';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { isStaff } from '@/workspace/selectors';

export const HARNESS_CONNECTION_QUERY_KEY = ['HarnessConnection'];

const STAFF_ONLY = translate(
  'Only staff can change the AI reporting harness connection.',
);

const secretState = (isSet: boolean) =>
  isSet ? (
    <Badge variant="success" shape="pill">
      {translate('Set')}
    </Badge>
  ) : (
    <Badge variant="neutral" shape="pill">
      {translate('Not set')}
    </Badge>
  );

/** The Connection tab: the harness URL and the key Waldur signs requests
 * with. The key is never returned by the API, only whether one is set. */
export const HarnessConnectionFields = () => {
  const canEdit = useSelector(isStaff);
  const queryClient = useQueryClient();

  const {
    data: connection,
    isLoading,
    error,
    refetch,
  } = useQuery<HarnessConnection>({
    queryKey: HARNESS_CONNECTION_QUERY_KEY,
    queryFn: fetchHarnessConnection,
  });

  const { mutateAsync: update } = useManagedMutation({
    mutationFn: (body: PatchedHarnessConnectionRequest) =>
      updateHarnessConnection(body),
    successMessage: translate(
      'The AI reporting harness connection has been updated.',
    ),
    errorMessage: translate(
      'Unable to update the AI reporting harness connection.',
    ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: HARNESS_CONNECTION_QUERY_KEY,
      });
    },
    closeModal: false,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error || !connection) {
    return (
      <LoadingErred
        message={translate(
          'Unable to load the AI reporting harness connection.',
        )}
        loadData={refetch}
      />
    );
  }

  return (
    <EditFieldProvider
      scope={connection}
      callback={update}
      readOnlyReason={canEdit ? undefined : STAFF_ONLY}
    >
      <FormTable>
        <StringEditField
          name="base_url"
          label={translate('Harness URL')}
          description={translate(
            'In-cluster address of the AI reporting harness. Defaults to the standard address the harness is deployed at; only change this if it has moved.',
          )}
          disabled={!canEdit}
        />
        <SecretEditField
          name="signing_private_key"
          label={translate('Signing private key')}
          description={translate(
            'Signs every request so the harness can check it came from Waldur. Required: the harness rejects unsigned requests. It is never shown again once saved.',
          )}
          disabled={!canEdit}
          renderValue={() => secretState(connection.signing_private_key_set)}
        />
      </FormTable>
    </EditFieldProvider>
  );
};
