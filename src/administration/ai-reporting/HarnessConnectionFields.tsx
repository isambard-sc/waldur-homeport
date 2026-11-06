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

/**
 * Where Waldur reaches the AI reporting harness, and the key it signs
 * requests with - same shape as FormbricksConnectionCard for the same kind
 * of value (an internal service's connection details, editable through the
 * API rather than baked into deployment settings). Rendered as the
 * "Connection" tab's content in AIReportingSettings.tsx, not its own card -
 * SettingsWithTabs already gives the tab its own card and title, so adding
 * another one here would just repeat the "Connection" heading inside a
 * second border, the same reasoning AdministrationSoftwareCatalog.tsx's own
 * settings tabs follow.
 *
 * The signing key is never sent back by the API, only whether one is set;
 * leaving it blank when saving keeps whatever is already stored, and an
 * explicit empty value clears it (turning signing back off). The harness
 * itself only starts requiring a signature once its own
 * WALDUR_SIGNING_PUBLIC_KEY is configured, so this can be left unset
 * indefinitely with no effect on whether AI reporting works.
 */
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
            'Optional. Signs every request to the harness so it can verify the request genuinely came from Waldur. Leave unset to send requests unsigned - AI reporting works the same either way. It is never shown again once saved.',
          )}
          disabled={!canEdit}
          renderValue={() => secretState(connection.signing_private_key_set)}
        />
      </FormTable>
    </EditFieldProvider>
  );
};
